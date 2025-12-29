import React, { useState } from "react";
import { ChevronDown, ChevronUp, Paperclip, ArrowUpRight, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/useChatStore";
import { cn } from "@/lib/utils";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";

interface Attachment {
    resource_id: string;
    resource_name: string;
    extension?: string;
    focus?: boolean; // New focus parameter for highlighting important files
	type?: "storage" | "sandbox"; // Type of file: storage (default) or sandbox
	sandbox_id?: string; // Explicit sandbox ID for API calls (only for sandbox files)
}

// Helper to extract extension from filename when not explicitly provided
const getExtension = (file: Attachment): string => {
	if (file.extension) return file.extension;
	const filename = file.resource_name || file.resource_id || "";
	const lastDot = filename.lastIndexOf(".");
	if (lastDot > 0 && lastDot < filename.length - 1) {
		return filename.slice(lastDot + 1);
	}
	return "";
};

interface AttachmentViewerProps {
    files: Attachment[];
    onFileClick?: (file: Attachment) => void;
}

// Inline single attachment component
const InlineAttachment: React.FC<{ file: Attachment; onClick: () => void }> = ({ file, onClick }) => {
	const extension = getExtension(file);
	const config = getFileConfig(extension);
	const isSandbox = file.type === "sandbox";
	
	return (
		<button
			className={cn(
				"group inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer",
				"border shadow-sm hover:shadow-md active:scale-[0.98]",
				"bg-white border-gray-100 hover:border-gray-200",
				file.focus && "ring-2 ring-blue-500/20 border-blue-400",
			)}
			onClick={onClick}
			type="button"
		>
			{/* Icon with colored background */}
			<span className={cn(
				"flex items-center justify-center w-7 h-7 rounded-md transition-transform duration-200 group-hover:scale-105 overflow-hidden",
				config.bg, config.color,
			)}
			>
				<FileIconSvg className="h-4 w-4" iconKey={config.iconKey} />
			</span>
			
			{/* File name */}
			<span className="truncate max-w-[180px] font-medium text-gray-800">
				{file.resource_name || file.resource_id}
			</span>
			
			{/* Extension */}
			{extension && (
				<span className={cn("text-[10px] font-semibold uppercase tracking-wide", config.color)}>
					{extension.replace(".", "")}
				</span>
			)}
			
			{/* Sandbox indicator - just icon */}
			{isSandbox && (
				<Box className={cn("h-3.5 w-3.5", config.color)} />
			)}
			
			<ArrowUpRight className={cn(
				"h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
				config.color.replace("-600", "-400"),
			)} />
		</button>
	);
};

// File card for grid view
const FileCard: React.FC<{ file: Attachment; onClick: () => void }> = ({ file, onClick }) => {
	const extension = getExtension(file);
	const config = getFileConfig(extension);
	const isSandbox = file.type === "sandbox";
	
	return (
		<button
			className={cn(
				"group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left w-full",
				"hover:shadow-md active:scale-[0.99]",
				"bg-white border-gray-100 hover:border-gray-200",
				file.focus && "ring-2 ring-blue-500/20 border-blue-300 shadow-sm",
			)}
			onClick={onClick}
			type="button"
		>
			{/* Colored icon container */}
			<div className={cn(
				"flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-transform duration-200 group-hover:scale-105 overflow-hidden",
				config.bg, config.color,
			)}
			>
				<FileIconSvg className="h-7 w-7" iconKey={config.iconKey} />
			</div>
			
			{/* File info */}
			<div className="flex-1 min-w-0">
				<div className="text-sm truncate font-medium transition-colors duration-200 text-gray-800">
					{file.resource_name || file.resource_id}
				</div>
				<div className="flex items-center gap-1.5 mt-0.5">
					{extension && (
						<span className={cn("text-[10px] font-semibold uppercase tracking-wide", config.color)}>
							{extension.replace(".", "")}
						</span>
					)}
					{/* Sandbox indicator - just icon */}
					{isSandbox && (
						<Box className={cn("h-3 w-3", config.color)} />
					)}
				</div>
			</div>
			
			{/* Hover arrow */}
			<ArrowUpRight className={cn(
				"h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
				config.color.replace("-600", "-300"),
			)} />
		</button>
	);
};

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ files, onFileClick }) => {
	const { setSidePanel, setCollapsed } = useChatStore();
	const [isExpanded, setIsExpanded] = useState(false);

	const handleFileClick = (file: Attachment): void => {
		if (onFileClick) {
			onFileClick(file);
		} else {
			setSidePanel({
				isOpen: true,
				type: file.type === "sandbox"  ? "sandbox" : "sources",
				resourceId: file.resource_id,
				filename: file.resource_name,
				sandbox_id: file.sandbox_id,
			});
			setCollapsed(true);
		}
	};

	if (!files || files.length === 0) return null;

	const sortedFiles = [...files].sort((a, b) => {
		if (a.focus && !b.focus) return -1;
		if (!a.focus && b.focus) return 1;
		
		if (a.type !== "sandbox" && b.type === "sandbox") return -1;
		if (a.type === "sandbox" && b.type !== "sandbox") return 1;
		
		return 0;
	});

	// Single file: render inline
	if (files.length === 1) {
		const file = sortedFiles[0];
		return (
			<div className="my-2">
				<InlineAttachment file={file} onClick={() => handleFileClick(file)} />
			</div>
		);
	}

	// Multiple files: render grid
	const INITIAL_DISPLAY_COUNT = 3;
	const shouldShowExpandButton = files.length > INITIAL_DISPLAY_COUNT;
	const displayedFiles = isExpanded || !shouldShowExpandButton 
		? sortedFiles 
		: sortedFiles.slice(0, INITIAL_DISPLAY_COUNT);

	const hiddenCount = files.length - INITIAL_DISPLAY_COUNT;

	return (
		<div className="my-3">
			{/* Header */}
			<div className="flex items-center gap-2 mb-2.5">
				<div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
					<Paperclip className="h-3.5 w-3.5" />
					<span>{files.length} attachments</span>
				</div>
				
				{shouldShowExpandButton && (
					<Button
						className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600 ml-auto"
						onClick={() => setIsExpanded(!isExpanded)}
						size="sm"
						variant="ghost"
					>
						{isExpanded ? (
							<>
								<ChevronUp className="h-3 w-3 mr-1" />
								Less
							</>
						) : (
							<>
								<ChevronDown className="h-3 w-3 mr-1" />
								+{hiddenCount} more
							</>
						)}
					</Button>
				)}
			</div>			
			
			{/* Grid */}
			<div className={cn(
				"grid gap-2 transition-all duration-300 ease-in-out",
				"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
			)}
			>
				{displayedFiles.map((file, index) => (
					<FileCard 
						file={file} 
						key={`${file.resource_id}-${index}`}
						onClick={() => handleFileClick(file)}
					/>
				))}
			</div>
		</div>
	);
};

export default AttachmentViewer; 