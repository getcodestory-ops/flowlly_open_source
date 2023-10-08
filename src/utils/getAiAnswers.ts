import { Session } from "@supabase/supabase-js";
import { Brain } from "@/utils/store";
import { handleStreams } from "./handleStream";

export const getContext = async (
  sessionToken: Session,
  query: string,
  selectedContext: Brain
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/context?question=${query}&spacename=${selectedContext.id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken!.access_token}`,
      },
    }
  );
  const context = await response.json();
  return context.response;
};

export const getAnswer = async (
  sessionToken: Session,
  query: string,
  context: any
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/answers_next?question=${query}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken!.access_token}`,
      },
      body: context[0].page_content,
    }
  );

  return response;
};

export const getContexualAnswerStream = async (
  sessionToken: Session,
  chat_id: string,
  brain_id: string,
  question: string
) => {
  const { handleStream } = handleStreams();

  const chat_query = {
    question: question,
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/${chat_id}/question/stream?brain_id=${brain_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken!.access_token}`,
        },
        body: JSON.stringify(chat_query),
      }
    );
    if (!response.ok) {
      console.log(response);

      return;
    }

    if (response.body === null) {
      throw new Error("Did not get response");
    }

    await handleStream(response.body.getReader());
  } catch (error) {
    console.log(error);
  }
};

export const getContexualAnswer = async (
  sessionToken: Session,
  chat_id: string,
  brain_id: string,
  question: string
) => {
  const chat_query = {
    question: question,
  };
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/chat/${chat_id}/question?brain_id=${brain_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken!.access_token}`,
        },
        body: JSON.stringify(chat_query),
      }
    );
    if (!response.ok) {
      console.log(response);

      return;
    }

    if (response.body === null) {
      throw new Error("Did not get response");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};
