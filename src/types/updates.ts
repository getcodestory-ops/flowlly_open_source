export interface UpdateProperties {
  id: string;
  created_at: string;
  type: string;
  project_access_id: string;
  brain_id: string;
  update: Record<string, any>;
  document_access_id?: string;
}
