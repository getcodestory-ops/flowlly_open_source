import { Session } from "@supabase/supabase-js";
import axios from "axios";

export const getNotifications = async (session: Session, projectId: string) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/notifications/${projectId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data;
};
