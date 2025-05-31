"use client";
import { getAgentChatHistoryItem } from "@/api/agentRoutes";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";
import { AgentMessage } from "@/types/agentChats";
import supabase from "@/utils/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore } from "@/utils/store";
import InteractiveChatPanel from "@/components/ChatInput/PlatformChat/InteractiveChatPanel";
import { clsx } from "clsx";

export default function MessagePage({ params }: { params: { messageId: string } }) {
	const router = useRouter();
	const { messageId } = params;
	const [message, setMessage] = useState<AgentMessage | string | null>(null);
	const { tabs } = useChatStore();
	const hasOpenTabs = tabs.length > 0;
	
	useEffect(() => {
		async function retrieveMessage() {
			const { data } = await supabase.auth.getSession();
			if (!data?.session?.user) {
				router.replace("/applogin");
			}
			if (data?.session?.user) {
				const message = await getAgentChatHistoryItem(data?.session, messageId);
				if (message) {
					setMessage(message.message);
				}
			}
		}
		if (messageId) {
			retrieveMessage();
		}
	}, [messageId]);

	return (
		<div className="flex flex-col h-full ">
			{hasOpenTabs && (
				<div className="transition-all duration-500 ease-in-out w-full absolute right-0 z-10">
					<InteractiveChatPanel />
				</div>
			)}
			{message && <AgentMessageInteractiveView message={message} />}
		</div>
	);
}
