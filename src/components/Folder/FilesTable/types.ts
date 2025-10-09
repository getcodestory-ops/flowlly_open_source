export type SortField = "file_name" | "extension" | "created_at";
export type SortDirection = "asc" | "desc";

// Update the ExplorerItem type to include file-specific properties
export type ExplorerItem = {
  type: "folder" | "file";
  name: string;
  created_at: string;
  id: string;
} & (
  | {
      type: "folder";
    }
  | {
      type: "file";
      file_name: string;
      metadata: Record<string, any>;
      url: string;
      project_access_id: string;
      sha: string;
    }
);

// Add a new type for file upload status
export type FileUploadStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error" | "processing";
  progress: number;
  error?: string;
  taskId?: string; // Add taskId to track processing status
};

// Update the type for the response from uploadFileInFolder
export interface UploadFileResponse {
  id?: string;
  task_id?: string;
  status?: string;
  error?: string;
  [key: string]: any;
}

// Extend the ScheduleResponse type to include error property
export interface ExtendedScheduleResponse {
  status: string;
  result?: any;
  error?: string;
}

export interface FilesTableProps {
  files: any[];
  folders: any[];
  folderId: string;
  folderName: string;
  session: any;
  activeProject: any;
  onFolderClick: (folderId: string, folderName: string) => void;
  isProjectWide: boolean;
} 