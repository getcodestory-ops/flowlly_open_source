import { getAgentChatHistoryItem } from "@/api/agentRoutes";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";
import { AgentMessage } from "@/types/agentChats";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MessagePageClient from "./MessagePageClient";

export default async function MessagePage({ params }: { params: Promise<{ messageId: string }> }) {
	const { messageId } = await params;
	const supabase = createClient();
	const { data: sessionData } = await supabase.auth.getSession();
	
	if (!sessionData?.session?.user) {
		redirect("/applogin");
	}

	const messageData = await getAgentChatHistoryItem(sessionData.session, messageId);
	const message = messageData?.message || null;

	return <MessagePageClient message={message} />;
}
