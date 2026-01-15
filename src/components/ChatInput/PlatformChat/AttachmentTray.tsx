"use client";

import React from "react";
import { Paperclip, X, Box, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/useChatStore";
import { cn } from "@/lib/utils";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";

// Helper to extract extension from filename
const getExtension = (filename: string): string => {
	const lastDot = filename.lastIndexOf(".");
	if (lastDot > 0 && lastDot < filename.length - 1) {
		return filename.slice(lastDot + 1);
	}
	return "";
};

// Helper to check if UUID is valid
const isUUID = (str: string): boolean => 
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function AttachmentTray(): JSX.Element | null {
	const { chatAttachments, clearChatAttachments, addTab } = useChatStore();
	const scrollContainerRef = React.useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(false);

	// Check scroll buttons
	const checkScrollButtons = React.useCallback(() => {
		if (!scrollContainerRef.current) return;
		const container = scrollContainerRef.current;
		const threshold = 1;
		setCanScrollLeft(container.scrollLeft > threshold);
		setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - threshold);
	}, []);

	// Scroll handler
	const scrollTray = (direction: "left" | "right") => {
		if (!scrollContainerRef.current) return;
		const scrollAmount = 200;
		scrollContainerRef.current.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	// Check scroll on mount and when attachments change
	React.useEffect(() => {
		const timeout = setTimeout(checkScrollButtons, 100);
		return () => clearTimeout(timeout);
	}, [chatAttachments, checkScrollButtons]);

	// Add scroll event listener
	React.useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		
		container.addEventListener("scroll", checkScrollButtons);
		window.addEventListener("resize", checkScrollButtons);
		
		return () => {
			container.removeEventListener("scroll", checkScrollButtons);
			window.removeEventListener("resize", checkScrollButtons);
		};
	}, [checkScrollButtons]);

	const handleAttachmentClick = (attachment: typeof chatAttachments[0]) => {
		const isSandbox = attachment.is_sandbox_file || !isUUID(attachment.uuid);
		const resourceId = attachment.is_sandbox_file
			? `${attachment.uuid}::${attachment.name}`
			: attachment.uuid;

		addTab({
			isOpen: true,
			type: isSandbox ? "sandbox" : "sources",
			resourceId: resourceId,
			filename: attachment.name,
			sandbox_id: attachment.is_sandbox_file ? attachment.uuid : undefined,
		});
	};

	if (chatAttachments.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 min-h-[48px]">
			{/* Label */}
			<div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 flex-shrink-0">
				<Paperclip className="h-3.5 w-3.5" />
				<span className="hidden sm:inline">{chatAttachments.length} files</span>
			</div>

			{/* Scroll left button */}
			{canScrollLeft && (
				<Button
					className="h-6 w-6 p-0 flex-shrink-0"
					onClick={() => scrollTray("left")}
					size="icon"
					variant="ghost"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
			)}

			{/* Scrollable attachment chips */}
			<div
				className="flex-1 overflow-x-auto scrollbar-hide"
				ref={scrollContainerRef}
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				<div className="flex items-center gap-2">
					{chatAttachments.map((attachment, index) => {
						const extension = attachment.type || getExtension(attachment.name);
						const config = getFileConfig(extension);
						const isSandbox = attachment.is_sandbox_file || !isUUID(attachment.uuid);

						return (
							<button
								className={cn(
									"group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all duration-150 cursor-pointer flex-shrink-0",
									"border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white",
									"hover:shadow-sm active:scale-[0.98]",
								)}
								key={`${attachment.uuid}-${index}`}
								onClick={() => handleAttachmentClick(attachment)}
								type="button"
							>
								{/* File icon */}
								<span className={cn(
									"flex items-center justify-center w-5 h-5 rounded overflow-hidden",
									config.bg, config.color,
								)}>
									<FileIconSvg className="h-3 w-3" iconKey={config.iconKey} />
								</span>

								{/* File name */}
								<span className="truncate max-w-[120px] text-gray-700 font-medium">
									{attachment.name}
								</span>

								{/* Sandbox indicator */}
								{isSandbox && (
									<Box className={cn("h-3 w-3 flex-shrink-0", config.color)} />
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Scroll right button */}
			{canScrollRight && (
				<Button
					className="h-6 w-6 p-0 flex-shrink-0"
					onClick={() => scrollTray("right")}
					size="icon"
					variant="ghost"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			)}

			{/* Clear all button */}
			<Button
				className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
				onClick={clearChatAttachments}
				size="sm"
				title="Clear all attachments"
				variant="ghost"
			>
				<X className="h-3 w-3" />
			</Button>
		</div>
	);
}
