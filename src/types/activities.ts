export interface ActivityEntity {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  duration?: number;
  start: string;
  end: string;
  cost?: number;
  dependencies?: string[];
  resources?: string[];
  status?: string;
  creation_time?: string;
  created_by?: string;
  progress: number;
  owner?: string[];
  history?: (Record<string, string> & { impact?: string })[];
  activity_critical: {
    critical_path: boolean;
  };
  revision?: {
    name?: string;
    date?: string;
    probability?: number;
    created_at?: string;
  }[];
}

export interface CreateNewActivity {
  name: string;
  project_id?: string;
  description: string;
  duration: number;
  start: string;
  end: string;
  cost: number;
  dependencies?: string[];
  resources?: string[];
  status: string | boolean;
  creation_time?: string;
  created_by?: string;
  owner?: string[];
  progress?: number;
}

export interface UpdateActivityTypes {
  id: string;
  name: string;
  project_id?: string;
  description: string;
  duration: number;
  start: string;
  end: string;
  cost?: number;
  dependencies?: string[];
  resources?: string[];
  status?: string | boolean;
  // creation_time?: string;
  // created_by?: string;
  active?: boolean;
  owner?: string[];
  progress?: number;
}

interface History {
  id: string;
  name: string;
  impact: string;
  message: string;
  severity: "low" | "moderate" | "high";
  created_at: string;
}

interface ActivityHistory {
  id: string;
  history: History;
}

export interface Revision {
  end?: string | null;
  start?: string | null;
  probability?: number;
  impact_on_end_date: number;
  impact_on_start_date: number;
}

interface ActivityRevision {
  id: string;
  revision: Revision;
  status: string;
  activity_history: ActivityHistory;
}

export interface ActivityRevisionEntity {
  id: string;
  name: string;
  activity_revision: ActivityRevision[];
}
