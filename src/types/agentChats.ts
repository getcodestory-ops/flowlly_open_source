export interface AgentChat {
  id: string;
  created_at: string;
  project_id: string;
  sender: string;
  receiver: string;
  message: {
    content?: string | null;
    name?: string;
    role: string;
    function_call?: {
      name?: string;
      arguments?: string;
    };
  };
}

export interface ScheduleResponse {
  status: string;
  result?: any;
}

export interface CreateAgentChatEntity {
  project_id: string;
  chat_name: string;
  chat_details?: string;
}

export interface AgentChatEntity {
  id: string;
  project_id: string;
  chat_name: string;
  chat_details?: string;
}
