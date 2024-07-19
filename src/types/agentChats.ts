interface UpdateScheduleContent {
  name?: string;
  reason?: string;
  impact_on_start_date?: number;
  impact_on_end_date?: number;
  revision_id?: string;
}

export interface Antartifact {
  content?: string;
  result?: string;
  attributes?: {
    identifier?: string;
    title?: string;
    type?: string;
  };
}

export interface AgentMessage {
  content?: string | null | UpdateScheduleContent[];
  name?: string;
  role: string;
  function_call?: {
    name?: string;
    arguments?: string;
  };
  response?: string;
  antartifact?: Antartifact;
  antithing?: string;
  metadata?: any;
}

export interface AgentChat {
  id: string;
  created_at: string;
  project_id: string;
  sender: string;
  receiver: string;
  message: AgentMessage;
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
