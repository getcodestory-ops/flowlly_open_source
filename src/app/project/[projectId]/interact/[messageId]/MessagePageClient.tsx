"use client";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";
import { AgentMessage } from "@/types/agentChats";
import { useEffect, useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import InteractiveChatPanel from "@/components/ChatInput/PlatformChat/InteractiveChatPanel";
import { clsx } from "clsx";

interface MessagePageClientProps {
	message: AgentMessage | string | null;
}

export default function MessagePageClient({ message }: MessagePageClientProps) {
	const { tabs, setIsWaitingForResponse } = useChatStore();
	const hasOpenTabs = tabs.filter((t) => t.type !== "chat").length > 0;
	const [panelWidth, setPanelWidth] = useState(50); // Percentage width for the chat panel
	const [isDragging, setIsDragging] = useState(false);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		
		const container = document.querySelector(".resizable-container") as HTMLElement;
		if (!container) return;
		
		const containerRect = container.getBoundingClientRect();
		const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
		
		// Constrain the width between 20% and 80%
		const constrainedWidth = Math.min(Math.max(newWidth, 20), 80);
		setPanelWidth(constrainedWidth);
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		} else {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isDragging]);

	if (!hasOpenTabs) {
		return (
			<div className="flex flex-col h-full">
				{message && <AgentMessageInteractiveView message={message} setIsWaitingForResponse={setIsWaitingForResponse} />}
			</div>
		);
	}

	return (
		<div className="flex h-full resizable-container">
			<div 
				className={clsx(
					"flex-shrink-0 border-r border-gray-200",
					!isDragging && "transition-all duration-200 ease-in-out",
				)}
				style={{ width: `${panelWidth}%` }}
			>
				<InteractiveChatPanel />
			</div>
			<div
				className={clsx(
					"w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex-shrink-0",
					!isDragging && "transition-colors duration-200",
					isDragging && "bg-blue-500",
				)}
				onMouseDown={handleMouseDown}
			>
				<div className="w-full h-full flex items-center justify-center">
					<div className="w-0.5 h-8 bg-gray-400 rounded-full opacity-60" />
				</div>
			</div>
			<div 
				className={clsx(
					"flex-1 overflow-auto",
					!isDragging && "transition-all duration-200 ease-in-out",
				)}
				style={{ width: `${100 - panelWidth}%` }}
			>
				{message && <AgentMessageInteractiveView message={message} setIsWaitingForResponse={setIsWaitingForResponse} />}
			</div>
		</div>
	);
}
