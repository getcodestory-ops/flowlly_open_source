interface UpdateScheduleContent {
  name?: string;
  reason?: string;
  impact_on_start_date?: number;
  impact_on_end_date?: number;
  revision_id?: string;
}
export type ProcessedFile = {
  type: string;
  resource_id: string;
  resource_url: string;
  resource_name: string;
  extension: string;
};
export interface Antartifact {
  content?: string;
  result?: string;
  context?: {
    context: string;
    metadata: {
      date?: string;
      type?: string;
      file_name?: string;
      file_sha1?: string;
      file_size?: number;
      chunk_size?: number;
      document_id?: string;
      page_number: number;
      total_pages?: number;
      chunk_overlap?: number;
      summarization?: string;
    };
  }[];
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
    args?: Record<string, string>;
  };
  function_response?:{
    name?: string;
    args?: {
      result?: string;
    };
  }
  files?: ProcessedFile[];
  response?: string;
  antartifact?: Antartifact;
  antithinking?: string;
  metadata?: any;
  child_task_id?: string;
} ; 

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
  relation_id?: string;
  relation_type?: string;
}

export interface AgentChatEntity {
  id: string;
  project_id: string;
  chat_name: string;
  chat_details?: string;
  hidden?: boolean;
  created_at: string;
}
