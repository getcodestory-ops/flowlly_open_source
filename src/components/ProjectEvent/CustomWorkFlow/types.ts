export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  language?: string;
  phoneNumber?: string;
}

export enum FlowCondition {
  SUCCESS = "success",
  FAILURE = "failure",
  ALWAYS = "always",
}

export interface FlowStep {
  target_node_id: string;
  condition: FlowCondition;
  metadata: Record<string, any>;
}
export interface BaseNodeConfig {
  next_steps: FlowStep[];
  retry_count: number;
  max_retries: number;
}

export interface LoopNodeConfig extends BaseNodeConfig {
  target_node_id: string;
}

export interface ValidateNodeConfig extends BaseNodeConfig {
  validationPrompt: string;
  validationRules?: string;
}

export interface ExtractNodeConfig extends BaseNodeConfig {
  columns: {
    name: string;
    description: string;
    dataType: "string" | "number" | "date" | "boolean";
  }[];
}

export interface ConditionNodeConfig extends BaseNodeConfig {
  conditionPrompt: string;
  trueSteps: WorkflowNode[];
  falseSteps: WorkflowNode[];
}

export interface MicrosoftExcelNodeConfig extends BaseNodeConfig {
  sheet_name: string;
  workbookName?: string;
  operation: "update" | "read" | "append";
  range?: string; // e.g., "A1:D10"
  columns?: {
    name: string;
    sourceField: string;
    dataType: "string" | "number" | "date" | "boolean";
  }[];
  table_id?: string; // Microsoft Graph API worksheet ID
  driveId?: string; // Microsoft Graph API drive ID
  fileId?: string; // Microsoft Graph API file ID
}

export interface ConversationNodeConfig extends BaseNodeConfig {
  message_template?: string;
  format_as_table: boolean;
  notification_channels: string[];
  twilio_config?: {
    account_sid: string;
    auth_token: string;
  };
}

export interface DataCollectionNodeConfig extends BaseNodeConfig {
  triggerWord: string;
  prompt: string;
}

export interface TriggerNodeConfig extends BaseNodeConfig {
  triggerBy: "email_subject" | "phone" | "time" | "ui";
  triggerKeyword: string;
  triggerByKey: string;
}

export interface ReportNodeConfig extends BaseNodeConfig {
  folder_path: string;
  file_name: string;
  report_prompt: string;
  generated_reports: any[];
}

export interface DocumentExtractionNodeConfig extends BaseNodeConfig {
  extractionPrompt: string;
  columns: {
    name: string;
    description: string;
    dataType: "string" | "number" | "date" | "boolean";
    optional: boolean;
  }[];
  selectedItems: Array<{
    id: string;
    name: string;
    type: "folder" | "file";
  }>;
}

export interface DocumentSelectionNodeConfig extends BaseNodeConfig {
  selectedItems: Array<{
    id: string;
    name: string;
    type: "folder" | "file";
  }>;
}

export interface UpdateOrCreateResourceNodeConfig extends BaseNodeConfig {
  resourceName: string;
  resourceType: "text" | "table";
  prompt: string;
}

export interface ChatNodeConfig extends BaseNodeConfig {
  type: "chat";
  config: {
    systemPrompt?: string;
  };
}

export interface RunningLogNodeConfig extends BaseNodeConfig {
  logName: string;
  systemPrompt: string;
  description?: string;
}

interface BranchNodes {
  nodes: WorkflowNode[];
}

export enum NodeType {
  FUNCTION = "function",
  CONVERSATION = "conversation",
  DATA_COLLECTION = "data_collection",
  VALIDATION = "validation",
  VALIDATE = "validation",
  LOOP = "loop",
  CONDITIONAL = "conditional",
  EXTRACTION = "extraction",
  EXCEL = "excel",
  REPORT_GENERATION = "report_generation",
  TRIGGER = "trigger",
  DOCUMENT_EXTRACTION = "document_extraction",
  DOCUMENT_SELECTION = "document_selection",
  UPDATE_RESOURCE = "update_resource",
  CHAT = "chat",
  RUNNING_LOG = "running_log",
}

export enum NodeStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

export type WorkflowNode = {
  id: string;
  status: NodeStatus;
  timestamp: string;
  retry_count: number;
  output?: any;
  error?: string;
  input_data?: any;
  output_data?: any;
} & (
  | {
      type: NodeType.VALIDATE;
      config: ValidateNodeConfig;
      title: string;
    }
  | {
      type: NodeType.EXTRACTION;
      config: ExtractNodeConfig;
      title: string;
    }
  | {
      type: NodeType.CONDITIONAL;
      config: ConditionNodeConfig;
      title: string;
    }
  | {
      type: NodeType.EXCEL;
      config: MicrosoftExcelNodeConfig;
      title: string;
    }
  | {
      type: NodeType.LOOP;
      config: LoopNodeConfig;
      title: string;
    }
  | {
      type: NodeType.CONVERSATION;
      config: ConversationNodeConfig;
      title: string;
    }
  | {
      type: NodeType.DATA_COLLECTION;
      config: DataCollectionNodeConfig;
      title: string;
    }
  | {
      type: NodeType.TRIGGER;
      config: TriggerNodeConfig;
      title: string;
    }
  | {
      type: NodeType.REPORT_GENERATION;
      config: ReportNodeConfig;
      title: string;
    }
  | {
      type: NodeType.DOCUMENT_EXTRACTION;
      config: DocumentExtractionNodeConfig;
      title: string;
    }
  | {
      type: NodeType.DOCUMENT_SELECTION;
      config: DocumentSelectionNodeConfig;
      title: string;
    }
  | {
      type: NodeType.UPDATE_RESOURCE;
      config: UpdateOrCreateResourceNodeConfig;
      title: string;
    }
  | {
      type: NodeType.CHAT;
      config: ChatNodeConfig;
      title: string;
    }
  | {
      type: NodeType.RUNNING_LOG;
      config: RunningLogNodeConfig;
      title: string;
    }
);

export interface WorkflowFormData {
  name: string;
  workflowFor: string;
  recurrence: string;
  startTime: string;
  timeZone: string;
  accessBy: "project_access" | "project" | "any";
  accessByKey: string;
  triggerBy: "email_subject" | "phone" | "time" | "ui";
  triggerKeyword: string;
  triggerByKey: string;
  authorizedUsers: string[];
  nodes: WorkflowNode[];
}
