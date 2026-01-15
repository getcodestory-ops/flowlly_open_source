"use client";

import React from "react";
import { MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/hooks/useChatStore";

interface ChatDrawerProps {
	children: React.ReactNode;
	heightOffset?: number;
}

const DRAWER_WIDTH = 450;

export default function ChatDrawer({ children, heightOffset = 20 }: ChatDrawerProps): JSX.Element {
	const { isChatDrawerOpen, setIsChatDrawerOpen, isWaitingForResponse } = useChatStore();

	return (
		<>
			{/* Overlay when drawer is open */}
			{isChatDrawerOpen && (
				<div
					className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
					onClick={() => setIsChatDrawerOpen(false)}
				/>
			)}

			{/* Slide-out drawer */}
			<div
				className={cn(
					"fixed top-0 left-0 z-50 bg-white shadow-2xl transition-transform duration-200 ease-in-out",
					isChatDrawerOpen ? "translate-x-0" : "-translate-x-full",
				)}
				style={{
					width: `${DRAWER_WIDTH}px`,
					height: `calc(100vh - ${heightOffset}px)`,
					marginTop: `${heightOffset}px`,
				}}
			>
				{/* Drawer content - full height, no header */}
				<div className="h-full overflow-hidden relative">
					{children}
				</div>

				{/* Collapse button on the right edge of drawer */}
				<Button
					className={cn(
						"absolute top-1/2 -translate-y-1/2 -right-4 z-10",
						"h-16 w-4 p-0 rounded-l-none rounded-r-md",
						"bg-white hover:bg-gray-50 border border-l-0 border-gray-200 shadow-md",
						"text-gray-400 hover:text-gray-600",
						"transition-all duration-200",
					)}
					onClick={() => setIsChatDrawerOpen(false)}
					size="sm"
					title="Collapse chat"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
			</div>

			{/* Toggle button when drawer is closed - attached to left edge */}
			<div
				className={cn(
					"fixed left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-200",
					isChatDrawerOpen && "opacity-0 pointer-events-none",
				)}
				style={{ marginTop: `${heightOffset / 2}px` }}
			>
				<Button
					className={cn(
						"h-14 px-2 rounded-l-none rounded-r-lg shadow-lg border border-l-0 border-gray-200",
						"bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600",
						"transition-all duration-200 hover:px-3",
						isWaitingForResponse && "border-blue-300 bg-blue-50",
					)}
					onClick={() => setIsChatDrawerOpen(true)}
					size="sm"
				>
					<div className="flex items-center gap-1">
						<MessageSquare className={cn(
							"h-5 w-5",
							isWaitingForResponse && "text-blue-600 animate-pulse",
						)} />
						<ChevronRight className="h-3 w-3" />
					</div>
				</Button>
				{/* Activity indicator */}
				{isWaitingForResponse && (
					<span className="absolute -top-1 -right-1 flex h-3 w-3">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
					</span>
				)}
			</div>
		</>
	);
}
