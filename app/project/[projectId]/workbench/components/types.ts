import { Row } from "@tanstack/react-table";

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
  recurrence_day?: string;
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
};

export type EventSchedule = {
  id: string;
  schedule: {
    day: number[];
    time: { run_time: string }[];
    start: string;
    time_zone: string;
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
  graphs: GraphData[];
  onSelectGraph: (graphId: string) => void;
  setCurrentResult: (result: EventResult | null) => void;
};

export type EventScheduleListProps = {
  graphs: EventSchedule[];
  onSelectGraph: (event: EventResult) => void;
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
