import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import { ScheduleResponse } from "@/types/agentChats";

export const scheduleAgent = async ({
  session,
  agentTask,
  brainId,
  chatId,
  projectId,
}: {
  session: Session;
  agentTask: string;
  brainId: string;
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

export const getTaskStatus = async (
  session: Session,
  currentTaskId: string
): Promise<ScheduleResponse> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/result/${currentTaskId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data;
};

export const getCriticalPath = async ({
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
