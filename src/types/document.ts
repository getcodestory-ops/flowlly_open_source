export type DocumentEntity = {
  id: string;
  title: string;
  content?: any;
};

enum StorageType {
  Root = "root",
  Media = "media",
}

interface StorageResourceEntity {
  id: string;
  created_at?: string;
  file_name: string;
  metadata: Record<string, any>;
  project_access_id: string;
  url: string;
  sha: string;
}

interface ContainerResources {
  storage_resources?: StorageResourceEntity;
}

export interface StorageEntity {
  id: string;
  name: string;
  created_at?: string;
  parent_id?: string;
  type_of: StorageType;
  storage_relations: ContainerResources[];
}
