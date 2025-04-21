"use client";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";
import { clsx } from "clsx";
import InteractiveChatPanel from "@/components/ChatInput/PlatformChat/InteractiveChatPanel";

export default function ChatComponent() : JSX.Element {
	const activeProject = useStore((state) => state.activeProject);
	const { sidePanel } = useChatStore();
	return (
		<div className="p-2">
			<Toaster />
			{activeProject && (
				<div className={clsx("", sidePanel?.isOpen && "flex")}>
					<div className={clsx("transition-all duration-500 ease-in-out", sidePanel?.isOpen ? "w-1/2" : "w-full")}>
						<PlatformChatComponent
							chatTarget="agent"
							folderId={activeProject?.project_id}
							folderName="Agent"
						/>
					</div>
					<div className={clsx(
						"transition-all duration-500 ease-in-out absolute right-0",
						sidePanel?.isOpen ? "w-1/2 translate-x-0 opacity-100" : "w-1/2 translate-x-full opacity-0",
					)}
					>
						<InteractiveChatPanel />
					</div>
				</div>
			)}

		</div>
	);
}
