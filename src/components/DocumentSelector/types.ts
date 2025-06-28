import { StorageResourceEntity } from "@/types/document";
import { GetFolderSubFolderProp } from "@/api/folderRoutes";
import { ProcessedFile } from "@/api/agentRoutes";

export type SortField = "name" | "type" | "created_at";
export type SortDirection = "asc" | "desc";

export interface SelectedItem {
  id: string;
  name: string;
  type: "folder" | "file";
}

export interface DocumentSelectorItem {
  id: string;
  name: string;
  type: "folder" | "file";
  created_at: string;
  // For files
  file_name?: string;
  metadata?: any;
  url?: string;
  project_access_id?: string;
  sha?: string;
}

export interface FileUploadStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error" | "processing";
  progress: number;
  error?: string;
  taskId?: string;
  result?: ProcessedFile;
}

export interface DocumentSelectorProps {
  // Legacy props for backward compatibility
  selectedItems?: SelectedItem[];
  setSelectedItems?: React.Dispatch<React.SetStateAction<SelectedItem[]>>;
  folderSelectOnly?: boolean;
  // New prop to force chat context mode
  useChatContext?: boolean;
  // Optional context ID for form-specific or custom context selection
  contextId?: string;
}

export interface DocumentSelectorHeaderProps {
  currentFolderStructure: any;
  contextFolder: any;
  isProjectWide: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  navigateBack: () => void;
  setAsContextFolder: () => void;
  onCreateFolder: (name: string) => void;
  onScopeChange: (value: string) => void;
  onRefresh: () => void;
  // Props for FileUploadButton
  session: any;
  activeProject: any;
  currentFolderId: string;
  // Props for sorting
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export interface DocumentFileRowProps {
  file: StorageResourceEntity;
  isSelected: boolean;
  onToggleSelection: () => void;
  onOpenInSidePanel: (e: React.MouseEvent) => void;
}

export interface DocumentFolderRowProps {
  folder: GetFolderSubFolderProp;
  isSelected: boolean;
  onToggleSelection: () => void;
  onFolderClick: () => void;
}

export interface SelectedItemsListProps {
  selectedItems: SelectedItem[];
  onRemoveItem: (id: string) => void;
  onOpenInSidePanel?: (fileId: string, fileName: string) => void;
} 