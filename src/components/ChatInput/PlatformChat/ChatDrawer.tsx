"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/hooks/useChatStore";

interface ChatDrawerProps {
	children: React.ReactNode;
	heightOffset?: number;
}

const DRAWER_WIDTH = 600;

export default function ChatDrawer({ children, heightOffset = 20 }: ChatDrawerProps): JSX.Element {
	const { isChatDrawerOpen, setIsChatDrawerOpen } = useChatStore();

	return (
		<>
			{/* Overlay when drawer is open */}
			{isChatDrawerOpen && (
				<div
					className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
					onClick={() => setIsChatDrawerOpen(false)}
				/>
			)}

			{/* Slide-out drawer - now from right side */}
			<div
				className={cn(
					"fixed top-0 right-0 z-50 bg-white shadow-2xl transition-transform duration-200 ease-in-out border-l border-gray-200",
					isChatDrawerOpen ? "translate-x-0" : "translate-x-full",
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
			</div>
		</>
	);
}
