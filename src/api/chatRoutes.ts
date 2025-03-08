import { Session } from "@supabase/supabase-js";
import { Chat } from "@/types/chat";

export const getChatSessions = async(
	session: Session,
	project_access_id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/list/${project_access_id}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	const data = await response.json();
	return data.chats.reverse();
};

export const createNewChatSession = async(
	sessionToken: Session,
	chatName: string,
	project_access_id: string,
) => {
	const chat_data = {
		name: chatName,
		project_access_id: project_access_id,
	};
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat`,
		{
			method: "POST",

			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionToken!.access_token}`,
			},
			body: JSON.stringify(chat_data),
		},
	);

	const data = await response.json();
	return data;
};

export const getChatHistory = async(sessionToken: Session, chatId: string) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/${chatId}/history`,
		{
			method: "GET",

			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionToken!.access_token}`,
			},
		},
	);

	const data = await response.json();
	return data;
};

export const deleteChatSession = async(
	sessionToken: Session,
	chatId: string,
) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/${chatId}`,
		{
			method: "DELETE",

			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionToken!.access_token}`,
			},
		},
	);
	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	const data = await response.json();
	return data;
};

export const updateChatSessionName = async(
	session: Session,
	chatId: string,
	chatName: string,
) => {
	const chat_data = {
		chat_name: chatName, // Replace with the actual chat name
	};

	if (!session) return;
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/${chatId}/metadata`,
		{
			method: "PUT",

			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session!.access_token}`,
			},

			body: JSON.stringify(chat_data),
		},
	);
	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	const data = await response.json();
	return data;
};
