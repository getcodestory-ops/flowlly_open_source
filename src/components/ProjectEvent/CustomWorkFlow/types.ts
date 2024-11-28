export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  language?: string;
  phoneNumber?: string;
}

export interface ValidateNodeConfig {
  validationPrompt: string;
  validationRules?: string;
  successSteps: WorkflowNode[];
  failureSteps: WorkflowNode[];
}

export interface ExtractNodeConfig {
  columns: {
    name: string;
    description: string;
    dataType: "string" | "number" | "date" | "boolean";
  }[];
}

export interface ConditionNodeConfig {
  conditionPrompt: string;
  trueSteps: WorkflowNode[];
  falseSteps: WorkflowNode[];
}

export interface MicrosoftExcelNodeConfig {
  sheetName: string;
  workbookName?: string;
  operation: "update" | "read" | "append";
  range?: string; // e.g., "A1:D10"
  columns?: {
    name: string;
    sourceField: string;
    dataType: "string" | "number" | "date" | "boolean";
  }[];
  worksheetId?: string; // Microsoft Graph API worksheet ID
  driveId?: string; // Microsoft Graph API drive ID
  fileId?: string; // Microsoft Graph API file ID
}

interface BranchNodes {
  nodes: WorkflowNode[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  description?: string;
  ifValid?: BranchNodes;
  ifInvalid?: BranchNodes;
  config:
    | ValidateNodeConfig
    | ExtractNodeConfig
    | ConditionNodeConfig
    | MicrosoftExcelNodeConfig
    | Record<string, any>;
}

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
