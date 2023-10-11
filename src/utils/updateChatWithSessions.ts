import { Chat, ChatHistory } from "@/types/chat";

export function updateChatWithSession(
  chats: Chat[],
  newSession: ChatHistory
): Chat[] {
  // Find the index of the chat with the matching chat_id
  const chatIndex = chats.findIndex(
    (chat) => chat.chat_id === newSession.body.chat_id
  );

  if (chatIndex === -1) {
    // If the chat_id is not found in the list, you might want to handle this case.
    console.error("Chat ID not found!");
    return chats;
  }

  const chatToUpdate = chats[chatIndex];

  // If chat_history exists, push the new session, otherwise, initialize it
  if (chatToUpdate.chat_history) {
    chatToUpdate.chat_history.push(newSession);
  } else {
    chatToUpdate.chat_history = [newSession];
  }

  // Replace the original chat with the updated one
  chats[chatIndex] = chatToUpdate;

  return chats;
}
