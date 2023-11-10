export interface ProjectEntity {
  project_id: string;
  name: string;
  userId: string;
  description?: string; // Optional fields use the '?' syntax
  status?: boolean; // Optional fields use the '?' syntax
  last_update: string;
}

export interface CreateNewProjectEntity {
  name: string;
  description?: string;
}

export interface ShareProjectEntity {
  project_id: string;
  email: string;
  enroll: boolean;
}
