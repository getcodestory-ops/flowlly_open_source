import { useCallback, useState, useRef } from "react";
import { uploadFileInFolder } from "@/api/folderRoutes";
import { getTaskStatus } from "@/api/schedule_routes";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedFile } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";

// Supported file types for drag and drop
export const SUPPORTED_FILE_TYPES = {
	// Images
	"image/jpeg": { extension: "jpg", category: "image" },
	"image/png": { extension: "png", category: "image" },
	"image/gif": { extension: "gif", category: "image" },
	"image/webp": { extension: "webp", category: "image" },
	"image/svg+xml": { extension: "svg", category: "image" },
	// Documents
	"application/pdf": { extension: "pdf", category: "document" },
	"text/plain": { extension: "txt", category: "text" },
	"text/markdown": { extension: "md", category: "text" },
	"text/csv": { extension: "csv", category: "data" },
	"application/json": { extension: "json", category: "data" },
	// Office documents
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extension: "docx", category: "office" },
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extension: "xlsx", category: "office" },
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": { extension: "pptx", category: "office" },
	"application/msword": { extension: "doc", category: "office" },
	"application/vnd.ms-excel": { extension: "xls", category: "office" },
	"application/vnd.ms-powerpoint": { extension: "ppt", category: "office" },
	// Audio
	"audio/mpeg": { extension: "mp3", category: "audio" },
	"audio/wav": { extension: "wav", category: "audio" },
	"audio/ogg": { extension: "ogg", category: "audio" },
	"audio/mp4": { extension: "m4a", category: "audio" },
	"audio/x-m4a": { extension: "m4a", category: "audio" },
	"audio/webm": { extension: "webm", category: "audio" },
} as const;

// Also check by extension for files where mime type might not be accurate
export const SUPPORTED_EXTENSIONS = new Set([
	"jpg", "jpeg", "png", "gif", "webp", "svg",
	"pdf", "txt", "md", "csv", "json",
	"doc", "docx", "xls", "xlsx", "ppt", "pptx",
	"mp3", "wav", "ogg", "m4a", "webm",
]);

export const getFileExtension = (filename: string): string => {
	const lastDotIndex = filename.lastIndexOf(".");
	// No dot, or dot is at the start (hidden file like .gitignore), or dot is at the end
	if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
		return "";
	}
	return filename.slice(lastDotIndex + 1).toLowerCase();
};

export const isFileSupported = (file: File): boolean => {
	// Check by exact mime type first
	if (file.type && SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
		return true;
	}
	
	// Check by mime type category (e.g., image/*, audio/*, text/*)
	if (file.type) {
		const mimeCategory = file.type.split("/")[0];
		if (["image", "audio", "text"].includes(mimeCategory)) {
			return true;
		}
		// Allow common application types
		if (file.type.startsWith("application/pdf") || 
			file.type.startsWith("application/json") ||
			file.type.startsWith("application/vnd.ms-") ||
			file.type.startsWith("application/vnd.openxmlformats-")) {
			return true;
		}
	}
	
	// Check by extension
	const ext = getFileExtension(file.name);
	if (ext && SUPPORTED_EXTENSIONS.has(ext)) {
		return true;
	}
	
	// For files without extension and without detected mime type,
	// allow them through - the server will validate
	// This handles cases like macOS screenshots or untitled text files
	if (!ext && (!file.type || file.type === "application/octet-stream")) {
		return true;
	}
	
	return false;
};

// Get extension from MIME type (handles both exact and category matches)
export const getExtensionFromMimeType = (mimeType: string): string => {
	// First check exact match
	if (SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES]) {
		return SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES].extension;
	}
	
	// For generic image types, try to extract from mime type
	const parts = mimeType.split("/");
	if (parts.length === 2) {
		const [category, subtype] = parts;
		
		// Handle common image subtypes
		if (category === "image") {
			if (subtype === "jpeg") return "jpg";
			if (["png", "gif", "webp", "svg+xml"].includes(subtype)) {
				return subtype === "svg+xml" ? "svg" : subtype;
			}
			// Default for other image types
			return "png";
		}
		
		// Handle audio subtypes
		if (category === "audio") {
			if (subtype === "mpeg" || subtype === "mp3") return "mp3";
			if (["wav", "ogg", "webm"].includes(subtype)) return subtype;
			if (subtype === "mp4" || subtype === "x-m4a" || subtype === "m4a") return "m4a";
			return "mp3";
		}
		
		// Handle text subtypes
		if (category === "text") {
			if (subtype === "plain") return "txt";
			if (subtype === "markdown") return "md";
			if (subtype === "csv") return "csv";
			return "txt";
		}
	}
	
	return "";
};

