interface UpdateScheduleContent {
  name?: string;
  reason?: string;
  impact_on_start_date?: number;
  impact_on_end_date?: number;
  revision_id?: string;
}

export interface AgentChat {
  id: string;
  created_at: string;
  project_id: string;
  sender: string;
  receiver: string;
  message: {
    content?: string | null | UpdateScheduleContent[];
    name?: string;
    role: string;
    function_call?: {
      name?: string;
      arguments?: string;
    };
    metadata?: any;
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
  hidden?: boolean;
}
