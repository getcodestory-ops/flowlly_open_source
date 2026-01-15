"use client";

import React from "react";
import { Paperclip, X, Box, PanelLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/useChatStore";
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

const PANEL_WIDTH = 200;

export default function AttachmentTray(): JSX.Element | null {
	const { 
		chatAttachments, 
		clearChatAttachments, 
		addTab, 
		chatLayoutMode, 
		setChatLayoutMode,
		isChatDrawerOpen,
		setIsChatDrawerOpen,
		isWaitingForResponse,
	} = useChatStore();
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
			className="h-full flex flex-col bg-white border-l border-gray-200"
			style={{ width: `${PANEL_WIDTH}px` }}
		>
			{/* Chat Toggle Button */}
			<div className="px-2 py-2 border-b border-gray-100">
				<TooltipProvider delayDuration={300}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className={cn(
									"w-full h-9 gap-2 text-xs transition-all duration-200 relative",
									isChatDrawerOpen
										? "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
										: "hover:bg-gray-100 text-gray-700 hover:text-blue-600",
									isWaitingForResponse && !isChatDrawerOpen && "border-blue-300 bg-blue-50"
								)}
								onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
								size="sm"
								variant="outline"
							>
								<MessageSquare className={cn(
									"h-4 w-4",
									isWaitingForResponse && "text-blue-600 animate-pulse"
								)} />
								<span>{isChatDrawerOpen ? "Hide Chat" : "Show Chat"}</span>
								{/* Activity indicator */}
								{isWaitingForResponse && !isChatDrawerOpen && (
									<span className="absolute top-1 right-1 flex h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
										<span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
									</span>
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="left" sideOffset={5}>
							<p className="text-xs">{isChatDrawerOpen ? "Close chat panel" : "Open chat panel"}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

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

			{/* Footer with mode toggle */}
			<div className="px-2 py-2 border-t border-gray-100 bg-gray-50">
				<TooltipProvider delayDuration={300}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className={cn(
									"w-full h-8 gap-1.5 text-xs transition-all duration-200",
									isAgentMode
										? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
										: "hover:bg-white text-gray-600 hover:text-gray-900"
								)}
								onClick={() => setChatLayoutMode(isAgentMode ? "split" : "agent")}
								size="sm"
								variant="ghost"
							>
								<PanelLeft className="h-3.5 w-3.5" />
								<span>Switch to Split</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="left" sideOffset={5}>
							<p className="text-xs">Switch to split view with chat panel</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}
