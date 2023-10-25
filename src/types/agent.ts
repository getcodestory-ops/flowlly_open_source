export interface AgentInterfaceProps {
  agent_history: {
    content?: string | null;
    role: string;
    function_call?: {
      name?: string;
      arguments?: string;
    };
    name?: string;
  }[];
}
