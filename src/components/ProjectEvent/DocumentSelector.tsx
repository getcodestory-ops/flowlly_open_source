import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/utils/store";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
	fetchFolders,
	fetchFiles,
	GetFolderFileProp,
	GetFolderSubFolderProp,
	uploadFileInFolder,
	createSubFolder,
} from "@/api/folderRoutes";
import { getTaskStatus } from "@/api/schedule_routes";
import { Folder, File, X, ArrowLeft, Plus, Upload, Loader2, Check, ExternalLink, Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { useChatStore } from "@/hooks/useChatStore";
import { useToast } from "@/components/ui/use-toast";
import { ProcessedFile } from "@/api/agentRoutes";
import { AddNewFolderModal } from "@/components/CreateNewFolderModal/CreateNewFolderModal";

// Types for file upload handling
type FileUploadResponse = {
  task_id?: string;
  status?: string;
  error?: string;
  [key: string]: any;
};

type FileUploadStatus = {
  file: File;
  status: "pending" | "uploading" | "success" | "error" | "processing";
  progress: number;
  error?: string;
  taskId?: string;
  result?: ProcessedFile;
};

interface DocumentSelectorProps {
  // Legacy props for backward compatibility
  selectedItems?: Array<{ id: string; name: string; type: "folder" | "file" }>;
  setSelectedItems?: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; name: string; type: "folder" | "file" }>
    >
  >;
  folderSelectOnly?: boolean;
  // New prop to force chat context mode
  useChatContext?: boolean;
}

