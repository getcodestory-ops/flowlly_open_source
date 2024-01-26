import { type Session } from "@supabase/supabase-js";
import { UpdateProperties } from "@/types/updates";
import axios from "axios";

export const getUpdates = async (
  session: Session,
  project_access_id: string
): Promise<UpdateProperties[]> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/updates/${project_access_id}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data;
};
