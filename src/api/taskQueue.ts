import { type Session } from "@supabase/supabase-js";
import { AddTaskQueue, TaskQueue } from "@/types/taskQueue";
import { Notification } from "@/types/notification";
import { CreateEvent } from "@/types/projectEvents";
import axios from "axios";
import { Workflow } from "@/hooks/useWorkflowStack";
import type { EventResult, Participant } from "@/components/WorkflowComponents/types";


export const getTaskQueue = async(
	session: Session,
	project_access_id: string,
): Promise<TaskQueue[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/${project_access_id}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const addModifyTaskQueue = async(
	session: Session,
	project_access_id: string,
	taskQueue: AddTaskQueue,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/${project_access_id}`;
	await axios.post(url, taskQueue, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
};

export const deleteTaskQueue = async(
	session: Session,
	project_access_id: string,
	id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/${project_access_id}/${id}`;
	await axios.delete(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
};

export const getDailyMessagesQueue = async(
	session: Session,
	project_access_id: string,
): Promise<Notification[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/message/${project_access_id}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const updateQueueMessage = async(
	session: Session,
	project_access_id: string,
	notification: Notification,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/message/${project_access_id}`;
	const response = await axios.put(url, notification, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const deleteQueueMessage = async(
	session: Session,
	project_access_id: string,
	id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/message/${project_access_id}/${id}`;
	await axios.delete(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
};

export const getTaskResult = async(
	session: Session,
	taskId: string,
	projectId: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_result/${projectId}`;
	const respone = await axios.get(url, {
		params: { task_id: taskId },
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return respone.data;
};

export const reRunTask = async({
	session,
	taskId,
	taskFunction,
	projectId,
}: {
  session: Session;
  taskId: string;
  taskFunction: string;
  projectId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/task/re_run_task/${projectId}`;
	const respone = await axios.put(
		url,
		{ task_id: taskId, task_function: taskFunction },
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return respone.data;
};

export const createNewProjectEvent = async({
	session,
	projectId,
	projectEvent,
}: {
  session: Session;
  projectId: string;
  projectEvent: CreateEvent;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/${projectId}`;
	const response = await axios.post(url, projectEvent, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getProjectEvents = async({
	session,
	projectId,
}: {
  session: Session;
  projectId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/${projectId}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getEventParticipants = async({
	session,
	projectId,
	eventId,
}: {
	session: Session;
	projectId: string;
	eventId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/participants/${projectId}/${eventId}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};


export const updateEventParticipants = async({
	session,
	projectId,
	eventId,
	participants,
}: {
	session: Session;
	projectId: string;
	eventId: string;
	participants: Participant[];
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/participants/${projectId}/${eventId}`;
	const response = await axios.put(url, participants, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getInProgressWorkflows = async({
	session,
	projectId,
}: {
	session: Session;
	projectId: string;
}): Promise<Workflow[] | undefined> => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_events/in_progress/${projectId}`;
		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(`Failed to fetch in-progress workflows: ${error.response?.data?.message || error.message}`);
		}
		console.error("An unexpected error occurred while fetching in-progress workflows");
		return undefined;
	}
};

export const getInprogressWorkflowResult = async({
	session,
	projectId,
	workflowId,
}: {
	session: Session;
	projectId: string;
	workflowId: string;
}): Promise<EventResult | undefined> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/in_progress/${projectId}`;
	try {
		const response = await axios.get(url, {
			params: { workflow_id: workflowId },
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Failed to fetch in-progress workflow results!");
		return undefined;
	}
};


export const getEventResult = async({
	session,
	projectId,
	resultId,
}: {
  session: Session;
  projectId: string;
  resultId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/result/${projectId}/${resultId}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getEventTrigger = async({
	session,
	projectId,
	eventId,
	triggerType = "ui",
}: {
  session: Session;
  projectId: string;
  eventId: string;
  triggerType: string;
}) => {
	const response = await axios.get(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/trigger/${projectId}/${triggerType}/${eventId}`,
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export const executeEventTrigger = async({
	session,
	projectId,
	eventId,
	triggerType = "ui",
}: {
  session: Session;
  projectId: string;
  eventId: string;
  triggerType: string;
}) => {
	const response = await axios.post(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_schedule/project_event/trigger/${projectId}/${triggerType}/${eventId}/execute`,
		{},
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export const triggerEvent = async({
	session,
	projectId,
	eventId,
	formData,
}: {
  session: Session;
  projectId: string;
  eventId: string;
  formData: FormData;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/trigger/${projectId}/ui/${eventId}/execute`;
	const response = await axios.post(url, formData, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const clearWorkflowProcess = async({
	session,
	projectId,
	workflowId,
}: {
  session: Session;
  projectId: string;
  workflowId: string;
}) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/trigger/${projectId}/ui/${workflowId}/clear`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				"Content-Type": "application/json",
			},
		},
	);
	if (!response.ok) throw new Error("Failed to clear workflow");
	return response.json();
};

export const triggerWorkflowNode = async({
	session,
	projectId,
	workflowId,
	nodeId,
}: {
  session: Session;
  projectId: string;
  workflowId: string;
  nodeId: string;
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/trigger/${projectId}/execute_node`;
	try {
		const response = await axios.post(
			url,
			{
				workflow_id: workflowId,
				node_id: nodeId,
			},
			{
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Failed to trigger workflow node!");
		return undefined;
	}
};

export const getEventsStatus = async({
	session,
	taskIds,
}: {
	session: Session;
	taskIds: string[];
}) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_events/status`;
	const response = await axios.get(url, {
		params: { task_ids: taskIds.join(",") },
	
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const deleteProjectEvent = async({
	session,
	projectId,
	eventId,
}: {
	session: Session;
	projectId: string;
	eventId: string;
}): Promise<Record<string, string>> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/project_event/${projectId}/${eventId}`;
	try {
		const response = await axios.delete(url, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error(error);
		return { error: "Failed to delete project event!" };
	}
};


export const getTaskStatusById = async(
	session: Session,
	currentTaskId: string,
): Promise<{status: string, result: any}> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/task/status/${currentTaskId}`;
	const response = await axios.get(url, {
		timeout: 5000,	
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};