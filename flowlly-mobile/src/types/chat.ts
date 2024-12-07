export interface Chat {
  chat_id: string;
  user_id: string;
  creation_time: string;
  chat_name: string;
  chat_history?: ChatHistory[];
}

export interface ChatMessage {
  id: number;
  message: any;
  fromUser: "question" | "answer";
}

export interface ChatHistory {
  body: {
    assistant?: string;
    chat_id: string;
    message_id?: string;
    message_time?: string;
    user_message?: string;
  };
  item_type: string;
}
