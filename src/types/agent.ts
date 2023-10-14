export interface AgentInterfaceProps {
  agent_history: {
    content: string;
    role: string;
    function_call?: {
      name: string;
      arguments: string;
    };
    name?: string;
  }[];
}
