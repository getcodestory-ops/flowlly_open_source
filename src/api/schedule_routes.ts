import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";

export const scheduleAgent = async ({
  session,
  agentTask,
  brainId,
  projectId,
}: {
  session: Session;
  agentTask: string;
  brainId: string;
  projectId: string;
}) => {
  const scheduleProps = {
    task: agentTask,
    brain_id: brainId,
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
