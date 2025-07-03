import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import { ScheduleResponse } from "@/types/agentChats";
import { Revision } from "@/types/activities";

export const scheduleAgent = async({
	session,
	agentTask,
	brainId,
	chatId,
	projectId,
}: {
  session: Session;
  agentTask: string;
  brainId: string | null;
  chatId: string;
  projectId: string;
}) => {
	const scheduleProps = {
		task: agentTask,
		brain_id: brainId,
		chat_entity_id: chatId,
		project_id: projectId,
	};

	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule`;
	const response = await axios.post(url, scheduleProps, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getScheduleSummary = async(
	session: Session,
	projectId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/summary/daily/${projectId}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const updateScheduleViaNotes = async(
	session: Session,
	projectId: string,
	notes: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/update/notes/${projectId}`;
	const response = await axios.put(
		url,
		{ notes: notes },
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export const getTaskStatus = async(
	session: Session,
	currentTaskId: string,
): Promise<ScheduleResponse> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/result/${currentTaskId}`;
	const response = await axios.get(url, {
		timeout: 5000,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};



export const getCriticalPath = async({
	session,
	projectId,
}: {
  session: Session;
  projectId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/critical_path/${projectId}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const processDocumentContent = async(
	session: Session,
	projectId: string,
	documentId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/process_document/${projectId}`;

	const response = await axios.get(
		url,

		{
			params: {
				document_id: documentId,
			},
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export const getScheduleRevisions = async(
	session: Session,
	projectId: string,
	impactDate: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/revisions/${projectId}/${impactDate}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getScheduleRevisionsById = async(
	session: Session,
	projectId: string,
	ids: string[],
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/revisionsId/${projectId}`;
	const response = await axios.get(url, {
		params: { listIds: ids },
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const updateActivityRevision = async(
	session: Session,
	project_access_id: string,
	revision: { id: string; revision: Revision },
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/revision/${project_access_id}`;
	const response = await axios.put(url, revision, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const rejectRevision = async(
	session: Session,
	project_access_id: string,
	revisionId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/revision/reject/${project_access_id}/${revisionId}`;
	const response = await axios.delete(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};
