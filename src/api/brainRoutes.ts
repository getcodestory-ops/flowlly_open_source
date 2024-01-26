import { Session } from "@supabase/supabase-js";
import { Chat } from "@/types/chat";
import axios from "axios";

export const getBrains = async (
  sessionToken: Session,
  project_access_id?: string
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/brains/`; // Replace 'YOUR_API_ENDPOINT' with your actual API URL.

  try {
    const response = await axios.get(url, {
      params: {
        project_access_id: project_access_id,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken.access_token}`, // Replace 'YOUR_BEARER_TOKEN' with your actual token.
      },
    });

    return response.data.brains;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};
