import React, { useEffect, useRef, useState } from "react";
import {
	FileSearch,
	Maximize,
	Trash,
	ChevronLeft,
	ChevronRight,
	MessageCircle,
	ArrowUpDown,
	Folder,
	X,
	CheckCircle,
	AlertCircle,
	Loader2,
	Upload,
} from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { StorageResourceEntity } from "@/types/document";
//components
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MediaDialogContent } from "./MediaViewer/MediaDialogContent";

import { Badge } from "@/components/ui/badge";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import {
	uploadFileInFolder,
	createDocumentInFolder,
	createSubFolder,
} from "@/api/folderRoutes";
import { getTaskStatus } from "@/api/schedule_routes";
import { useToast } from "@/components/ui/use-toast";
import { MediaViewer } from "../Folder/MediaViewer";
import { FileMediaIcon } from "./FileMediaIcon";
import { deleteFile } from "@/api/folderRoutes";
import { formatDate } from "@/utils/calculations";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import ChatButton from "../ChatButton";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { AddNewFolderModal } from "../CreateNewFolderModal/CreateNewFolderModal";

type SortField = "file_name" | "extension" | "created_at";
type SortDirection = "asc" | "desc";

// Update the ExplorerItem type to include file-specific properties
type ExplorerItem = {
  type: "folder" | "file";
  name: string;
  created_at: string;
  id: string;
} & (
  | {
      type: "folder";
    }
  | {
      type: "file";
      file_name: string;
      metadata: Record<string, any>;
      url: string;
      project_access_id: string;
      sha: string;
    }
);

// Add a new type for file upload status
type FileUploadStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error" | "processing";
  progress: number;
  error?: string;
  taskId?: string; // Add taskId to track processing status
};

// Update the type for the response from uploadFileInFolder
interface UploadFileResponse {
  id?: string;
  task_id?: string;
  status?: string;
  error?: string;
  [key: string]: any;
}

// Extend the ScheduleResponse type to include error property
interface ExtendedScheduleResponse {
  status: string;
  result?: any;
  error?: string;
}

