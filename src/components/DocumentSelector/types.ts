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
  // Single select mode - only allows one document at a time
  singleSelect?: boolean;
}

export interface DocumentSelectorHeaderProps {
  currentFolderStructure: any;
  isProjectWide: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  navigateBack: () => void;
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

// Selection event with modifier keys
export interface SelectionEvent {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean; // Cmd key on Mac
}

// Document Item Props
export interface DocumentItemProps {
  item: DocumentSelectorItem;
  itemIndex: number;
  isSelected: boolean;
  selectedCount: number;
  onToggleSelection: (event?: SelectionEvent) => void;
  onFolderClick?: () => void;
  onOpenInSidePanel?: () => void;
  onRename: (newName: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onSetOutputFolder?: () => void;
  isOutputFolder?: boolean;
  // Placeholder actions
  onMove?: () => void;
  // Copy to folder (files only)
  onCopy?: () => void;
  // Bulk actions (when multiple selected)
  onBulkDelete?: () => void;
  onBulkMove?: () => void;
  onBulkAddToChat?: () => void;
  onBulkCopy?: () => void;
  // Prefetch on hover (folders only)
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  // Folder operations (create/upload)
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
  onUploadFile?: () => void;
}

// Document Item Actions (Context Menu) Props
export interface DocumentItemActionsProps {
  item: DocumentSelectorItem;
  onRename: () => void;
  onDelete: () => void;
  onMove: () => void;
  onAddToChat: () => void;
  onView?: () => void;
  onSetOutputFolder?: () => void;
  isOutputFolder?: boolean;
}

// Delete Confirm Dialog Props
export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: "file" | "folder";
  onConfirm: () => void;
  isDeleting?: boolean;
}

// Rename Dialog Props
export interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  itemType: "file" | "folder";
  onConfirm: (newName: string) => void;
  isRenaming?: boolean;
}

// Document Grid Props
export interface DocumentGridProps {
  items: DocumentSelectorItem[];
  selectedItems: SelectedItem[];
  onToggleSelection: (item: SelectedItem, event?: SelectionEvent) => void;
  onRangeSelection: (startIndex: number, endIndex: number) => void;
  onFolderClick: (folderId: string, folderName: string) => void;
  onOpenInSidePanel: (fileId: string, fileName: string) => void;
  onRenameFile: (fileId: string, newName: string) => Promise<boolean>;
  onDeleteFile: (fileId: string, fileName: string) => Promise<boolean>;
  onSetOutputFolder: (folderId: string, folderName: string) => void;
  contextFolderId?: string;
  isLoading?: boolean;
  // Bulk actions
  onBulkDelete?: () => void;
  onBulkMove?: () => void;
  onBulkAddToChat?: () => void;
  onBulkCopy?: () => void;
  // Copy single file
  onCopyFile?: (fileId: string, fileName: string) => void;
  // Move single file
  onMoveFile?: (fileId: string, fileName: string) => void;
  // Prefetch on hover
  onPrefetchFolder?: (folderId: string) => void;
  // Folder operations (create/upload)
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
  onUploadFile?: () => void;
}

// Document Drop Zone Props
export interface DocumentDropZoneProps {
  children: React.ReactNode;
  onFilesDropped: (files: FileList) => void;
  disabled?: boolean;
  className?: string;
}

// useDocumentActions hook return type
export interface UseDocumentActionsReturn {
  // File operations
  renameFile: (fileId: string, newName: string) => Promise<boolean>;
  deleteFile: (fileId: string, folderId: string) => Promise<boolean>;
  // Folder placeholder operations
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;
  // Move placeholder
  moveItem: (itemId: string, targetFolderId: string) => void;
  // Loading states
  isRenaming: boolean;
  isDeleting: boolean;
} 