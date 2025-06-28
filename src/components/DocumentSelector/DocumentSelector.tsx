import React, { useRef } from "react";
import { useStore } from "@/utils/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFolders, fetchFiles, GetFolderFileProp, GetFolderSubFolderProp, createSubFolder } from "@/api/folderRoutes";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useChatStore } from "@/hooks/useChatStore";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { useToast } from "@/components/ui/use-toast";
import { StorageResourceEntity } from "@/types/document";

// Import components directly to avoid circular dependency
import { DocumentSelectorHeader } from "./DocumentSelectorHeader";
import { SelectedItemsList } from "./SelectedItemsList";
import { EmptyFilesDisplay as EmptyDocumentsDisplay } from "../Folder/FilesTable/EmptyFilesDisplay";
import { DocumentSelectorProps, SelectedItem, SortField, SortDirection, DocumentSelectorItem } from "./types";

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
	selectedItems: propSelectedItems,
	setSelectedItems: propSetSelectedItems,
	folderSelectOnly = false,
	useChatContext = false,
	contextId,
}) => {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const activeChatEntity = useStore((state) => state.activeChatEntity);
	const { setSelectedContexts, selectedContexts, addTab, setContextFolder, contextFolder } = useChatStore();
	const currentChatId = activeChatEntity?.id || "untitled";
	const effectiveContextId = contextId || currentChatId;
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Sorting state - same pattern as FilesTable
	const [sortField, setSortField] = React.useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
	const [searchTerm, setSearchTerm] = React.useState("");

	// Document store integration - same as FilesTable
	const {
		currentFolderStructure,
		isProjectWide,
		getFilesForFolder,
		getSubFoldersForFolder,
		loadingFiles,
		loadingFolders,
		setProjectContext,
		navigateToFolder,
		navigateBack,
		setSubFolders,
		setFiles,
		setRootId,
		setCurrentFolderStructure,
		addFolder,
		addFile,
	} = useDocumentStore();

	// Determine if we should use chat context or props
	const shouldUseChatContext = useChatContext || (!propSelectedItems && !propSetSelectedItems);

	// Get current selected items based on mode, using effectiveContextId
	const selectedItems = shouldUseChatContext 
		? (selectedContexts[effectiveContextId] || []).map((ctx) => ({
			id: ctx.id,
			name: ctx.name,
			type: ctx.extension === "folder" ? "folder" as const : "file" as const,
		}))
		: propSelectedItems || [];

	// Initialize project context when component mounts or project changes
	React.useEffect(() => {
		if (activeProject?.project_id) {
			setProjectContext(activeProject.project_id, isProjectWide);
		}
	}, [activeProject?.project_id, isProjectWide, setProjectContext]);

	// Initialize root folder structure
	useQuery({
		queryKey: [
			"initRootFolder",
			session?.access_token,
			activeProject?.project_id,
			isProjectWide,
		],
		queryFn: async() => {
			if (!session || !activeProject?.project_id)
				return Promise.reject("Session or active project not available");

			const data = await fetchFolders(
				session,
				activeProject?.project_id,
				null,
				isProjectWide,
			);

			const rootFolder = data.find((folder: GetFolderSubFolderProp) => folder.name === "root");
			if (rootFolder) {
				setRootId(rootFolder.id, rootFolder.name);
				if (!currentFolderStructure) {
					setCurrentFolderStructure({
						folderId: "root",
						folderName: isProjectWide ? "Project Database" : "Personal Database",
						depth: 0,
						parent: null,
					});
				}
			}
			
			return data;
		},
		enabled: !!session && !!activeProject,
		staleTime: 5 * 60 * 1000,
	});

	// Get current folder data from store
	const currentFolderId = currentFolderStructure?.folderId || null;
	const cachedSubFolders = getSubFoldersForFolder(currentFolderId || "root") || [];
	const cachedFiles = getFilesForFolder(currentFolderId || "root") || [];

	// Fetch folders and files using React Query with store integration - same as FilesTable
	const { data: foldersData } = useQuery({
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

			const data = await fetchFolders(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);
			
			const folderId = currentFolderId || "root";
			setSubFolders(folderId, data);
			
			return data;
		},
		enabled: !!session && !!activeProject && !cachedSubFolders.length,
		staleTime: 5 * 60 * 1000,
	});

	const { data: filesData } = useQuery({
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

			const data = await fetchFiles(
				session,
				activeProject?.project_id,
				currentFolderId,
				isProjectWide,
			);
			
			const folderId = currentFolderId || "root";
			const files: StorageResourceEntity[] = [];
			data?.forEach((folder: GetFolderFileProp) => {
				folder?.storage_relations?.forEach((file) => {
					if (file.storage_resources) {
						files.push(file.storage_resources);
					}
				});
			});
			setFiles(folderId, files);
			
			return data;
		},
		enabled: !!session && !!activeProject && !cachedFiles.length,
		staleTime: 5 * 60 * 1000,
	});

	// Use cached data if available
	const displayFolders = cachedSubFolders.length > 0 ? cachedSubFolders : (foldersData || []);
	const displayFiles = cachedFiles.length > 0 ? cachedFiles : [];

	// Extract files from filesData if needed
	const extractedFiles = React.useMemo(() => {
		if (displayFiles.length > 0) return displayFiles;
		
		const files: StorageResourceEntity[] = [];
		filesData?.forEach((folder: GetFolderFileProp) => {
			folder?.storage_relations?.forEach((file) => {
				if (file.storage_resources) {
					files.push(file.storage_resources);
				}
			});
		});
		return files;
	}, [displayFiles, filesData]);

	// Map files and folders to unified structure for sorting - same pattern as FilesTable
	const explorerItems: DocumentSelectorItem[] = React.useMemo(() => [
		...displayFolders.map((folder: GetFolderSubFolderProp) => ({
			id: folder.id,
			name: folder.name,
			type: "folder" as const,
			created_at: folder.created_at,
		})),
		...extractedFiles.map((file: StorageResourceEntity) => ({
			id: file.id,
			name: file.file_name || "",
			type: "file" as const,
			created_at: file.created_at || "",
			// Include all StorageResourceEntity properties
			file_name: file.file_name,
			metadata: file.metadata,
			url: file.url,
			project_access_id: file.project_access_id,
			sha: file.sha,
		})),
	], [displayFolders, extractedFiles]);

	// Sort and filter items - same logic as FilesTable
	const sortedAndFilteredItems = React.useMemo(() => {
		return explorerItems
			.filter((item) => {
				const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.type === "file" && item.metadata?.extension?.toLowerCase().includes(searchTerm.toLowerCase()));
        
				// If folder select only, filter out files
				if (folderSelectOnly && item.type === "file") {
					return false;
				}
        
				return matchesSearch;
			})
			.sort((a, b) => {
				// Sort folders before files
				if (a.type !== b.type) {
					return a.type === "folder" ? -1 : 1;
				}

				// Then apply the selected sort
				if (sortField === "name") {
					return sortDirection === "asc"
						? a.name.localeCompare(b.name)
						: b.name.localeCompare(a.name);
				}
				if (sortField === "type") {
					if (a.type === "file" && b.type === "file") {
						const aExt = a.metadata?.extension || "";
						const bExt = b.metadata?.extension || "";
						return sortDirection === "asc"
							? aExt.localeCompare(bExt)
							: bExt.localeCompare(aExt);
					}
					return 0;
				}
				// Sort by created_at (default)
				return sortDirection === "asc"
					? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					: new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [explorerItems, searchTerm, sortField, sortDirection, folderSelectOnly]);

	// Sort handler - same as FilesTable
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const toggleItemSelection = (item: SelectedItem) => {
		if (folderSelectOnly && item.type !== "folder") return;

		if (shouldUseChatContext) {
			if (!effectiveContextId) return;

			const currentContexts = selectedContexts[effectiveContextId] || [];
			const isSelected = currentContexts.some((ctx) => ctx.id === item.id);
			
			const newContexts = isSelected
				? currentContexts.filter((ctx) => ctx.id !== item.id)
				: [...currentContexts, { 
					id: item.id, 
					name: item.name, 
					extension: item.type === "folder" ? "folder" : "file",
				}];

			setSelectedContexts(effectiveContextId, newContexts);
		} else {
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
			if (!effectiveContextId) return;
			
			const currentContexts = selectedContexts[effectiveContextId] || [];
			const newContexts = currentContexts.filter((ctx) => ctx.id !== id);
			setSelectedContexts(effectiveContextId, newContexts);
		} else {
			if (!propSetSelectedItems) return;
			propSetSelectedItems((prev) => prev.filter((item) => item.id !== id));
		}
	};

	const handleFolderClick = (folder: GetFolderSubFolderProp) => {
		navigateToFolder(folder.id, folder.name);
	};

	const handleScopeChange = (value: string) => {
		const newIsProjectWide = value === "project";
		if (activeProject?.project_id) {
			setProjectContext(activeProject.project_id, newIsProjectWide);
		}
	};

	const openInSidePanel = (fileId: string, fileName: string, e: React.MouseEvent) => {
		e.stopPropagation();
		addTab({
			isOpen: true,
			type: "sources",
			resourceId: fileId,
			filename: fileName,
		});
	};

	const setAsContextFolder = () => {
		const folderName = currentFolderStructure?.folderName || (isProjectWide ? "Project Root" : "Personal Root");
		
		setContextFolder(currentFolderId, folderName);
		
		toast({
			title: "Context Folder Set",
			description: `Chat context set to: ${folderName}`,
			duration: 3000,
		});
	};

	// Handle folder creation - same pattern as FilesTable AddFolderButton
	const handleCreateFolder = (name: string) => {
		if (!activeProject || !session) return;
		
		createSubFolder(
			session,
			activeProject.project_id,
			name,
			currentFolderId,
			isProjectWide,
			(data) => {
				addFolder(currentFolderId || "root", data);
			},
		);
	};

	// Handle manual refresh
	const handleRefresh = React.useCallback(async() => {
		if (!session || !activeProject?.project_id) return;
		
		const folderId = currentFolderId || "root";
		
		// Clear cached data from document store
		setSubFolders(folderId, []);
		setFiles(folderId, []);
		
		// Invalidate React Query cache to force refetch
		await queryClient.invalidateQueries({
			queryKey: [
				"folders",
				session.access_token,
				activeProject.project_id,
				currentFolderId,
				isProjectWide,
			],
		});
		
		await queryClient.invalidateQueries({
			queryKey: [
				"files",
				session.access_token,
				activeProject.project_id,
				currentFolderId,
				isProjectWide,
			],
		});

		toast({
			title: "Refreshed",
			description: "Folder contents have been updated",
			duration: 2000,
		});
	}, [
		session,
		activeProject?.project_id,
		currentFolderId,
		isProjectWide,
		queryClient,
		setSubFolders,
		setFiles,
		toast,
	]);

	const isLoading = loadingFiles.has(currentFolderId || "root") || loadingFolders.has(currentFolderId || "root");

	return (
		<>
			<div className="space-y-4">
				<Card className="border">
					<DocumentSelectorHeader
						activeProject={activeProject}
						contextFolder={contextFolder}
						currentFolderId={currentFolderId || ""}
						currentFolderStructure={currentFolderStructure}
						isProjectWide={isProjectWide}
						navigateBack={navigateBack}
						onCreateFolder={handleCreateFolder}
						onRefresh={handleRefresh}
						onScopeChange={handleScopeChange}
						onSort={handleSort}
						searchTerm={searchTerm}
						session={session}
						setAsContextFolder={setAsContextFolder}
						setSearchTerm={setSearchTerm}
						sortDirection={sortDirection}
						sortField={sortField}
					/>
					<CardContent>
						<ScrollArea className="h-[480px]">
							{isLoading ? (
								<div className="text-center text-gray-500">Loading...</div>
							) : (
								<div className="grid grid-cols-1 gap-3">
									{sortedAndFilteredItems.map((item) => {
										if (item.type === "folder") {
											const folder = displayFolders.find((f) => f.id === item.id);
											if (!folder) return null;
											
											return (
												<div
													className={clsx(
														"flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer rounded-md group",
														{
															"bg-gray-100": selectedItems.some(
																(selectedItem) => selectedItem.id === folder.id,
															),
														},
													)}
													key={folder.id}
													onClick={() => handleFolderClick(folder)}
												>
													<div className="flex items-center gap-2 min-w-0 flex-1">
														<span className="text-sm truncate" title={folder.name}>
															📁 {folder.name}
														</span>
														<Button
															className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
												</div>
											);
										} else {
											const file = extractedFiles.find((f) => f.id === item.id);
											if (!file) return null;
											
											return (
												<div
													className={clsx(
														"flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer group rounded-md",
														{
															"bg-gray-100": selectedItems.some(
																(selectedItem) => selectedItem.id === file.id,
															),
														},
													)}
													key={file.id}
												>
													<div className="flex items-center gap-2 min-w-0 flex-1">
														<span
															className="text-sm truncate"
															title={file.file_name}
														>
															📄 {file.file_name}
														</span>
														<Button
															className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
															onClick={(e) => {
																e.stopPropagation();
																toggleItemSelection({
																	id: file.id,
																	name: file.file_name || "",
																	type: "file",
																});
															}}
															size="sm"
															variant="ghost"
														>
															<Plus size={16} />
														</Button>
														<Button
															className="h-6 w-6 flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
															onClick={(e) => openInSidePanel(file.id, file.file_name || "", e)}
															variant="ghost"
														>
															<ExternalLink className="h-5 w-5 text-gray-600 stroke-2" />
														</Button>
													</div>
												</div>
											);
										}
									})}
									{sortedAndFilteredItems.length === 0 && !isLoading && (
										<EmptyDocumentsDisplay />
									)}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
			<SelectedItemsList
				onOpenInSidePanel={(fileId, fileName) => {
					addTab({
						isOpen: true,
						type: "sources",
						resourceId: fileId,
						filename: fileName,
					});
				}}
				onRemoveItem={removeSelectedItem}
				selectedItems={selectedItems}
			/>
		</>
	);
}; 