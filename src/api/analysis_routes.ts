import { Session } from "@supabase/supabase-js";
import axios from "axios";

export const processMessageHistory = async (
  session: Session,
  projectAccessId: string
) => {
  if (!session.access_token) return null;
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/schedule/process_history/${projectAccessId}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data;
};
