import { useCallback } from "react";
import { uploadFileInFolder } from "@/api/folderRoutes";
import { getTaskStatus } from "@/api/schedule_routes";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedFile } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";

interface PasteUploadOptions {
  session: Session | null;
  activeProject: any;
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (result: any, processedFile: ProcessedFile) => void;
  onUploadError?: (error: string) => void;
  onProcessingStart?: () => void;
}

export const usePasteUpload = ({
	session,
	activeProject,
	onUploadStart,
	onUploadProgress,
	onUploadComplete,
	onUploadError,
	onProcessingStart,
}: PasteUploadOptions) => {
	const { toast } = useToast();
	
	// Function to poll for task status after upload
	const pollTaskStatus = useCallback(async(taskId: string, filename: string, extension: string): Promise<void> => {
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
					// Task completed successfully
				onUploadComplete?.(response, processedFile);
			} else if (response.status === "pending") {
				// Still processing, poll again after delay
				setTimeout(() => pollTaskStatus(taskId, filename, extension), 3000);
			} else {
				// Handle error status
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
	}, [session, onUploadComplete, onUploadError, toast]);

	const handlePasteEvent = useCallback(async(event: ClipboardEvent) => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "No session or active project available",
				variant: "destructive",
			});
			return;
		}

		const clipboardItems = event.clipboardData?.items;
		if (!clipboardItems) return;

		// Look for image items in clipboard
		for (let i = 0; i < clipboardItems.length; i++) {
			const item = clipboardItems[i];
      
			// Check if the item is an image
			if (item.type.startsWith("image/")) {
				event.preventDefault();
        
				const file = item.getAsFile();
				if (!file) continue;

				// Generate a filename with timestamp
				const timestamp = new Date().toISOString()
					.replace(/[:.]/g, "-");
				const extension = file.type.split("/")[1] || "png";
				const filename = `pasted-image-${timestamp}.${extension}`;
        
				// Create a new file with a proper name
				const namedFile = new File([file], filename, { type: file.type });

				// Notify upload start
				onUploadStart?.(namedFile);

				try {
					// Upload the file without a folder ID (for chat context)
					await uploadFileInFolder(
						session,
						activeProject.project_id,
						namedFile,
						null, // No folder ID for chat uploads
						(data) => {
							// Check if the response contains a task_id for async processing
							if (data && data.task_id) {
								// File upload completed, now processing asynchronously
								// File uploaded, starting async processing
								
								// Notify that processing has started
								onProcessingStart?.();
								
								// Start polling for task completion
								pollTaskStatus(data.task_id, filename, extension);
							} else {
								// Direct response without async processing (fallback)
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
							onUploadProgress?.(progress);
						},
					);

					toast({
						title: "Image Pasted Successfully",
						description: `${filename} has been uploaded and is ready to use in your chat`,
						duration: 3000,
					});
				} catch (error) {
					console.error("Error uploading pasted image:", error);
					const errorMessage = error instanceof Error ? error.message : "Upload failed";
          
					onUploadError?.(errorMessage);
          
					toast({
						title: "Upload Failed",
						description: `Failed to upload pasted image: ${errorMessage}`,
						variant: "destructive",
					});
				}

				// Only process the first image found
				break;
			}
		}
	}, [session, activeProject, onUploadStart, onUploadProgress, onUploadComplete, onUploadError, onProcessingStart, pollTaskStatus, toast]);

	return {
		handlePasteEvent,
	};
};