export const getFileCategory = (file: File): string => {
	// Check exact mime type first
	if (file.type && SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
		return SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES].category;
	}
	
	// Check by mime type category
	if (file.type) {
		const mimeCategory = file.type.split("/")[0];
		if (mimeCategory === "image") return "image";
		if (mimeCategory === "audio") return "audio";
		if (mimeCategory === "text") return "text";
		if (file.type.startsWith("application/pdf")) return "document";
		if (file.type.startsWith("application/json")) return "data";
		if (file.type.startsWith("application/vnd.ms-") || 
			file.type.startsWith("application/vnd.openxmlformats-")) return "office";
	}
	
	// Check by extension
	const ext = getFileExtension(file.name);
	if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
	if (["pdf"].includes(ext)) return "document";
	if (["txt", "md"].includes(ext)) return "text";
	if (["csv", "json"].includes(ext)) return "data";
	if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return "office";
	if (["mp3", "wav", "ogg", "m4a", "webm"].includes(ext)) return "audio";
	
	return "file";
};

interface DragDropUploadOptions {
	session: Session | null;
	activeProject: { project_id: string } | null;
	onUploadStart?: (file: File) => void;
	onUploadProgress?: (progress: number, fileIndex: number) => void;
	onUploadComplete?: (result: unknown, processedFile: ProcessedFile) => void;
	onUploadError?: (error: string) => void;
	onProcessingStart?: (fileIndex: number) => void;
	onDragStateChange?: (isDragging: boolean) => void;
}

interface DragDropState {
	isDragging: boolean;
	isProcessing: boolean;
	currentFiles: File[];
}

