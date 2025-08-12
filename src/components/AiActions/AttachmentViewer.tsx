import React, { useState } from "react";
import { File, FileImage, FileText, FileArchive, FileSpreadsheet, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/useChatStore";
import { cn } from "@/lib/utils";

interface Attachment {
    resource_id: string;
    resource_name: string;
    extension?: string;
    focus?: boolean; // New focus parameter for highlighting important files
	type?: "storage" | "sandbox"; // Type of file: storage (default) or sandbox
}

interface AttachmentViewerProps {
    files: Attachment[];
    onFileClick?: (file: Attachment) => void;
}

// Function to get appropriate file icon based on extension
const getFileIcon = (extension: string): JSX.Element => {
	const ext = extension.toLowerCase();
	if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"].includes(ext)) {
		return <FileImage className="h-5 w-5" />;
	} else if (["doc", "docx", "txt", "rtf", "pdf", ".doc", ".docx", ".txt", ".rtf", ".pdf"].includes(ext)) {
		return <FileText className="h-5 w-5" />;
	} else if (["xls", "xlsx", "csv", ".xls", ".xlsx", ".csv"].includes(ext)) {
		return <FileSpreadsheet className="h-5 w-5" />;
	} else if (["zip", "rar", "7z", "tar", "gz", ".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) {
		return <FileArchive className="h-5 w-5" />;
	} else {
		return <File className="h-5 w-5" />;
	}
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
				type: file.type === "sandbox" ? "sandbox" : "sources",
				resourceId: file.resource_id,
				filename: file.resource_name,
			});
			setCollapsed(true);
		}
	};

	if (!files || files.length === 0) return null;

	// Sort files to show focused ones first, then storage files, then sandbox/temp files
	const sortedFiles = [...files].sort((a, b) => {
		// First priority: focused files
		if (a.focus && !b.focus) return -1;
		if (!a.focus && b.focus) return 1;
		
		// Second priority: file type (storage before sandbox)
		if (a.type !== "sandbox" && b.type === "sandbox") return -1;
		if (a.type === "sandbox" && b.type !== "sandbox") return 1;
		
		return 0;
	});

	const INITIAL_DISPLAY_COUNT = 2;
	const shouldShowExpandButton = files.length > INITIAL_DISPLAY_COUNT;
	const displayedFiles = isExpanded || !shouldShowExpandButton 
		? sortedFiles 
		: sortedFiles.slice(0, INITIAL_DISPLAY_COUNT);

	const hiddenCount = files.length - INITIAL_DISPLAY_COUNT;

	return (
		<div className="mt-3 mb-3">
			<div className="flex items-center justify-between mb-2">
				<div className="text-xs font-medium text-gray-600">
					Attachments ({files.length})
				</div>
				{shouldShowExpandButton && (
					<Button
						className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
						onClick={() => setIsExpanded(!isExpanded)}
						size="sm"
						variant="ghost"
					>
						{isExpanded ? (
							<>
								<ChevronUp className="h-3 w-3 mr-1" />
								Show Less
							</>
						) : (
							<>
								<ChevronDown className="h-3 w-3 mr-1" />
								Show {hiddenCount} More
							</>
						)}
					</Button>
				)}
			</div>			
			<div className={cn(
				"grid gap-2 transition-all duration-300 ease-in-out",
				isExpanded || files.length <= INITIAL_DISPLAY_COUNT
					? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
					: "grid-cols-1 sm:grid-cols-2",
			)}
			>
				{displayedFiles.map((file, index) => (
					<div
						className={cn(
							"group relative flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer",
							file.type === "sandbox" 
								? "bg-gray-50/70 border-dashed border-gray-300 hover:bg-gray-100/70 opacity-75" 
								: "bg-white border-gray-200 hover:shadow-md hover:border-blue-300",
							file.focus && file.type !== "sandbox" && [
								"ring-2 ring-blue-500 ring-opacity-50",
								"border-blue-300 shadow-sm",
							],
						)}
						key={index}
						onClick={() => handleFileClick(file)}
					>					
						{file.type === "sandbox" && (
							<span className="absolute -top-1 -right-1 rounded-sm px-1 py-0.5 text-[9px] font-medium bg-gray-200/80 text-gray-500 italic">
								temp
							</span>
						)}
						{/* File icon */}
						<div className={cn(
							"flex-shrink-0 mr-3 transition-transform duration-200",
							file.type === "sandbox" 
								? "text-gray-400 opacity-70"
								: "group-hover:scale-110",
							file.focus && file.type !== "sandbox"
								? "text-blue-600"
								: file.type !== "sandbox" && "text-gray-500",
						)}
						>
							{getFileIcon(file.extension || "")}
						</div>						
						{/* File info */}
						<div className="flex-1 min-w-0">
							<div className={cn(
								"text-sm truncate transition-colors duration-200",
								file.type === "sandbox"
									? "text-gray-600 italic font-normal"
									: "font-medium",
								file.focus && file.type !== "sandbox"
									? "text-blue-900"
									: file.type !== "sandbox" && "text-gray-900 group-hover:text-blue-600",
							)}
							>
								{file.resource_name || file.resource_id}
							</div>
							{file.extension && (
								<div className={cn(
									"text-xs uppercase",
									file.type === "sandbox" ? "text-gray-400" : "text-gray-500",
								)}
								>
									{file.extension.replace(".", "")} file
								</div>
							)}
						</div>
					</div>
				))}
			</div>

		</div>
	);
};

export default AttachmentViewer; 