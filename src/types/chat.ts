export interface Chat {
  chat_id: string;
  user_id: string;
  creation_time: string;
  chat_name: string;
}

export interface ChatMessage {
  id: number;
  message: any;
  fromUser: "question" | "context" | "answer";
}