export const useDragDropUpload = ({
	session,
	activeProject,
	onUploadStart,
	onUploadProgress,
	onUploadComplete,
	onUploadError,
	onProcessingStart,
	onDragStateChange,
}: DragDropUploadOptions) => {
	const { toast } = useToast();
	const [state, setState] = useState<DragDropState>({
		isDragging: false,
		isProcessing: false,
		currentFiles: [],
	});
	
	// Use a ref to track drag enter/leave count for robust detection
	const dragCounterRef = useRef(0);

	// Function to poll for task status after upload
	const pollTaskStatus = useCallback(
		async (taskId: string, filename: string, extension: string): Promise<void> => {
			try {
				if (!session) return;

				const response = await getTaskStatus(session, taskId);

				if (response.status === "completed") {
					const storageResource = response.result;
					// Convert result to ProcessedFile format
					const processedFile: ProcessedFile = {
						type: "file",
						resource_id: storageResource?.id || "",
						resource_url: storageResource?.url || "",
						resource_name: filename,
						extension: extension,
					};
					onUploadComplete?.(response, processedFile);
				} else if (response.status === "pending") {
					// Still processing, poll again after delay
					setTimeout(() => pollTaskStatus(taskId, filename, extension), 3000);
				} else {
					const errorMessage = "File processing failed";
					onUploadError?.(errorMessage);
					toast({
						title: "File Processing Failed",
						description: errorMessage,
						variant: "destructive",
					});
				}
			} catch (error) {
				console.error(`Error checking task status for ${taskId}:`, error);
				const errorMessage = error instanceof Error ? error.message : "Failed to check processing status";
				onUploadError?.(errorMessage);

				toast({
					title: "Processing Status Check Failed",
					description: `Could not check processing status for ${filename}`,
					variant: "destructive",
				});
			}
		},
		[session, onUploadComplete, onUploadError, toast]
	);

	const uploadFile = useCallback(
		async (file: File, fileIndex: number = 0): Promise<void> => {
			if (!session || !activeProject) {
				toast({
					title: "Error",
					description: "No session or active project available",
					variant: "destructive",
				});
				return;
			}

			if (!isFileSupported(file)) {
				toast({
					title: "Unsupported File Type",
					description: `${file.name} is not a supported file type`,
					variant: "destructive",
				});
				return;
			}

			// Get the file extension from filename or MIME type
			const extension = getFileExtension(file.name) || 
				(file.type && getExtensionFromMimeType(file.type)) || 
				"file";

			// Generate a filename with timestamp for pasted files without proper names
			let filename = file.name;
			if (!filename || filename === "image.png" || filename === "blob") {
				const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
				const category = getFileCategory(file);
				filename = `${category}-${timestamp}.${extension}`;
			}

			// Create a new file with a proper name if needed
			const namedFile = filename !== file.name 
				? new File([file], filename, { type: file.type }) 
				: file;

			// Notify upload start
			onUploadStart?.(namedFile);

			try {
				await uploadFileInFolder(
					session,
					activeProject.project_id,
					namedFile,
					null, // No folder ID for chat uploads
					(data) => {
						if (data && data.task_id) {
							onProcessingStart?.(fileIndex);
							pollTaskStatus(data.task_id, filename, extension);
						} else {
							const storageResource = data?.storage_relations?.[0]?.storage_resources;
							const processedFile: ProcessedFile = {
								type: "file",
								resource_id: storageResource?.id || "",
								resource_url: storageResource?.url || "",
								resource_name: filename,
								extension: extension,
							};
							onUploadComplete?.(data, processedFile);
						}
					},
					(progress) => {
						onUploadProgress?.(progress, fileIndex);
					}
				);

				const category = getFileCategory(namedFile);
				toast({
					title: `${category.charAt(0).toUpperCase() + category.slice(1)} Added`,
					description: `${filename} has been uploaded and is ready to use in your chat`,
					duration: 3000,
				});
			} catch (error) {
				console.error("Error uploading file:", error);
				const errorMessage = error instanceof Error ? error.message : "Upload failed";
				onUploadError?.(errorMessage);

				toast({
					title: "Upload Failed",
					description: `Failed to upload ${filename}: ${errorMessage}`,
					variant: "destructive",
				});
			}
		},
		[session, activeProject, onUploadStart, onUploadProgress, onUploadComplete, onUploadError, onProcessingStart, pollTaskStatus, toast]
	);

	// Drag event handlers
	const handleDragEnter = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			
			dragCounterRef.current++;
			
			// Only update state on first enter
			if (dragCounterRef.current === 1) {
				setState((prev) => ({ ...prev, isDragging: true }));
				onDragStateChange?.(true);
			}
		},
		[onDragStateChange]
	);

	const handleDragLeave = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			
			dragCounterRef.current--;
			
			// Only update state when counter reaches 0 (fully left the container)
			if (dragCounterRef.current === 0) {
				setState((prev) => ({ ...prev, isDragging: false }));
				onDragStateChange?.(false);
			}
		},
		[onDragStateChange]
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			
			// Reset the counter on drop
			dragCounterRef.current = 0;
			
			setState((prev) => ({ ...prev, isDragging: false, isProcessing: true }));
			onDragStateChange?.(false);

			const files = Array.from(e.dataTransfer.files);
			if (files.length === 0) {
				setState((prev) => ({ ...prev, isProcessing: false }));
				return;
			}

			// Filter supported files
			const supportedFiles = files.filter(isFileSupported);
			const unsupportedFiles = files.filter((f) => !isFileSupported(f));

			if (unsupportedFiles.length > 0) {
				toast({
					title: "Some files were skipped",
					description: `${unsupportedFiles.length} file(s) have unsupported formats`,
					variant: "destructive",
				});
			}

			if (supportedFiles.length === 0) {
				setState((prev) => ({ ...prev, isProcessing: false }));
				return;
			}

			setState((prev) => ({ ...prev, currentFiles: supportedFiles }));

			// Upload files sequentially
			for (let i = 0; i < supportedFiles.length; i++) {
				await uploadFile(supportedFiles[i], i);
			}

			setState((prev) => ({ ...prev, isProcessing: false, currentFiles: [] }));
		},
		[onDragStateChange, uploadFile, toast]
	);

	// Return the drag handlers and state
	return {
		// State
		isDragging: state.isDragging,
		isProcessing: state.isProcessing,
		currentFiles: state.currentFiles,

		// Event handlers to spread on a container element
		dragHandlers: {
			onDragEnter: handleDragEnter,
			onDragLeave: handleDragLeave,
			onDragOver: handleDragOver,
			onDrop: handleDrop,
		},

		// Individual handlers if needed
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,

		// Upload function for programmatic use
		uploadFile,
	};
};
