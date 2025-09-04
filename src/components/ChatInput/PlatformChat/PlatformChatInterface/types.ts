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
  speed: number; // 1-5 scale (5 = fastest)
  performance: number; // 1-5 scale (5 = highest)
  cost: "low" | "medium" | "high";
  description: string;
  bestFor: string;
  contextSize: "small" | "medium" | "large" | "extra-large";
};

export const MODELS: ModelType[] = [
	{ 
		id: "claude-sonnet-4", 
		name: "Claude Sonnet 4",
		speed: 3,
		performance: 5,
		cost: "high",
		description: "Top-tier model for the most demanding tasks",
		bestFor: "Highly complex tasks requiring maximum intelligence",
		contextSize: "medium",
	},
	{ 
		id: "gemini-2.5-pro", 
		name: "Gemini 2.5 Pro",
		speed: 2,
		performance: 4,
		cost: "medium",
		description: "Advanced model for complex reasoning and analysis",
		bestFor: "Long complex tasks with lots of data",
		contextSize: "extra-large",
	},
	{ 
		id: "gemini-2.5-flash", 
		name: "Gemini 2.5 Flash",
		speed: 4,
		performance: 3,
		cost: "low",
		description: "Fast and efficient for quick responses",
		bestFor: "Small tasks that need faster results, ideal for chat",
		contextSize: "medium",
	},
	{ 
		id: "claude-3-7-sonnet", 
		name: "Claude 3.7 Sonnet",
		speed: 3,
		performance: 4,
		cost: "high",
		description: "Balanced model with excellent reasoning capabilities",
		bestFor: "Mid-level complex tasks requiring high quality",
		contextSize: "large",
	},

	{
		id: "claude-opus-4",
		name: "claude opus 4",
		speed: 3,
		performance: 5,
		cost: "high",
		description: "Best model money can get",
		bestFor: "Highly complex tasks requiring maximum intelligence",
		contextSize: "medium",
	},
]; 