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
