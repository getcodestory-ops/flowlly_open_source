import axios from "axios";
import { type Session } from "@supabase/supabase-js";

interface WebSocketToken {
  token: string;
}

export const getWebSocketAuthToken = async (
  session: Session,
  project_id: string
): Promise<WebSocketToken> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/auth/websocket/${project_id}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );
    if (!response.data.token) {
      return Promise.reject("No token found");
    }

    return response.data.token;
  } catch (error) {
    return Promise.reject(error);
  }
};