export default function DocumentSelector({
	selectedItems: propSelectedItems,
	setSelectedItems: propSetSelectedItems,
	folderSelectOnly = false,
	useChatContext = false,
}: DocumentSelectorProps) {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const activeChatEntity = useStore((state) => state.activeChatEntity);
	const { setSelectedContexts, selectedContexts, addTab, setContextFolder, contextFolder } = useChatStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Determine if we should use chat context or props
	const shouldUseChatContext = useChatContext || (!propSelectedItems && !propSetSelectedItems);

	// Get current selected items based on mode
	const selectedItems = shouldUseChatContext 
		? (selectedContexts[currentChatId] || []).map((ctx) => ({
			id: ctx.id,
			name: ctx.name,
			type: ctx.extension === "folder" ? "folder" as const : "file" as const,
		}))
		: propSelectedItems || [];

	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
	const [isProjectWide, setIsProjectWide] = useState(true);
	const [folderHistory, setFolderHistory] = useState<string[]>([]);
	const [folderDataCache, setFolderDataCache] = useState<{
    [key: string]: {
      folders: GetFolderSubFolderProp[];
      files: GetFolderFileProp[];
    };
  }>({});
	const [folderNames, setFolderNames] = useState<{ [key: string]: string }>({});

	// File upload states
	const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
	const [showUploadProgress, setShowUploadProgress] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const getCacheKey = (folderId: string | null, isProjectWide: boolean) =>
		`${folderId}-${isProjectWide ? "project" : "personal"}`;

	const { data: foldersData, isLoading: isFoldersLoading } = useQuery({
		queryKey: [
			"folders",
			session?.access_token,
			activeProject?.project_id,
			currentFolderId,
			isProjectWide,
		],
		queryFn: async() => {
			if (!session || !activeProject?.project_id)
				return Promise.reject("Session or active project not available");

			const cacheKey = getCacheKey(currentFolderId, isProjectWide);
			if (folderDataCache[cacheKey]) {
				return folderDataCache[cacheKey].folders;
			}

			const folders = await fetchFolders(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);

			setFolderDataCache((prev) => ({
				...prev,
				[cacheKey]: {
					folders,
					files: prev[cacheKey]?.files || [],
				},
			}));

			return folders;
		},
		enabled: !!session && !!activeProject,
	});

	const { data: filesData, isLoading: isFilesLoading } = useQuery({
		queryKey: [
			"files",
			session?.access_token,
			activeProject?.project_id,
			currentFolderId,
			isProjectWide,
		],
		queryFn: async() => {
			if (!session || !activeProject?.project_id)
				return Promise.reject("Session or active project not available");

			const cacheKey = getCacheKey(currentFolderId, isProjectWide);
			if (folderDataCache[cacheKey]) {
				return folderDataCache[cacheKey].files;
			}

			const files = await fetchFiles(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);

			setFolderDataCache((prev) => ({
				...prev,
				[cacheKey]: {
					folders: prev[cacheKey]?.folders || [],
					files: files || [],
				},
			}));

			return files;
		},
		enabled: !!session && !!activeProject,
	});

	// Function to poll for task status
	const pollTaskStatus = async(taskId: string, fileIndex: number) => {
		try {
			if (!session) return;
			const response = await getTaskStatus(session, taskId);

			if (response.status === "completed" && response.result) {
				// Update uploadingFiles status
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "success",
								result: response.result,
							}
							: item,
					),
				);

				toast({
					title: "File Processing Complete",
					description: `${uploadingFiles[fileIndex]?.file.name} has been processed successfully`,
					duration: 5000,
				});

				// Refresh the files data to show the newly uploaded file
				queryClient.invalidateQueries({
					queryKey: [
						"files",
						session?.access_token,
						activeProject?.project_id,
						currentFolderId,
						isProjectWide,
					],
				});
			} else if (
				response.status === "pending" ||
        response.status === "processing"
			) {
				// Continue polling
				setTimeout(() => pollTaskStatus(taskId, fileIndex), 5000);
			} else {
				// Handle error
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === fileIndex
							? {
								...item,
								status: "error",
								error: "Processing failed",
							}
							: item,
					),
				);

				toast({
					title: "File Processing Error",
					description: `Failed to process ${uploadingFiles[fileIndex]?.file.name}`,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error(`Error checking task status for ${taskId}:`, error);
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
		}
	};

	// Handle file selection
	const handleFileSelect = async(e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !session || !activeProject) return;

		const selectedFiles = Array.from(e.target.files);
		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

		// Check file sizes
		const oversizedFiles = selectedFiles.filter(
			(file) => file.size > MAX_FILE_SIZE,
		);
		if (oversizedFiles.length > 0) {
			toast({
				title: "File too large",
				description: `Some files exceed the 10MB limit: ${oversizedFiles
					.map((f) => f.name)
					.join(", ")}`,
				variant: "destructive",
			});
			return;
		}

		// Initialize upload status for each file
		const fileStatuses: FileUploadStatus[] = selectedFiles.map((file) => ({
			file,
			status: "pending",
			progress: 0,
		}));

		setUploadingFiles((prev) => [...prev, ...fileStatuses]);
		setShowUploadProgress(true);

		// Upload each file to current folder
		const targetFolderId = currentFolderId || null;

		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles[i];
			const currentIndex = uploadingFiles.length + i;

			// Update status to uploading
			setUploadingFiles((prev) =>
				prev.map((item, index) =>
					index === currentIndex ? { ...item, status: "uploading" } : item,
				),
			);

			try {
				const response = (await uploadFileInFolder(
					session,
					activeProject.project_id,
					file,
					targetFolderId,
					undefined,
					(progress) => {
						setUploadingFiles((prev) =>
							prev.map((item, index) =>
								index === currentIndex ? { ...item, progress } : item,
							),
						);
					},
				)) as FileUploadResponse;

				if (response && response.task_id) {
					// Update status to processing
					setUploadingFiles((prev) =>
						prev.map((item, index) =>
							index === currentIndex
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
					pollTaskStatus(response.task_id, currentIndex);
				}
			} catch (error) {
				console.error(`Error uploading file ${file.name}:`, error);
				setUploadingFiles((prev) =>
					prev.map((item, index) =>
						index === currentIndex
							? {
								...item,
								status: "error",
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

		// Reset the input value
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Handle file removal from upload progress
	const handleRemoveFile = (index: number) => {
		setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// File Upload Progress Component
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

		const successCount = files.filter(
			(file) => file.status === "success",
		).length;
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
			<div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
				<div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<File className="text-blue-500" size={16} />
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
											<Loader2
												className="animate-spin text-blue-500"
												size={16}
											/>
										)}
										{file.status === "processing" && (
											<Loader2
												className="animate-spin text-amber-500"
												size={16}
											/>
										)}
										{file.status === "success" && (
											<Check className="text-green-500" size={16} />
										)}
										{file.status === "error" && (
											<X className="text-red-500" size={16} />
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
							{file.status === "processing" && (
								<div className="mt-1 text-xs text-amber-600">
                  Document processing in progress...
								</div>
							)}
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
							<span className="text-amber-500">
								{processingCount} processing
							</span>
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

	const toggleItemSelection = (item: {
    id: string;
    name: string;
    type: "folder" | "file";
  }) => {
		if (folderSelectOnly && item.type !== "folder") return;

		if (shouldUseChatContext) {
			// Use chat context mode
			if (!currentChatId) return;

			const currentContexts = selectedContexts[currentChatId] || [];
			const isSelected = currentContexts.some((ctx) => ctx.id === item.id);
			
			const newContexts = isSelected
				? currentContexts.filter((ctx) => ctx.id !== item.id)
				: [...currentContexts, { 
					id: item.id, 
					name: item.name, 
					extension: item.type === "folder" ? "folder" : "file",
				}];

			setSelectedContexts(currentChatId, newContexts);
		} else {
			// Use props mode (legacy)
			if (!propSetSelectedItems) return;
			
			propSetSelectedItems((prev) =>
				prev.some((i) => i.id === item.id)
					? prev.filter((i) => i.id !== item.id)
					: [...prev, item],
			);
		}
	};

	const removeSelectedItem = (id: string) => {
		if (shouldUseChatContext) {
			// Use chat context mode
			if (!currentChatId) return;
			
			const currentContexts = selectedContexts[currentChatId] || [];
			const newContexts = currentContexts.filter((ctx) => ctx.id !== id);
			setSelectedContexts(currentChatId, newContexts);
		} else {
			// Use props mode (legacy)
			if (!propSetSelectedItems) return;
			propSetSelectedItems((prev) => prev.filter((item) => item.id !== id));
		}
	};

	const navigateToFolder = (folderId: string | null, folderName?: string) => {
		if (folderId === null) {
			setFolderHistory([]);
			setFolderNames({});
		} else {
			setFolderHistory((prev) => [...prev, folderId]);
			if (folderName) {
				setFolderNames((prev) => ({ ...prev, [folderId]: folderName }));
			}
		}
		setCurrentFolderId(folderId);
	};

	const handleBack = () => {
		const newHistory = [...folderHistory];
		newHistory.pop();
		const previousFolderId = newHistory[newHistory.length - 1] || null;
		setFolderHistory(newHistory);
		setCurrentFolderId(previousFolderId);
	};

	const handleFolderClick = (folder: GetFolderSubFolderProp) => {
		navigateToFolder(folder.id, folder.name);
	};

	const [projectFolderHistory, setProjectFolderHistory] = useState<string[]>(
		[],
	);
	const [personalFolderHistory, setPersonalFolderHistory] = useState<string[]>(
		[],
	);

	const handleScopeChange = (value: string) => {
		const newIsProjectWide = value === "project";
		if (isProjectWide) {
			setProjectFolderHistory(folderHistory);
		} else {
			setPersonalFolderHistory(folderHistory);
		}

		setFolderHistory(
			newIsProjectWide ? projectFolderHistory : personalFolderHistory,
		);
		setCurrentFolderId(null);
		setIsProjectWide(newIsProjectWide);
	};

	// Function to open file in side panel
	const openInSidePanel = (fileId: string, fileName: string, e: React.MouseEvent) => {
		e.stopPropagation();
		addTab({
			isOpen: true,
			type: "sources",
			resourceId: fileId,
			filename: fileName,
		});
	};

	// Function to set current folder as context folder for chat
	const setAsContextFolder = () => {
		const folderName = currentFolderId 
			? folderNames[currentFolderId] || "Current Folder"
			: isProjectWide ? "Project Root" : "Personal Root";
		
		setContextFolder(currentFolderId, folderName);
		
		toast({
			title: "Context Folder Set",
			description: `Chat context set to: ${folderName}`,
			duration: 3000,
		});
	};

	return (
		<>
			<div className="space-y-4">

				<Card className="border">
					<CardHeader className="flex justify-between items-center">
						<div className="flex items-center gap-2 w-full">
							<Button
								className="flex items-center gap-2"
								disabled={!currentFolderId}
								onClick={handleBack}
								variant="ghost"
							>
								<ArrowLeft size={16} />
							</Button>
							<div className="text-sm text-gray-500 flex-1 min-w-0">
								<div className="truncate">
									{folderHistory.length > 0
										? `/${folderHistory
											.map((id) => folderNames[id])
											.filter(Boolean)
											.join("/")}`
										: "/"}
								</div>
							</div>
							<input
								accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp3"
								className="hidden"
								multiple
								onChange={handleFileSelect}
								ref={fileInputRef}
								type="file"
							/>
							<AddNewFolderModal
								onAdd={(name) => {
									if (!activeProject || !session) return;
									createSubFolder(
										session,
										activeProject.project_id,
										name,
										currentFolderId,
										isProjectWide,
										() => {
											// Invalidate the folders query to refresh the list
											queryClient.invalidateQueries({
												queryKey: [
													"folders",
													session?.access_token,
													activeProject?.project_id,
													currentFolderId,
													isProjectWide,
												],
											});
											toast({
												title: "Folder Created",
												description: `Folder "${name}" created successfully`,
											});
										},
									);
								}}
								parentFolderName={
									folderHistory.length > 0 
										? folderNames[folderHistory[folderHistory.length - 1]] || "Current Folder"
										: isProjectWide ? "Project Root" : "Personal Root"
								}
							>
								<Button
									className="flex items-center gap-2"
									size="sm"
									variant="outline"
								>
									<Plus size={16} />
									Add Folder
								</Button>
							</AddNewFolderModal>
							<Button
								className={clsx(
									"flex items-center gap-2",
									contextFolder.id === currentFolderId && "bg-indigo-50 border-indigo-200 text-indigo-700",
								)}
								onClick={setAsContextFolder}
								size="sm"
								title={`Set as active folder for chat context${contextFolder.id === currentFolderId ? " (currently active)" : ""}`}
								variant="outline"
							>
								<Target size={16} />
								{contextFolder.id === currentFolderId ? "Active Folder" : "Set Active"}
							</Button>
							<Button
								className="flex items-center gap-2"
								onClick={() => fileInputRef.current?.click()}
								size="sm"
								variant="outline"
							>
								<Upload size={16} />
								Upload
							</Button>
							<Select
								onValueChange={handleScopeChange}
								value={isProjectWide ? "project" : "personal"}
							>
								<SelectTrigger className="w-[100px]">
									<SelectValue placeholder="Select Scope" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="project">Project</SelectItem>
									<SelectItem value="personal">Personal</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						{/* Search Box */}
						<div className="mb-4">
							<Input
								className="w-full"
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search files and folders..."
								value={searchTerm}
							/>
						</div>
						<ScrollArea className="h-[300px]">
							{isFoldersLoading || isFilesLoading ? (
								<div className="text-center text-gray-500">Loading...</div>
							) : (
								<div className="grid grid-cols-1 gap-3">
									{foldersData
										?.filter((folder: GetFolderSubFolderProp) =>
											folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
										)
										?.map((folder: GetFolderSubFolderProp) => (
											<div
												className={clsx(
													"flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer rounded-md",
													{
														"bg-gray-100": selectedItems.some(
															(item) => item.id === folder.id,
														),
													},
												)}
												key={folder.id}
												onClick={() => handleFolderClick(folder)}
											>
												<div className="flex items-center min-w-0 flex-1">
													<Folder
														className="mr-2 text-blue-500 flex-shrink-0"
														size={16}
													/>
													<span className="text-sm truncate" title={folder.name}>
														{folder.name}
													</span>
												</div>
												<Button
													className="flex-shrink-0 ml-2"
													onClick={(e) => {
														e.stopPropagation();
														toggleItemSelection({
															id: folder.id,
															name: folder.name,
															type: "folder",
														});
													}}
													size="sm"
													variant="ghost"
												>
													<Plus size={16} />
												</Button>
											</div>
										))}
									{filesData?.map((folder: GetFolderFileProp) => (
										<div key={folder.id}>
											{folder?.storage_relations
												?.filter((file) =>
													file.storage_resources?.file_name
														?.toLowerCase()
														.includes(searchTerm.toLowerCase()),
												)
												?.map((file) => (
													<div key={file.storage_resources?.id}>
														{file.storage_resources && (
															<div
																className={clsx(
																	"flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer group rounded-md",
																	{
																		"bg-gray-100": selectedItems.some(
																			(item) =>
																				item.id === file.storage_resources?.id,
																		),
																	},
																)}
															>
																<div className="flex items-center min-w-0 flex-1">
																	<File
																		className="mr-2 text-green-500 flex-shrink-0"
																		size={16}
																	/>
																	<span
																		className="text-sm truncate"
																		title={file.storage_resources?.file_name}
																	>
																		{file.storage_resources?.file_name}
																	</span>
																</div>
																<Button
																	className="h-6 w-6 ml-1 flex-shrink-0  p-1"
																	onClick={(e) => openInSidePanel(
																		file.storage_resources?.id || "",
																		file.storage_resources?.file_name || "",
																		e,
																	)}
																	variant="ghost"
																>
																	<ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 stroke-2" />
																</Button>
																<Button
																	className="flex-shrink-0 ml-2"
																	onClick={(e) => {
																		e.stopPropagation();
																		toggleItemSelection({
																			id: file.storage_resources?.id || "",
																			name:
	                                      file.storage_resources?.file_name || "",
																			type: "file",
																		});
																	}}
																	size="sm"
																	variant="ghost"
																>
																	<Plus size={16} />
																</Button>
															</div>
														)}
													</div>
												))}
										</div>
									))}
									{/* Show "No results" message when search returns no items */}
									{searchTerm && 
										!foldersData?.some((folder: GetFolderSubFolderProp) =>
											folder.name.toLowerCase().includes(searchTerm.toLowerCase()),
										) &&
										!filesData?.some((folder: GetFolderFileProp) =>
											folder?.storage_relations?.some((file) =>
												file.storage_resources?.file_name
													?.toLowerCase()
													.includes(searchTerm.toLowerCase()),
											),
										) && (
										<div className="text-center text-gray-500 py-8">
											<p>No files or folders found matching &ldquo;{searchTerm}&rdquo;</p>
										</div>
									)}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
			{/* Selected Items Section */}
			<div className="mt-4 space-y-2">
				<Label className="text-sm font-semibold">Selected Items</Label>
				<Card className="border max-h-60 overflow-y-auto p-3">
					<ScrollArea className="h-[200px]">
						{selectedItems.length === 0 ? (
							<div className="text-center text-gray-500">
                No items selected.
							</div>
						) : (
							selectedItems.map((item) => (
								<div
									className="flex items-center justify-between p-2  "
									key={item.id}
								>
									<div className="flex items-center text-sm flex-1">
										<Button
											onClick={() => removeSelectedItem(item.id)}
											size="sm"
											variant="ghost"
										>
											<X size={12} />
										</Button>
										{item.type === "folder" ? (
											<Folder
												className="mr-2 text-blue-500 flex-shrink-0"
												size={12}
											/>
										) : (
											<File
												className="mr-2 text-green-500 flex-shrink-0"
												size={12}
											/>
										)}
										<span className="truncate" title={item.name}>
											{item.name}
										</span>
									</div>
								</div>
							))
						)}
					</ScrollArea>
				</Card>
			</div>
			{/* File upload progress UI */}
			{showUploadProgress && uploadingFiles.length > 0 && <FileUploadProgress
				files={uploadingFiles}
				onClose={() => {
					const allProcessed = uploadingFiles.every(
						(file) => file.status === "success" || file.status === "error",
					);
					if (allProcessed) {
						setShowUploadProgress(false);
						setUploadingFiles([]);
					}
				}}
			                                                    />}
		</>
	);
}
