import { Session } from "@supabase/supabase-js";
import { ChatEntity, ChatMessage } from "../types/project";

const API_URL = "https://fastapi.eastus.cloudapp.azure.com";

export const getChatSessions = async (
  session: Session,
  projectId: string
): Promise<ChatEntity[]> => {
  if (!session.access_token) return [];

  const response = await fetch(`${API_URL}/agent/chat_entity/${projectId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data.chat_entities || [];
};

export const createNewChatSession = async (
  session: Session,
  chatName: string,
  projectId: string
): Promise<ChatEntity> => {
  if (!session.access_token) throw new Error("No session token");

  const response = await fetch(`${API_URL}/agent/chat_entity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      chat_name: chatName,
      chat_details: "Mobile chat",
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data.chat_entity;
};

export const sendChatMessage = async (
  session: Session,
  message: string,
  chatId: string,
  projectId: string,
  brainId: string | null = null
): Promise<{ agent_response: string }> => {
  if (!session.access_token) throw new Error("No session token");

  const response = await fetch(`${API_URL}/agent/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      task: message,
      chat_entity_id: chatId,
      project_id: projectId,
      brain_id: brainId,
      response_type: "general",
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

export const getChatHistory = async (
  session: Session,
  chatId: string
): Promise<ChatMessage[]> => {
  if (!session.access_token) return [];

  const response = await fetch(`${API_URL}/agent/chats/${chatId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data.chats || [];
};
