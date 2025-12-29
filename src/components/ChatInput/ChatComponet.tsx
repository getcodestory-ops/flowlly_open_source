"use client";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";
import { clsx } from "clsx";
import InteractiveChatPanel from "@/components/ChatInput/PlatformChat/InteractiveChatPanel";
import { useEffect, useState } from "react";

export default function ChatComponent({ heightOffset = 20 }: {heightOffset?: number}) : JSX.Element {
	const activeProject = useStore((state) => state.activeProject);
	const { tabs, chatDirectiveType, setChatDirectiveType } = useChatStore();
	const hasOpenTabs = tabs.length > 0;
	const [panelWidth, setPanelWidth] = useState(50); // Percentage width for the chat panel
	const [isDragging, setIsDragging] = useState(false);

	const handleMouseDown = (e: React.MouseEvent): void => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleMouseMove = (e: MouseEvent): void => {
		if (!isDragging) return;
		
		const container = document.querySelector(".resizable-container") as HTMLElement;
		if (!container) return;
		
		const containerRect = container.getBoundingClientRect();
		const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
		
		// Constrain the width between 20% and 80%
		const constrainedWidth = Math.min(Math.max(newWidth, 20), 80);
		setPanelWidth(constrainedWidth);
	};

	const handleMouseUp = (): void => {
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

	return (
		<div className="h-full">
			<Toaster />
			{activeProject && (
				<div className="flex h-full resizable-container">
					<div 
						className={clsx(
							"flex-shrink-0 h-full",
							!isDragging && "transition-all duration-200 ease-in-out",
						)}
						style={{ width: hasOpenTabs ? `${panelWidth}%` : "100%" }}
					>
						<PlatformChatComponent
							chatTarget="agent"
							folderId={activeProject?.project_id}
							heightOffset={heightOffset}
						/>
					</div>
					{hasOpenTabs && (
						<>
							{/* Resizable divider */}
							<div
								className={clsx(
									"group relative w-[6px] cursor-col-resize flex-shrink-0 flex items-center justify-center",
									!isDragging && "transition-all duration-200",
								)}
								onMouseDown={handleMouseDown}
							>
								{/* Background track */}
								<div className={clsx(
									"absolute inset-y-0 transition-all duration-200 w-[2px] ",
									isDragging 
										? "bg-blue-500 " 
										: "bg-gray-200 group-hover:bg-blue-400",
								)} />
								
								{/* Handle grip dots */}
								<div className={clsx(
									"relative z-10 flex flex-col gap-1 py-1 px-1 rounded-md transition-all duration-200",
									isDragging 
										? "bg-blue-500" 
										: "bg-transparent group-hover:bg-blue-100",
								)}>
									{[...Array(3)].map((_, i) => (
										<div 
											className={clsx(
												"w-1 h-1 rounded-full transition-colors duration-200",
												isDragging 
													? "bg-white" 
													: "bg-gray-400 group-hover:bg-blue-500",
											)}
											key={i} 
										/>
									))}
								</div>
							</div>
							
							{/* Right panel */}
							<div 
								className={clsx(
									"flex-shrink-0 h-full",
									!isDragging && "transition-all duration-200 ease-in-out",
								)}
								style={{ width: `${100 - panelWidth}%` }}
							>
								<InteractiveChatPanel heightOffset={heightOffset} />
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
