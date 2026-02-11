"use client";

import React from "react";
import { Paperclip, X, Box, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/useChatStore";
import { useViewStore } from "@/utils/store";
import { cn } from "@/lib/utils";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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

const PANEL_WIDTH = 300;

export default function AttachmentTray(): JSX.Element | null {
	const { 
		chatAttachments, 
		clearChatAttachments, 
		addTab, 
	} = useChatStore();
	const { chatLayoutMode, setChatLayoutMode } = useViewStore();
	const isAgentMode = chatLayoutMode === "agent";

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

	return (
		<div 
			className="h-screen flex flex-col bg-white border-l border-gray-200"
			style={{ width: `${PANEL_WIDTH}px` }}
		>
		{/* Files Header - only show when there are files */}
			{chatAttachments.length > 0 && (
				<div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
					<div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
						<Paperclip className="h-3.5 w-3.5" />
						<span>Files</span>
						<span className="text-gray-400">({chatAttachments.length})</span>
					</div>
					<Button
						className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
						onClick={clearChatAttachments}
						size="icon"
						title="Clear all"
						variant="ghost"
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			)}

			{/* Scrollable file list or empty state */}
			<ScrollArea className="flex-1">
				{chatAttachments.length > 0 ? (
					<div className="p-2 space-y-1">
						{chatAttachments.map((attachment, index) => {
							const extension = attachment.type || getExtension(attachment.name);
							const config = getFileConfig(extension);
							const isSandbox = attachment.is_sandbox_file || !isUUID(attachment.uuid);

							return (
								<button
									className={cn(
										"group flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-all duration-150 cursor-pointer",
										"hover:bg-gray-100 active:scale-[0.98]",
									)}
									key={`${attachment.uuid}-${index}`}
									onClick={() => handleAttachmentClick(attachment)}
									type="button"
								>
									{/* File icon */}
									<span className={cn(
										"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded overflow-hidden",
										config.bg, config.color,
									)}>
										<FileIconSvg className="h-3.5 w-3.5" iconKey={config.iconKey} />
									</span>

									{/* File name and extension */}
									<div className="flex-1 min-w-0 text-left">
										<div className="truncate text-gray-700 font-medium text-xs">
											{attachment.name}
										</div>
										<div className="flex items-center gap-1">
											{extension && (
												<span className={cn("text-[10px] uppercase", config.color)}>
													{extension}
												</span>
											)}
											{isSandbox && (
												<Box className={cn("h-2.5 w-2.5", config.color)} />
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full p-4 text-center">
						<Paperclip className="h-8 w-8 text-gray-300 mb-2" />
						<p className="text-xs text-gray-400">No files from chat</p>
						<p className="text-[10px] text-gray-300 mt-1">Files shared in chat will appear here</p>
					</div>
				)}
			</ScrollArea>

		
		</div>
	);
}
