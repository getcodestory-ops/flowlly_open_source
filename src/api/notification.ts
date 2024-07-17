import { Session } from "@supabase/supabase-js";
import axios, { AxiosResponse } from "axios";
import { ScheduleResponse } from "@/types/agentChats";
import { Revision } from "@/types/activities";

export const getNotifications = async (session: Session, projectId: string) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/updates/notifications/${projectId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data;
};
