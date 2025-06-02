// Main component
export { DocumentSelector } from "./DocumentSelector";

// Reuse existing FilesTable components
export { FileRow as DocumentFileRow } from "../Folder/FilesTable/FileRow";
export { FolderRow as DocumentFolderRow } from "../Folder/FilesTable/FolderRow";
export { FileUploadButton as DocumentUploadButton } from "../Folder/FilesTable/FileUploadButton";
export { FileUploadProgress as DocumentUploadProgress } from "../Folder/FilesTable/FileUploadProgress";
export { EmptyFilesDisplay as EmptyDocumentsDisplay } from "../Folder/FilesTable/EmptyFilesDisplay";
export { AddFolderButton as DocumentAddFolderButton } from "../Folder/FilesTable/AddFolderButton";

// Only new components needed
export { DocumentSelectorHeader } from "./DocumentSelectorHeader";
export { SelectedItemsList } from "./SelectedItemsList";

// Reuse existing hooks where possible
export { useFileUpload as useDocumentUpload } from "../Folder/FilesTable/useFileUpload";

// Custom hook for document selector logic
export { useDocumentSelector } from "./useDocumentSelector";

// Types
export * from "./types"; 