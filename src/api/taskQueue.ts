import { type Session } from "@supabase/supabase-js";
import { AddTaskQueue, TaskQueue } from "@/types/taskQueue";
import { Notification } from "@/types/notification";
import axios from "axios";

export const getTaskQueue = async (
  session: Session,
  project_access_id: string
): Promise<TaskQueue[]> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/${project_access_id}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data;
};

export const addModifyTaskQueue = async (
  session: Session,
  project_access_id: string,
  taskQueue: AddTaskQueue
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/${project_access_id}`;
  await axios.post(url, taskQueue, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
};

export const deleteTaskQueue = async (
  session: Session,
  project_access_id: string,
  id: string
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/${project_access_id}/${id}`;
  await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
};

export const getDailyMessagesQueue = async (
  session: Session,
  project_access_id: string
): Promise<Notification[]> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/message/${project_access_id}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data;
};

export const updateQueueMessage = async (
  session: Session,
  project_access_id: string,
  notification: Notification
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/message/${project_access_id}`;
  const response = await axios.put(url, notification, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data;
};

export const deleteQueueMessage = async (
  session: Session,
  project_access_id: string,
  id: string
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_queue/message/${project_access_id}/${id}`;
  await axios.delete(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
};

export const getTaskResult = async (
  session: Session,
  taskId: string,
  projectId: string
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

export const reRunTask = async ({
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
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/task_result/${projectId}`;
  const respone = await axios.put(
    url,
    { task_id: taskId, task_function: taskFunction },
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );
  return respone.data;
};
