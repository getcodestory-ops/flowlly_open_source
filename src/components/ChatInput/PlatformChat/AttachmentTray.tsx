"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, X, Box, ChevronDown, ChevronUp } from "lucide-react";
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

export default function AttachmentTray(): JSX.Element | null {
	const {
		chatAttachments,
		clearChatAttachments,
		addTab,
	} = useChatStore();
	const { chatLayoutMode } = useViewStore();
	const [isOpen, setIsOpen] = useState(false);
	const trayRef = useRef<HTMLDivElement>(null);

	const fileCount = chatAttachments.length;

	// Close tray when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	// Auto-close when no files
	useEffect(() => {
		if (fileCount === 0) setIsOpen(false);
	}, [fileCount]);

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

	// Don't render anything if no files
	if (fileCount === 0) return null;

	return (
		<div
			ref={trayRef}
			className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
		>
			{/* Pull tab - small pill at top center */}
			<TooltipProvider delayDuration={300}>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => setIsOpen((prev) => !prev)}
							className={cn(
								"flex items-center gap-1.5 px-3 py-1 group",
								"rounded-b-lg border border-t-0 border-gray-200",
								"bg-white hover:bg-gray-50 shadow-sm",
								"transition-all duration-200 cursor-pointer",
								isOpen && "bg-gray-50 shadow-md",
							)}
						>
							<Paperclip className="h-3 w-3 text-gray-500 group-hover:text-gray-700 transition-colors" />

							<span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
								{fileCount} file{fileCount !== 1 ? "s" : ""}
							</span>

							{isOpen ? (
								<ChevronUp className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
							) : (
								<ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
							)}
						</button>
					</TooltipTrigger>
					<TooltipContent side="bottom" sideOffset={4}>
						<p className="text-xs">{isOpen ? "Hide files" : "Show attached files"}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			{/* Drop-down tray panel */}
			<div
				className={cn(
					"bg-white border border-gray-200 rounded-b-xl rounded-t-none shadow-lg",
					"flex flex-col overflow-hidden",
					"transition-all duration-200 ease-in-out origin-top",
					isOpen
						? "max-h-[320px] w-[300px] opacity-100 scale-y-100"
						: "max-h-0 w-[300px] opacity-0 scale-y-95 pointer-events-none border-0",
				)}
			>
				{/* Tray header */}
				<div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/80 flex-shrink-0">
					<div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
						<Paperclip className="h-3.5 w-3.5" />
						<span>Attached Files</span>
						<span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-gray-200/70 text-[10px] font-semibold text-gray-500">
							{fileCount}
						</span>
					</div>
					<TooltipProvider delayDuration={300}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
									onClick={clearChatAttachments}
									size="icon"
									variant="ghost"
								>
									<X className="h-3 w-3" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={4}>
								<p className="text-xs">Clear all files</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				{/* File list */}
				<ScrollArea className="flex-1">
					<div className="p-1.5 space-y-0.5">
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
									<span
										className={cn(
											"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded overflow-hidden",
											config.bg,
											config.color,
										)}
									>
										<FileIconSvg className="h-3.5 w-3.5" iconKey={config.iconKey} />
									</span>

									{/* File name and extension */}
									<div className="flex-1 min-w-0 text-left">
										<div className="truncate text-gray-700 font-medium text-xs leading-tight">
											{attachment.name}
										</div>
										<div className="flex items-center gap-1 mt-0.5">
											{extension && (
												<span className={cn("text-[10px] uppercase leading-none", config.color)}>
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
				</ScrollArea>
			</div>
		</div>
	);
}
