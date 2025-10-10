import { EventTrigger } from "@/types/projectEvents";
import { Row } from "@tanstack/react-table";
import { WorkflowNode } from "@/components/ProjectEvent/CustomWorkFlow/types";
// Action-related types
export type ActionData = Array<{
  activity_addition: Array<{
    id: string;
    name: string;
    end: string;
    start: string;
    description: string;
  }>;
  activity_deletion: Array<{
    name: string;
  }>;
  activity_modification: Array<{
    id: string;
    status: string;
    revision: {
      name: string;
      reason: string;
      impact_on_start_date: number;
      impact_on_end_date: number;
    } | null;
  }>;
}>;

// Node-related types
export type NodeStatus =
  | "pending"
  | "completed"
  | "running"
  | "failed"
  | "skipped"
  | "cancelled"
  | "retry";

export type NodeData = {
  id: string;
  type?: string;
  title: string;
  description: string;
  status: NodeStatus;
  output: string | any | ActionData;
  children?: NodeData[];
};

export type NodeProps = {
  node: NodeData;
  isLast: boolean;
  onSelect: (node: NodeData) => void;
  isSelected: boolean;
};

// Graph-related types
export type GraphMetadata = {
  frequency: string;
  time: string;
  duration: string;
  time_zone: string;
  online_link: string;
  recurrence_day?: string | string[];
  location?: string;
  resource_id?: string;
  calendar_event_id?: string;
  nodes?: WorkflowNode[];
};

export type EventResource = {
  id: string;
  created_at: string;
  event_id: string;
  metadata: {
    name: string;
    description: string;
    type: string;
  };
  rows?: {
    id: string;
    created_at: string;
    event_resource_id: string;
    row: Record<string, string | number | boolean | null>;
    hidden: boolean;
    history: {
      [date: string]: {
        id: string;
        created_at: string;
        event_resource_id: string;
        row: Record<string, string | number | boolean | null>;
        hidden: boolean;
      }[]
    };
  }
};

export type GraphData = {
  id: string;
  name: string;
  description: string;
  metadata: GraphMetadata;
  created_at: string;
  nodes: NodeData[];
  run_time: string;
  event_type: string; 
  event_schedule?: EventSchedule[];
  event_trigger?: EventTrigger[];
  event_resources?: EventResource[];
};

// Event-related types
export type EventResult = {
  id: string;
  name: string;
  nodes?: NodeData[];
  status: string;
  run_time: string;
  timestamp: string;
  description: string;
  listen?: boolean;
  workflow_id?: string;
  event_id?: string;
  streaming?: boolean;
};

export type EventSchedule = {
  id: string;
  schedule: {
    day: number[];
    time: { run_time: string }[] | { run_time: string };
    start: string;
    end?: string;
    time_zone: string;
    exceptions?: string[];
  };
  event_result: EventResult[];
};

export type ProjectEvents = {
  project_events: GraphData;
};

// Component-specific types
export type SortConfig = {
  key: keyof GraphData;
  direction: "asc" | "desc";
};

export type ScheduleTableRow = {
  id: string;
  schedule?: EventSchedule["schedule"];
  result?: EventResult;
  subRows?: ScheduleTableRow[];
};

// Props types for components
export type BreadcrumbsProps = {
  currentGraph: GraphData | null;
  onBackToList: () => void;
};

export type CalendarViewProps = {
  graphs: GraphData[];
  onSelectGraph: (graphId: string) => void;
};

export type GraphListProps = {
  // graphs: GraphData[];
  // onSelectGraph: (graphId: string) => void;
  // setCurrentResult?: (result: EventResult | null) => void;
  // viewMode: ViewMode;
  // setViewMode: (_: ViewMode) => void;
};

export type EventScheduleListProps = {
  graphs: EventSchedule[];
  // onSelectGraph: (event: EventResult) => void;
  eventId?: string;
  // setIsLoadingResult?: (isLoading: boolean) => void;
  compact?: boolean;
};

export type NodeNarrativeProps = {
  nodes: NodeData[];
  onSelectNode: (node: NodeData) => void;
  selectedNode: NodeData | null;
};

// Utility types
export type ColorMapping = {
  [K in NodeStatus]: {
    icon: JSX.Element;
    border: string;
  };
};

export type DayMapping = {
  [key: string]: number;
};


export enum ViewMode {
	GRID = "grid",
	LIST = "list",
	CALENDAR = "calendar",
}

// Event access role enum
export enum EventAccessRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
  PARTICIPANT = "participant",
}


export type IdentificationType = "directory_id" | "email" | "user_id";


export interface ParticipantMetadataFields {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  directory_id?: string;
  [key: string]: any;
}

export type ParticipantMetadata = {
  role: EventAccessRole;
  identification: IdentificationType;
  metadata: ParticipantMetadataFields;
};

export type Participant = {
  id: string;
  event_id: string;
  participant_metadata: ParticipantMetadata;
};
