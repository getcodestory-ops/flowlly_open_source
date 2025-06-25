import { Session } from "@supabase/supabase-js";
import { AgentInterfaceProps } from "@/types/agent";
import {
	AgentChat,
	CreateAgentChatEntity,
	AgentChatEntity,
} from "@/types/agentChats";
import axios from "axios";

interface AgentTask {
  agent_task: string;
  sessionToken: Session;
}

export type ProcessedFile = {
  type: string;
  resource_id: string;
  resource_url: string;
  resource_name: string;
  extension: string;
};

export const talkToAgent = async({
	session,
	agentTask,
	brainId,
	chatId,
	projectId,
	responseType = "general",
	model = "gemini-2.0-flash",
	includeContext = false,
	files = [],
	googleSearch = false,
}: {
  session: Session;
  agentTask: string;
  brainId: string | null;
  chatId: string;
  projectId: string;
  responseType?: string;
  model?: string;
  includeContext?: boolean;
  files?: ProcessedFile[];
  googleSearch?: boolean;
}) => {
	const agentTaskProps = {
		task: agentTask,
		brain_id: brainId,
		chat_entity_id: chatId,
		project_id: projectId,
		response_type: responseType,
		model: model,
		include_context: includeContext,
		files: files,
		google_search: googleSearch,
	};

	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat`;
	const response = await axios.post(url, agentTaskProps, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
		timeout: 10000,
	});
	return response.data;
};

export const stopAgent = async({
	session,
	streamingId,
}: {
	session: Session;
	streamingId: string;
}) : Promise<{message: string}> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat/stop_signal/${streamingId}`;
	const response = await axios.post(url, {}, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const createChatEntity = async(
	sessionToken: Session,
	chat_entity: CreateAgentChatEntity,
) => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat_entity`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionToken.access_token}`,
				},
				body: JSON.stringify(chat_entity),
			},
		);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();
		return data.chat_entity;
	} catch (error) {
		throw new Error("Network response was not ok");
	}
};

export const createPlatformChatEntity = async(
	sessionToken: Session,
	chat_entity: CreateAgentChatEntity,
) => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat_entity/relation`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionToken.access_token}`,
				},
				body: JSON.stringify(chat_entity),
			},
		);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();
		return data.chat_entity;
	} catch (error) {
		throw new Error("Network response was not ok");
	}
};

export const getAgentChatEntities = async(
	session: Session,
	projectId: string,
): Promise<AgentChatEntity[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat_entity/${projectId}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data.chat_entities;
};

export const getPlatformChatEntities = async(
	session: Session,
	projectId: string,
	folderId: string,
	chatTarget?: string,
): Promise<AgentChatEntity[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat_entities/relation/${projectId}/${folderId}`;
	const params = chatTarget ? { relation_type: chatTarget } : {};
	const response = await axios.get(url, {
		params,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data.chat_entities;
};

export const getAgentChats = async(
	session: Session,
	projectId: string,
): Promise<AgentChat[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chats/${projectId}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data.chats;
};

export const getAgentChatHistoryItem = async(
	session: Session,
	historyId: string,
): Promise<AgentChat> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat/history_item/${historyId}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const distributeEmails = async(
	session: Session,
	emailHtml: string,
	emails: string[],
	subject: string,
): Promise<AgentChat> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/task/distribute_email`;

	const data = {
		email_html: emailHtml,
		email_list: emails,
		subject: subject,
	};

	const response = await axios.post(url, data, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const sendVoiceNote = async({
	session,
	projectId,
	formData,
}: {
  session: Session;
  projectId: string;
  formData: FormData;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/task/connect_to_agent/${projectId}`;
	const response = await axios.post(url, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	if (!response.data) {
		throw new Error("Network response was not ok");
	}

	return response.data;
};

export const streamVoiceNote = async({
	session,
	projectId,
	formData,
}: {
  session: Session;
  projectId: string;
  formData: FormData;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/voice_note/${projectId}`;
	const response = await axios.post(url, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	if (!response.data) {
		throw new Error("Network response was not ok");
	}

	return response.data;
};

export const endVoiceNote = async({
	session,
	projectId,
	chatEntityId,
}: {
  session: Session;
  projectId: string;
  chatEntityId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/voice_note/end/${projectId}`;
	const response = await axios.post(
		url,
		{
			chat_entity_id: chatEntityId,
		},
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);

	if (!response.data) {
		throw new Error("Network response was not ok");
	}

	return response.data;
};

export const getPendingVoiceNotes = async(
	session: Session,
	chatEntityId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/unprocessed/voice_notes/${chatEntityId}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	if (!response.data) {
		throw new Error("Network response was not ok");
	}

	return response.data;
};

export const deletePendingVoiceNote = async({
	session,
	projectId,
	chatEntityId,
}: {
  session: Session;
  projectId: string;
  chatEntityId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/history/${projectId}`;
	const response = await axios.delete(url, {
		params: { chat_entity_id: chatEntityId },
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	if (!response.data) {
		throw new Error("Network response was not ok");
	}

	return response.data;
};

export const updateChatName = async(
	session: Session,
	chatId: string,
	chatName: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat_entity/${chatId}`;
	try {
		const response = await axios.put(url, {}, {
			params: {
				chat_name: chatName,
			},
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		return response.data;
	} catch (error) {
		throw new Error("Network response was not ok");
	}
};
