"use client";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";
import { clsx } from "clsx";
import InteractiveChatPanel from "@/components/ChatInput/PlatformChat/InteractiveChatPanel";
import { useEffect, useState } from "react";

export default function ChatComponent() : JSX.Element {
	const activeProject = useStore((state) => state.activeProject);
	const { tabs } = useChatStore();
	const hasOpenTabs = tabs.length > 0;
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
			<div className="p-2">
				<Toaster />
				{activeProject && (
					<div className="w-full">
						<PlatformChatComponent
							chatTarget="agent"
							folderId={activeProject?.project_id}
							folderName="Agent"
						/>
					</div>
				)}
			</div>
		);
	}
	
	return (
		<div className="p-2">
			<Toaster />
			{activeProject && (
				<div className="flex h-full resizable-container">
					<div 
						className={clsx(
							"flex-shrink-0",
							!isDragging && "transition-all duration-200 ease-in-out",
						)}
						style={{ width: `${panelWidth}%` }}
					>
						<PlatformChatComponent
							chatTarget="agent"
							folderId={activeProject?.project_id}
							folderName="Agent"
						/>
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
							"flex-shrink-0",
							!isDragging && "transition-all duration-200 ease-in-out",
						)}
						style={{ width: `${100 - panelWidth}%` }}
					>
						<InteractiveChatPanel />
					</div>
				</div>
			)}
		</div>
	);
}
