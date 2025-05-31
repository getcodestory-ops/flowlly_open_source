"use client";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";
import { clsx } from "clsx";
import InteractiveChatPanel from "@/components/ChatInput/PlatformChat/InteractiveChatPanel";

export default function ChatComponent() : JSX.Element {
	const activeProject = useStore((state) => state.activeProject);
	const { tabs } = useChatStore();
	const hasOpenTabs = tabs.length > 0;
	
	return (
		<div className="p-2">
			<Toaster />
			{activeProject && (
				<div className={clsx("", hasOpenTabs && "flex")}>
					<div className={clsx("transition-all duration-500 ease-in-out", hasOpenTabs ? "w-1/2" : "w-full")}>
						<PlatformChatComponent
							chatTarget="agent"
							folderId={activeProject?.project_id}
							folderName="Agent"
						/>
					</div>
					{hasOpenTabs && (
						<div className="transition-all duration-500 ease-in-out w-1/2 absolute right-2">
							<InteractiveChatPanel />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
