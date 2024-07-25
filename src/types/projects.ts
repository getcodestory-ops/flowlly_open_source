export interface ProjectMetadata {
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export interface ProjectEntity {
  project_id: string;
  name: string;
  userId: string;
  description?: string; // Optional fields use the '?' syntax
  status?: boolean; // Optional fields use the '?' syntax
  last_update: string;
  project_type?: string;
  project: ProjectEntity[];
  project_number?: string;
  address?: string;
  metadata?: ProjectMetadata;
}

export interface CreateNewProjectEntity {
  name: string;
  description?: string;
  project_type?: string;
  project_number?: string;
  address?: string;
  metadata?: ProjectMetadata;
}

export interface ShareProjectEntity {
  project_id: string;
  email: string;
  enroll: boolean;
}