export const FilesContent = ({
	files,
	folders,
	folderId,
	folderName,
	session,
	activeProject,
	onFolderClick,
}: {
  files: StorageResourceEntity[];
  folders: any[];
  folderId: string;
  folderName: string;
  session: any;
  activeProject: any;
  onFolderClick: (folderId: string, folderName: string) => void;
}) => {
	const [currentFile, setCurrentFile] = useState<null | StorageResourceEntity>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const filesPerPage = 10; // Adjust this number as needed
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const indexOfLastFile = currentPage * filesPerPage;
	const indexOfFirstFile = indexOfLastFile - filesPerPage;
	const [sortField, setSortField] = useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [searchTerm, setSearchTerm] = useState("");
	const queryClient = useQueryClient();

	const { toast } = useToast();

	// Update the mapping of files to ExplorerItem
	const explorerItems: ExplorerItem[] = [
		...folders.map((folder) => ({
			type: "folder" as const,
			name: folder.name,
			created_at: folder.created_at,
			id: folder.id,
		})),
		...files.map((file) => ({
			type: "file" as const,
			name: file.file_name,
			created_at: file.created_at || "",
			id: file.id,
			// Include all StorageResourceEntity properties
			file_name: file.file_name,
			metadata: file.metadata,
			url: file.url,
			project_access_id: file.project_access_id,
			sha: file.sha,
		})),
	];

	const sortedAndFilteredItems = explorerItems
		.filter(
			(item) =>
				item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.type === "file" &&
          item.metadata?.extension
          	?.toLowerCase()
          	.includes(searchTerm.toLowerCase())),
		)
		.sort((a, b) => {
			// Sort folders before files
			if (a.type !== b.type) {
				return a.type === "folder" ? -1 : 1;
			}

			// Then apply the selected sort
			if (sortField === "file_name") {
				return sortDirection === "asc"
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name);
			}
			if (sortField === "extension") {
				if (a.type === "file" && b.type === "file") {
					const aExt = a.metadata?.extension || "";
					const bExt = b.metadata?.extension || "";
					return sortDirection === "asc"
						? aExt.localeCompare(bExt)
						: bExt.localeCompare(aExt);
				}
				return 0;
			}
			return sortDirection === "asc"
				? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
				: new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});

	const currentItems = sortedAndFilteredItems.slice(
		indexOfFirstFile,
		indexOfLastFile,
	);
	const totalPages = Math.ceil(sortedAndFilteredItems.length / filesPerPage);

	const chatRef = useRef<HTMLDivElement>(null);

	// useEffect(() => {
	//   const handleClickOutside = (event: MouseEvent) => {
	//     if (
	//       chatRef.current &&
	//       !chatRef.current.contains(event.target as Node) &&
	//       isChatOpen &&
	//       !isClosing
	//     ) {
	//       setIsClosing(true);
	//       setTimeout(() => {
	//         setIsChatOpen(false);
	//         setIsClosing(false);
	//       }, 300); // Match this with the CSS transition duration
	//     }
	//   };

	//   document.addEventListener("mousedown", handleClickOutside);
	//   return () => {
	//     document.removeEventListener("mousedown", handleClickOutside);
	//   };
	// }, [isChatOpen, isClosing]);

	return (
		<div className="relative">
			<Card className="xl:col-span-3">
				<CardHeader className="flex flex-row items-center">
					<div className="grid gap-2">
						<CardTitle>Files & Folders</CardTitle>
						<CardDescription>Contents of {folderName}</CardDescription>
					</div>
					<div className="ml-auto flex gap-2">
						<AddNewFolderModal
							onAdd={(name) => {
								if (!activeProject) return;
								createSubFolder(
									session,
									activeProject.project_id,
									name,
									folderId,
									true, // isProjectWide - you might want to pass this as a prop
									() => {
										// Invalidate the folders query
										queryClient.invalidateQueries({
											queryKey: [`fetchProjectFolders-${folderId}`],
										});
									},
								);
							}}
							parentFolderName={folderName ?? "Other"}
						>
							<Button size="sm" variant="default">
                + Add Folder
							</Button>
						</AddNewFolderModal>
						<AddFileInFolderButton
							activeProject={activeProject}
							folderId={folderId}
							session={session}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							className="max-w-sm"
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search files..."
							value={searchTerm}
						/>
					</div>
					<Table>
						<FilesHeader
							setSortDirection={setSortDirection}
							setSortField={setSortField}
							sortDirection={sortDirection}
							sortField={sortField}
						/>
						<TableBody>
							{currentItems.map((item, i) =>
								item.type === "folder" ? (
									<FolderRow
										folder={item}
										key={`folder-${i}`}
										onFolderClick={onFolderClick}
									/>
								) : (
									<FileRow
										activeProject={activeProject}
										currentFile={currentFile}
										email={session.user.email}
										folderId={folderId}
										key={`file-${i}`}
										resource={item as unknown as StorageResourceEntity}
										session={session}
										setCurrentFile={setCurrentFile}
									/>
								),
							)}
							{currentItems.length === 0 && <EmptyFileRow />}
						</TableBody>
					</Table>
					<div className="flex justify-between items-center mt-4">
						<div className="text-sm text-gray-500">
              Showing {indexOfFirstFile + 1}-
							{Math.min(indexOfLastFile, sortedAndFilteredItems.length)} of{" "}
							{sortedAndFilteredItems.length} items
						</div>
						<div className="flex gap-2">
							<Button
								disabled={currentPage === 1}
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								size="sm"
								variant="outline"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								disabled={currentPage === totalPages}
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								size="sm"
								variant="outline"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
			{/* <FilePreviewCard resource={currentFile} /> */}

			{/* Floating chat button */}
			<ChatButton
				isOpen={isChatOpen}
				onClick={() => setIsChatOpen(!isChatOpen)}
				openText={`Chat about ${folderName}`}
				title={
					isChatOpen
						? "Close chat assistant"
						: `Chat with Flowlly AI about ${folderName}`
				}
			/>
			{/* Chat component*/}
			{(isChatOpen || isClosing) && (
				<div
					className={`fixed bottom-2 right-4 w-[calc(100vw-200px)] z-30 bg-white border border-gray-200 rounded-lg  overflow-hidden transition-opacity duration-300 ${
						isClosing ? "opacity-0" : "opacity-100"
					}`}
					ref={chatRef}
				>
					<PlatformChatComponent
						chatTarget="folder"
						folderId={folderId}
						folderName={folderName}
					/>
					<div className="fixed p-2 z-50 top-3 ">
						<Button
							onClick={() => {
								setIsClosing(true);
								setTimeout(() => {
									setIsChatOpen(false);
									setIsClosing(false);
								}, 300);
							}}
							size="icon"
							variant="outline"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

const FilePreviewCard = ({
	resource,
}: {
  resource: StorageResourceEntity | null;
}) => {
	return (
		<Card className="sticky top-4 self-start">
			<CardHeader className="flex flex-row items-center">
				<div className="grid gap-2">
					<CardTitle>Preview</CardTitle>
					<CardDescription>Preview the hovered file</CardDescription>
				</div>
				{resource && (
					<Dialog>
						<DialogTrigger asChild>
							<Button className="ml-auto gap-1" variant="ghost">
								<Maximize size={16} />
							</Button>
						</DialogTrigger>
						<DialogContent
							aria-describedby="file viewer"
							className="max-w-6xl flex flex-col items-center justify-center"
						>
							<MediaDialogContent resource={resource} />
						</DialogContent>
					</Dialog>
				)}
			</CardHeader>
			<CardContent>
				{resource && (
					<div className="flex flex-col items-center justify-center">
						<div className="flex flex-row w-full">
							<div
								className="font-medium flex-1
                overflow-hidden whitespace-nowrap overflow-ellipsis
              "
							>
								{resource.file_name}
							</div>
							<Badge variant="secondary">{resource.metadata.extension}</Badge>
						</div>
						<MediaViewer resource={resource} />
					</div>
				)}
			</CardContent>
		</Card>
	);
};

const FilesHeader = ({
	sortField,
	sortDirection,
	setSortField,
	setSortDirection,
}: {
  sortField: SortField;
  sortDirection: SortDirection;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
}) => {
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const SortButton = ({
		field,
		children,
	}: {
    field: SortField;
    children: React.ReactNode;
  }) => (
		<Button
			className="hover:bg-transparent"
			onClick={() => handleSort(field)}
			variant="ghost"
		>
			{children}
			{sortField === field && (
				<ArrowUpDown
					className={`ml-2 h-4 w-4 ${
						sortDirection === "desc" ? "transform rotate-180" : ""
					}`}
				/>
			)}
		</Button>
	);

	return (
		<TableHeader>
			<TableRow>
				<TableHead className="hidden md:table-cell">
					<SortButton field="file_name">File Name</SortButton>
				</TableHead>
				<TableHead className="hidden sm:table-cell">
					<SortButton field="extension">Type</SortButton>
				</TableHead>
				<TableHead className="hidden md:table-cell">
					<SortButton field="created_at">Date</SortButton>
				</TableHead>
				<TableHead className="hidden md:table-cell">Trash</TableHead>
			</TableRow>
		</TableHeader>
	);
};

const FileRow = ({
	resource,
	setCurrentFile,
	currentFile,
	session,
	activeProject,
	folderId,
}: {
  resource: any;
  email: string;
  setCurrentFile: (resource: any) => void;
  currentFile: any;
  session: any;
  activeProject: any;
  folderId: string;
}) => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const { mutate } = useMutation({
		mutationFn: deleteFile,
		onError: (error) => {
			console.error(error);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [`fetchFiles-${folderId}`],
			});
			toast({
				title: "File Deleted Successfully",
				description: `File ${resource.file_name} deleted successfully`,
				duration: 20000,
			});
			setShowDeleteDialog(false);
		},
	});

	const handleDelete = () => {
		mutate({
			session,
			projectId: activeProject.project_id,
			fileId: resource.id,
		});
	};

	return (
		<TableRow
			className={`hover:bg-blue-100  ${
				currentFile?.id === resource.id ? "bg-blue-100" : ""
			}`}
			onMouseEnter={() => setCurrentFile(resource)}
		>
			<Dialog>
				<DialogTrigger asChild>
					<TableCell className="cursor-pointer">
						<div className="flex flex-row justify-start gap-4">
							<FileMediaIcon fileExt={resource.metadata.extension + ""} />
							<div className="font-medium">{resource.file_name}</div>
						</div>
					</TableCell>
				</DialogTrigger>
				<DialogContent
					aria-describedby="file viewer"
					className="max-w-6xl flex flex-col items-center justify-center"
				>
					<MediaDialogContent resource={resource} />
				</DialogContent>
			</Dialog>
			<TableCell className="hidden sm:table-cell">
				<Badge variant="secondary">{resource.metadata.extension}</Badge>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{formatDate(resource.created_at)}
			</TableCell>
			<TableCell className="cursor-pointer hidden md:table-cell">
				<Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
					<DialogTrigger asChild>
						<Trash size={16} />
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<div className="grid gap-4">
							<div className="flex flex-col gap-2">
								<h3 className="text-lg font-semibold">Confirm Deletion</h3>
								<p className="text-sm text-gray-500">
                  Are you sure you want to delete {resource.file_name}? This
                  action cannot be undone.
								</p>
							</div>
							<div className="flex justify-end gap-3">
								<Button
									onClick={() => setShowDeleteDialog(false)}
									variant="outline"
								>
                  Cancel
								</Button>
								<Button onClick={handleDelete} variant="destructive">
                  Delete
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</TableCell>
		</TableRow>
	);
};

