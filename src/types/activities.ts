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
  owner?: string;
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
  status: boolean | string;
  creation_time?: string;
  created_by?: string;
  owner?: string;
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
  status?: string;
  // creation_time?: string;
  // created_by?: string;
  owner?: string;
  progress?: number;
}
