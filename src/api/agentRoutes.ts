import { Session } from "@supabase/supabase-js";
import { AgentInterfaceProps } from "@/types/agent";
import {
  AgentChat,
  CreateAgentChatEntity,
  AgentChatEntity,
} from "@/types/agentChats";
import axios from "axios";

interface AgentTask {
  agent_task: string;
  sessionToken: Session;
}

// export const submitTaskToAgent = async (
//   sessionToken: Session,
//   agent_task: string,
//   brain_id: string
// ): Promise<AgentInterfaceProps["agent_history"]> => {
//   try {
//     const body = {
//       task: agent_task,
//       brain_id: brain_id,
//     };

//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionToken.access_token}`,
//         },
//         body: JSON.stringify(body),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     const data = await response.json();
//     return data.agent_response;
//   } catch (error) {
//     throw new Error("Network response was not ok");
//   }
// };

export const createChatEntity = async (
  sessionToken: Session,
  chat_entity: CreateAgentChatEntity
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat_entity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken.access_token}`,
        },
        body: JSON.stringify(chat_entity),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.chat_entity;
  } catch (error) {
    throw new Error("Network response was not ok");
  }
};

export const getAgentChatEntities = async (
  session: Session,
  projectId: string
): Promise<AgentChatEntity[]> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat_entity/${projectId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data.chat_entities;
};

export const getAgentChats = async (
  session: Session,
  projectId: string
): Promise<AgentChat[]> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chats/${projectId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  return response.data.chats;
};

export const getAgentChatHistoryItem = async (
  session: Session,
  historyId: string
): Promise<AgentChat> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/chat/history_item/${historyId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data;
};

export const distributeEmails = async (
  session: Session,
  emailHtml: string,
  emails: string[],
  subject: string
): Promise<AgentChat> => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/task/distribute_email`;

  const data = {
    email_html: emailHtml,
    email_list: emails,
    subject: subject,
  };

  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return response.data;
};

export const sendVoiceNote = async ({
  session,
  projectId,
  formData,
}: {
  session: Session;
  projectId: string;
  formData: FormData;
}) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/agent/task/connect_to_agent/${projectId}`;
  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.data) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};

export const streamVoiceNote = async ({
  session,
  projectId,
  formData,
}: {
  session: Session;
  projectId: string;
  formData: FormData;
}) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/voice_note/${projectId}`;
  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.data) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};

export const endVoiceNote = async ({
  session,
  projectId,
  chatEntityId,
}: {
  session: Session;
  projectId: string;
  chatEntityId: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/voice_note/end/${projectId}`;
  const response = await axios.post(
    url,
    {
      chat_entity_id: chatEntityId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.data) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};

export const getPendingVoiceNotes = async (
  session: Session,
  chatEntityId: string
) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/unprocessed/voice_notes/${chatEntityId}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.data) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};

export const deletePendingVoiceNote = async ({
  session,
  projectId,
  chatEntityId,
}: {
  session: Session;
  projectId: string;
  chatEntityId: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/history/${projectId}`;
  const response = await axios.delete(url, {
    params: { chat_entity_id: chatEntityId },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.data) {
    throw new Error("Network response was not ok");
  }

  return response.data;
};