const AddFileInFolderButton = ({
	folderId,
	session,
	activeProject,
}: {
  folderId: string | null;
  session: any;
  activeProject: any;
}) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [textFileName, setTextFileName] = useState("");
	const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
	const [showUploadProgress, setShowUploadProgress] = useState(false);

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

		queryClient.invalidateQueries({
			queryKey: [`fetchFiles-${folderId}`],
		});

		// Don't automatically close the progress modal
		// The user can close it when they're ready
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

	// Add a function to poll for task status
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

				// Refresh the file list
				queryClient.invalidateQueries({
					queryKey: [`fetchFiles-${folderId}`],
				});

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

					// Start polling for task status
					pollTaskStatus(data.task_id, 0);
				} else {
					// Update status to success if no processing needed
					setUploadingFiles((prev) =>
						prev.map((item) =>
							item.file === file
								? { ...item, status: "success", progress: 100 }
								: item,
						),
					);

					queryClient.invalidateQueries({
						queryKey: [`fetchFiles-${folderId}`],
					});

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

	return (
		<div className="ml-auto flex gap-2">
			<input
				accept=".bmp,.csv,.doc,.docx,.eml,.epub,.heic,.html,.jpeg,.png,.md,.msg,.odt,.org,.p7s,.pdf,.png,.ppt,.pptx,.rst,.rtf,.tiff,.txt,.tsv,.xls,.xlsx,.xml"
				multiple
				onChange={handleFileUpload}
				ref={fileInputRef}
				style={{ display: "none" }}
				type="file"
			/>
			<Button
				onClick={() => fileInputRef.current?.click()}
				size="sm"
				variant="default"
			>
        + Upload Files
			</Button>
			<Popover>
				<PopoverTrigger asChild>
					<Button size="sm" variant="default">
            + Text File
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="flex flex-col gap-4">
						<Input
							onChange={(e) => setTextFileName(e.target.value)}
							placeholder="Enter file name"
							type="text"
							value={textFileName}
						/>
						<Button onClick={handleCreateTextFile}>Create Document</Button>
					</div>
				</PopoverContent>
			</Popover>
			{/* File Upload Progress Modal */}
			{showUploadProgress && uploadingFiles.length > 0 && (
				<FileUploadProgress
					files={uploadingFiles}
					onClose={() => {
						// Only allow closing if all files are processed (success or error)
						const allProcessed = uploadingFiles.every(
							(file) => file.status === "success" || file.status === "error",
						);
						if (allProcessed) {
							setShowUploadProgress(false);
							setUploadingFiles([]);
						}
					}}
				/>
			)}
		</div>
	);
};

