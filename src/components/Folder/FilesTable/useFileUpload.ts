import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileInFolder } from "@/api/folderRoutes";
import { getTaskStatus } from "@/api/schedule_routes";
import { FileUploadStatus, UploadFileResponse, ExtendedScheduleResponse } from "./types";
import { useDocumentStore } from "@/hooks/useDocumentStore";

export const useFileUpload = (folderId: string, session: any, activeProject: any) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [textFileName, setTextFileName] = useState("");
	const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
	const [showUploadProgress, setShowUploadProgress] = useState(false);
	const addFile = useDocumentStore((state) => state.addFile);

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
					addFile(folderId, response.result);
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
					folderId,
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
						addFile(folderId, fileData);
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

	const handleCreateTextFile = () => {
		if (!textFileName) return;

		// Create a new text file with the given name
		const file = new File([""], textFileName + ".txt", { type: "text/plain" });

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
			folderId,
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
					// File creation completed without async processing
					// Extract file data from response and add to document store
					if (data?.storage_relations?.[0]?.storage_resources) {
						const fileData = data.storage_relations[0].storage_resources;
						addFile(folderId, fileData);
					}

					// Update status to success if no processing needed
					setUploadingFiles((prev) =>
						prev.map((item) =>
							item.file === file
								? { ...item, status: "success", progress: 100 }
								: item,
						),
					);


					toast({
						title: "Text File Created Successfully",
						description: `Text file "${textFileName}.txt" created successfully`,
						duration: 5000,
					});

					setTextFileName("");
				}
			},
			(progress) => {
				// Update progress
				setUploadingFiles((prev) =>
					prev.map((item) =>
						item.file === file ? { ...item, progress } : item,
					),
				);
			},
		).catch((error) => {
			// Update status to error
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
				description: `Failed to create text file "${textFileName}.txt"`,
				variant: "destructive",
			});
		});
	};

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