import { ProcessedFile } from "@/api/agentRoutes";

export type FileUploadResponse = {
  task_id?: string;
  status?: string;
  error?: string;
  [key: string]: any;
};

export type FileUploadStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error" | "processing";
  progress: number;
  error?: string;
  taskId?: string;
  result?: ProcessedFile;
};

export type PlatformChatInterfaceProps = {
  folderId: string;
  chatTarget: string;
  onContentUpdate?: (newContent: string) => void;
  selectedModel: string;
  includeContext: boolean;
};

export type ModelType = {
  id: string;
  name: string;
};

export const MODELS: ModelType[] = [
	{ id: "gemini-2.0-flash", name: "Gemini Flash" },
	{ id: "gemini-2.0-pro-exp-02-05", name: "Gemini Pro" },
	{ id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
	{ id: "gpt-4o", name: "GPT-4.0" },
]; 