// Update the FileUploadProgress component to show processing status
const FileUploadProgress = ({
	files,
	onClose,
}: {
  files: FileUploadStatus[];
  onClose: () => void;
}) => {
	const allCompleted = files.every(
		(file) => file.status === "success" || file.status === "error",
	);

	const successCount = files.filter((file) => file.status === "success").length;
	const errorCount = files.filter((file) => file.status === "error").length;
	const pendingCount = files.filter(
		(file) => file.status === "pending" || file.status === "uploading",
	).length;
	const processingCount = files.filter(
		(file) => file.status === "processing",
	).length;

	// Calculate overall progress
	const totalProgress =
    files.reduce((acc, file) => acc + file.progress, 0) / files.length;

	return (
		<div className="fixed bottom-4 left-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
			<div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
				<div className="flex items-center gap-2">
					<Upload className="text-blue-500" size={16} />
					<span className="font-medium">File Upload</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-500">
						{successCount}/{files.length} completed
					</span>
					<Button
						className="h-6 w-6 p-0"
						disabled={!allCompleted}
						onClick={onClose}
						size="sm"
						variant="ghost"
					>
						<X size={16} />
					</Button>
				</div>
			</div>
			{/* Overall progress bar */}
			<div className="w-full bg-gray-100 h-1">
				<div
					className="h-1 bg-blue-500 transition-all duration-300 ease-in-out"
					style={{ width: `${totalProgress}%` }}
				/>
			</div>
			<div className="max-h-60 overflow-y-auto p-2">
				{files.map((file, index) => (
					<div
						className="py-2 px-1 border-b border-gray-100 last:border-0"
						key={index}
					>
						<div className="flex justify-between items-center mb-1">
							<div className="flex items-center gap-2">
								<div className="w-5 h-5 flex-shrink-0">
									{file.status === "uploading" && (
										<Loader2 className="animate-spin text-blue-500" size={16} />
									)}
									{file.status === "processing" && (
										<Loader2
											className="animate-spin text-amber-500"
											size={16}
										/>
									)}
									{file.status === "success" && (
										<CheckCircle className="text-green-500" size={16} />
									)}
									{file.status === "error" && (
										<AlertCircle className="text-red-500" size={16} />
									)}
									{file.status === "pending" && (
										<div className="w-2 h-2 bg-gray-300 rounded-full" />
									)}
								</div>
								<span
									className="text-sm truncate max-w-[180px]"
									title={file.file.name}
								>
									{file.file.name}
								</span>
							</div>
							<span className="text-xs text-gray-500">
								{file.status === "success"
									? "100%"
									: file.status === "error"
										? "Failed"
										: file.status === "processing"
											? "Processing"
											: file.status === "uploading"
												? `${file.progress}%`
												: "Pending"}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1.5">
							<div
								className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
									file.status === "success"
										? "bg-green-500"
										: file.status === "error"
											? "bg-red-500"
											: file.status === "processing"
												? "bg-amber-500"
												: "bg-blue-500"
								}`}
								style={{ width: `${file.progress}%` }}
							/>
						</div>
						{/* Show processing message if file is being processed */}
						{file.status === "processing" && (
							<div className="mt-1 text-xs text-amber-600">
                Document processing in progress...
							</div>
						)}
						{/* Show error message if there is one */}
						{file.status === "error" && file.error && (
							<div className="mt-1 text-xs text-red-600">{file.error}</div>
						)}
					</div>
				))}
			</div>
			<div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
				<div className="flex items-center gap-2 text-sm">
					{successCount > 0 && (
						<span className="text-green-500">{successCount} successful</span>
					)}
					{errorCount > 0 && (
						<span className="text-red-500">{errorCount} failed</span>
					)}
					{pendingCount > 0 && (
						<span className="text-blue-500">{pendingCount} pending</span>
					)}
					{processingCount > 0 && (
						<span className="text-amber-500">{processingCount} processing</span>
					)}
				</div>
				<Button
					disabled={!allCompleted}
					onClick={onClose}
					size="sm"
					variant={allCompleted ? "outline" : "default"}
				>
					{allCompleted
						? "Close"
						: processingCount > 0
							? "Processing..."
							: "Uploading..."}
				</Button>
			</div>
		</div>
	);
};

const EmptyFileRow = () => {
	return (
		<TableRow>
			<TableCell className="text-center" colSpan={4}>
				<EmptyFilesDisplay />
			</TableCell>
		</TableRow>
	);
};

const EmptyFilesDisplay = () => {
	return (
		<div className="flex flex-col items-center justify-center pt-8">
			<FileSearch className="w-20 h-20 text-gray-400 mb-4" />
			<p className="text-lg font-medium text-gray-500">No files found</p>
			<p className="text-sm text-gray-400">
        It looks like there are no files here. Try uploading or checking back
        later.
			</p>
		</div>
	);
};

// Add new FolderRow component
const FolderRow = ({
	folder,
	onFolderClick,
}: {
  folder: ExplorerItem;
  onFolderClick: (folderId: string, folderName: string) => void;
}) => {
	return (
		<TableRow
			className="hover:bg-blue-100 cursor-pointer"
			onClick={() => onFolderClick(folder.id, folder.name)}
		>
			<TableCell>
				<div className="flex flex-row justify-start gap-4">
					<Folder className="h-4 w-4" />
					<div className="font-medium">{folder.name}</div>
				</div>
			</TableCell>
			<TableCell className="hidden sm:table-cell">
				<Badge variant="secondary">Folder</Badge>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{formatDate(folder.created_at)}
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{/* Add folder actions if needed */}
			</TableCell>
		</TableRow>
	);
};
