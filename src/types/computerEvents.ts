// Computer/Sandbox Event Types and Schema

export interface BaseComputerEvent {
  action: string;
  timestamp: number;
  sandbox_id: string;
}

export interface SandboxStartedEvent extends BaseComputerEvent {
  action: "sandbox_started";
  environment?: string;
  resources?: {
    cpu: string;
    memory: string;
    storage: string;
  };
}

export interface SandboxStoppedEvent extends BaseComputerEvent {
  action: "sandbox_stopped";
  reason?: string;
  duration?: number;
}

export interface FileCreatedEvent extends BaseComputerEvent {
  action: "file_created";
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
}

export interface FileEditedEvent extends BaseComputerEvent {
  action: "file_edited";
  file_name: string;
  file_path: string;
  old_content?: string;
  new_content?: string;
  changes_summary?: string;
}

export interface FileWritingEvent extends BaseComputerEvent {
  action: "file_writing";
  file_name: string;
  file_path: string;
  content: string;
  append?: boolean;
}

export interface FileAppendedEvent extends BaseComputerEvent {
  action: "file_appended";
  file_name: string;
  file_path: string;
  appended_content: string;
}

export interface CommandExecutedEvent extends BaseComputerEvent {
  action: "command_executed";
  command: string;
  working_directory?: string;
  exit_code?: number;
  output?: string;
  error?: string;
}

export interface GoogleSearchEvent extends BaseComputerEvent {
  action: "google_search";
  query: string;
  results_count?: number;
  top_result?: string;
}

export interface ProjectDocsSearchEvent extends BaseComputerEvent {
  action: "project_docs_search";
  query: string;
  documents_found?: number;
  relevant_docs?: string[];
}

export interface ProcessStartedEvent extends BaseComputerEvent {
  action: "process_started";
  process_name: string;
  pid?: number;
  command?: string;
}

export interface ProcessStoppedEvent extends BaseComputerEvent {
  action: "process_stopped";
  process_name: string;
  pid?: number;
  exit_code?: number;
}

export interface NetworkRequestEvent extends BaseComputerEvent {
  action: "network_request";
  url: string;
  method: string;
  status_code?: number;
  response_time?: number;
}

export interface ErrorEvent extends BaseComputerEvent {
  action: "error";
  error_type: string;
  error_message: string;
  stack_trace?: string;
  file_path?: string;
}

export interface TerminalOutputEvent extends BaseComputerEvent {
  action: "terminal_output";
  content: string;
  source?: string; // e.g., "markdown_terminal", "agent_response", "command_output"
}

export type ComputerEvent = 
  | SandboxStartedEvent
  | SandboxStoppedEvent
  | FileCreatedEvent
  | FileEditedEvent
  | FileWritingEvent
  | FileAppendedEvent
  | CommandExecutedEvent
  | GoogleSearchEvent
  | ProjectDocsSearchEvent
  | ProcessStartedEvent
  | ProcessStoppedEvent
  | NetworkRequestEvent
  | ErrorEvent
  | TerminalOutputEvent;

// Computer State Interface
export interface ComputerState {
  isRunning: boolean;
  sandbox_id: string | null;
  currentDirectory: string;
  runningProcesses: Array<{
    name: string;
    pid: number;
    command: string;
    startTime: number;
  }>;
  fileSystem: Array<{
    name: string;
    path: string;
    type: "file" | "directory";
    size?: number;
    lastModified: number;
    isNew?: boolean;
    isModified?: boolean;
  }>;
  recentActivity: ComputerEvent[];
  systemInfo?: {
    cpu: string;
    memory: string;
    storage: string;
    environment: string;
  };
}

// Animation Types
export type AnimationType = 
  | "file-created"
  | "file-edited"
  | "command-executed"
  | "search-performed"
  | "process-started"
  | "error-occurred"
  | "typing"
  | "loading";

export interface AnimationState {
  type: AnimationType;
  target?: string;
  duration: number;
  startTime: number;
}
