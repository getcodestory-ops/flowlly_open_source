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
