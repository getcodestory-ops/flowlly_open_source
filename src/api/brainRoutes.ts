import { Session } from "@supabase/supabase-js";
import { Chat } from "@/types/chat";

export const getBrains = async (sessionToken: Session) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/brains/`; // Replace 'YOUR_API_ENDPOINT' with your actual API URL.

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken.access_token}`, // Replace 'YOUR_BEARER_TOKEN' with your actual token.
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.brains;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};
