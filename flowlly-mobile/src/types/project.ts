export interface ProjectEntity {
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ChatEntity {
  id: string;
  chat_name: string;
  created_at: string;
  project_id: string;
}

export interface ChatMessage {
  sender: string;
  message: {
    content: string;
  };
  created_at: string;
}
