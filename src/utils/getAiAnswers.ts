import { Session } from "@supabase/supabase-js";
import { Brain } from "@/types/store";
import { handleStreams } from "./handleStream";

export const getContext = async(
	sessionToken: Session,
	chat_id: string,
	query: string,
	selectedContext: Brain,
) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/context?chat_question=${query}&brain_id=${selectedContext.id}&chat_id=${chat_id}`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${sessionToken!.access_token}`,
			},
		},
	);
	const context = await response.json();
	return context.context;
};

export const updateContext = async(
	sessionToken: Session,
	message_id: string,
	context_id: string,
) => {
	const context_data = {
		message_id: message_id,
	};
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/context?context_id=${context_id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionToken!.access_token}`,
				},
				body: JSON.stringify(context_data),
			},
		);
		if (!response.ok) {
			throw new Error("Somethign went wrong");
			return;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		//console.log(error);
	}
};

export const getAnswer = async(
	sessionToken: Session,
	query: string,
	context: any,
) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/answers_next?question=${query}`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${sessionToken!.access_token}`,
			},
			body: context[0].page_content,
		},
	);

	return response;
};

export const getContexualAnswerStream = async(
	sessionToken: Session,
	chat_id: string,
	brain_id: string,
	question: string,
) => {
	const { handleStream } = handleStreams();

	const chat_query = {
		question: question,
	};
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/${chat_id}/question/stream?brain_id=${brain_id}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionToken!.access_token}`,
				},
				body: JSON.stringify(chat_query),
			},
		);
		if (!response.ok) {
			return;
		}

		if (response.body === null) {
			throw new Error("Did not get response");
		}

		await handleStream(response.body.getReader());
	} catch (error) {
		//console.log(error);
	}
};

export const getContexualAnswer = async(
	sessionToken: Session,
	chat_id: string,
	brain_id: string,
	question: string,
) => {
	const chat_query = {
		question: question,
	};
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/${chat_id}/question?brain_id=${brain_id}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionToken!.access_token}`,
				},
				body: JSON.stringify(chat_query),
			},
		);
		if (!response.ok) {
			return;
		}

		if (response.body === null) {
			throw new Error("Did not get response");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		//console.log(error);
	}
};
