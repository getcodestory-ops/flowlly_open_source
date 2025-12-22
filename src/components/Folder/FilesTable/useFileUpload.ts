import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileInFolder } from "@/api/folderRoutes";
import { getTaskStatus } from "@/api/schedule_routes";
import { FileUploadStatus, UploadFileResponse, ExtendedScheduleResponse } from "./types";
import { useDocumentStore } from "@/hooks/useDocumentStore";

export const useFileUpload = (folderId: string, session: any, activeProject: any, isProjectWide: boolean = true) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [textFileName, setTextFileName] = useState("");
	const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
	const [showUploadProgress, setShowUploadProgress] = useState(false);
	const { addFile, getFilesForFolder, setFiles } = useDocumentStore();
	
	// Use ref to always access the latest folderId value
	// This prevents stale closures when folderId changes after initial render
	const folderIdRef = useRef(folderId);
	folderIdRef.current = folderId;
	
	// Helper to safely add a file to the store and invalidate query
	const safeAddFile = (fileData: any) => {
		const currentFolderId = folderIdRef.current;
		const existingFiles = getFilesForFolder(currentFolderId) || [];
		// Append the new file to existing files
		setFiles(currentFolderId, [...existingFiles, fileData]);
		
		// Also invalidate the query to ensure consistency
		// Note: Query key uses currentFolderId directly (including "root" string when at root level)
		if (session?.access_token && activeProject?.project_id) {
			queryClient.invalidateQueries({
				queryKey: ["files", session.access_token, activeProject.project_id, currentFolderId, isProjectWide],
			});
		}
	};

	const pollTaskStatus = async(taskId: string, fileIndex: number) => {
		try {
			const response = (await getTaskStatus(
				session,
				taskId,
			)) as ExtendedScheduleResponse;

			// Get the current file name before updating state
			const currentFileName = uploadingFiles[fileIndex]?.file.name || "File";

			if (response.status === "completed") {
				// Task completed successfully
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex ? { ...item, status: "success" } : item,
					),
				);

				// Add processed file to document store if result contains file data
				if (response.result) {
					safeAddFile(response.result);
				}


				toast({
					title: "File Processing Complete",
					description: `${currentFileName} has been processed successfully`,
					duration: 5000,
				});
			} else if (response.status === "pending") {
				// Still pending, poll again after a delay
				setTimeout(() => pollTaskStatus(taskId, fileIndex), 5000);
			} else {
				// Handle any other status as an error
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "error",
								error: "Unexpected processing status",
							}
							: item,
					),
				);

				toast({
					title: "File Processing Error",
					description: `Unexpected status for ${currentFileName}`,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error(`Error checking task status for ${taskId}:`, error);

			// Get the current file name before updating state
			const currentFileName = uploadingFiles[fileIndex]?.file.name || "File";

			// Set status to error
			setUploadingFiles((prev) =>
				prev.map((item, index) =>
					index === fileIndex
						? {
							...item,
							status: "error",
							error: "Failed to check processing status",
						}
						: item,
				),
			);

			toast({
				title: "Status Check Failed",
				description: `Could not check processing status for ${currentFileName}`,
				variant: "destructive",
			});
		}
	};

	const handleFileUpload = async(e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// Initialize upload status for each file
		const fileStatuses: FileUploadStatus[] = Array.from(files).map((file) => ({
			file,
			status: "pending",
			progress: 0,
		}));

		setUploadingFiles(fileStatuses);
		setShowUploadProgress(true);

		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			// Update status to uploading
			setUploadingFiles((prev) =>
				prev.map((item, index) =>
					index === i ? { ...item, status: "uploading", progress: 0 } : item,
				),
			);

			try {
				// Cast the response to our interface
				const response = (await uploadFileInFolder(
					session,
					activeProject.project_id,
					file,
					folderIdRef.current,
					undefined, // callback
					(progress) => {
						// Update progress
						setUploadingFiles((prev) =>
							prev.map((item, index) =>
								index === i ? { ...item, progress } : item,
							),
						);
					},
				)) as UploadFileResponse;

				// Check if the response contains a task_id for processing
				if (response && response.task_id) {
					// Update status to processing
					setUploadingFiles((prev) =>
						prev.map((item, index) =>
							index === i
								? {
									...item,
									status: "processing",
									progress: 100,
									taskId: response.task_id,
								}
								: item,
						),
					);

					// Start polling for task status
					pollTaskStatus(response.task_id, i);
				} else {
					// File upload completed without async processing
					// Extract file data from response and add to document store
					if (response?.storage_relations?.[0]?.storage_resources) {
						const fileData = response.storage_relations[0].storage_resources;
						safeAddFile(fileData);
					}

					// Update status to success if no processing needed
					setUploadingFiles((prev) =>
						prev.map((item, index) =>
							index === i ? { ...item, status: "success", progress: 100 } : item,
						),
					);
				}
			} catch (error) {
				console.error(`Error uploading file ${file.name}:`, error);

				// Update status to error
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === i
							? {
								...item,
								status: "error",
								progress: 0,
								error:
                    error instanceof Error ? error.message : "Upload failed",
							}
							: item,
					),
				);

				toast({
					title: "File Upload Error",
					description: `Failed to upload ${file.name}`,
					variant: "destructive",
				});
			}
		}


		toast({
			title: "Files Uploaded",
			description: `${files.length} file(s) processed`,
			duration: 5000,
		});

		// Clear the file input so the same files can be uploaded again if needed
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Get MIME type based on file extension
	const getMimeType = (filename: string): string => {
		const extension = filename.split('.').pop()?.toLowerCase();
		const mimeTypes: Record<string, string> = {
			'txt': 'text/plain',
			'md': 'text/markdown',
			'csv': 'text/csv',
			'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		};
		return mimeTypes[extension || ''] || 'text/plain';
	};

	const handleCreateTextFile = (fileNameParam?: string) => {
		// Use passed parameter or fall back to state
		const fileName = fileNameParam || textFileName;
		if (!fileName) return;

		const mimeType = getMimeType(fileName);
		
		const file = new File([''], fileName, { type: mimeType });

		// Add the file to the upload progress UI
		const fileStatus: FileUploadStatus = {
			file,
			status: "uploading",
			progress: 0,
		};

		setUploadingFiles([fileStatus]);
		setShowUploadProgress(true);

		uploadFileInFolder(
			session,
			activeProject.project_id,
			file,
			folderIdRef.current,
			(data) => {
				// Check if the response contains a task_id for processing
				if (data && data.task_id) {
					// Update status to processing
					setUploadingFiles((prev) =>
						prev.map((item) =>
							item.file === file
								? {
									...item,
									status: "processing",
									progress: 100,
									taskId: data.task_id,
								}
								: item,
						),
					);
					pollTaskStatus(data.task_id, 0);
				} else {
					if (data?.storage_relations?.[0]?.storage_resources) {
						const fileData = data.storage_relations[0].storage_resources;
						safeAddFile(fileData);
					}

					setUploadingFiles((prev) =>
						prev.map((item) =>
							item.file === file
								? { ...item, status: "success", progress: 100 }
								: item,
						),
					);

					toast({
						title: "File Created Successfully",
						description: `File "${fileName}" created successfully`,
						duration: 5000,
					});

					setTextFileName("");
				}
			},
			(progress) => {
				setUploadingFiles((prev) =>
					prev.map((item) =>
						item.file === file ? { ...item, progress } : item,
					),
				);
			},
		).catch((error) => {
			setUploadingFiles((prev) =>
				prev.map((item) =>
					item.file === file
						? {
							...item,
							status: "error",
							progress: 0,
							error: error instanceof Error ? error.message : "Upload failed",
						}
						: item,
				),
			);

			toast({
				title: "File Creation Error",
				description: `Failed to create file "${fileName}"`,
				variant: "destructive",
			});
		});
	};


	useEffect(() => {
		if (uploadingFiles.length === 0 || !showUploadProgress) return;
		
		const allProcessed = uploadingFiles.every(
			(file) => file.status === "success" || file.status === "error",
		);
		
		if (allProcessed) {
			const timer = setTimeout(() => {
				setShowUploadProgress(false);
				setUploadingFiles([]);
			}, 3000);
			
			return () => clearTimeout(timer);
		}
	}, [uploadingFiles, showUploadProgress]);

	const closeUploadProgress = () => {
		// Only allow closing if all files are processed (success or error)
		const allProcessed = uploadingFiles.every(
			(file) => file.status === "success" || file.status === "error",
		);
		if (allProcessed) {
			setShowUploadProgress(false);
			setUploadingFiles([]);
		}
	};

	return {
		// State
		textFileName,
		uploadingFiles,
		showUploadProgress,
		fileInputRef,
    
		// Actions
		setTextFileName,
		handleFileUpload,
		handleCreateTextFile,
		closeUploadProgress,
	};
}; 