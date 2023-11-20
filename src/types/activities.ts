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
  activity_critical: {
    critical_path: boolean;
  };
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
  status: boolean;
  creation_time?: string;
  created_by?: string;
  owner?: string;
  progress?: number;
}
