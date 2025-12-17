// Main component
export { DocumentSelector } from "./DocumentSelector";

// Sub-components
export { DocumentSelectorHeader } from "./DocumentSelectorHeader";
export { DocumentGrid } from "./DocumentGrid";
export { DocumentItem } from "./DocumentItem";
export { DocumentItemActions } from "./DocumentItemActions";
export { ContextMenuContent } from "./ContextMenuContent";
export { BulkContextMenuContent } from "./BulkContextMenuContent";
export { DocumentDropZone } from "./DocumentDropZone";
export { DeleteConfirmDialog } from "./DeleteConfirmDialog";
export { RenameDialog } from "./RenameDialog";
export { CopyToFolderDialog } from "./CopyToFolderDialog";
export { CreateFileDialog } from "./CreateFileDialog";
export { EmptyDocumentDisplay } from "./EmptyDocumentDisplay";
export { FileTypeIcon } from "./FileTypeIcon";

// Hooks
export { useDocumentSelector } from "./useDocumentSelector";
export { useDocumentActions } from "./useDocumentActions";

// Reuse existing FilesTable components for upload
export { FileUploadButton as DocumentUploadButton } from "../Folder/FilesTable/FileUploadButton";
export { FileUploadProgress as DocumentUploadProgress } from "../Folder/FilesTable/FileUploadProgress";
export { useFileUpload as useDocumentUpload } from "../Folder/FilesTable/useFileUpload";

// Types
export * from "./types";
