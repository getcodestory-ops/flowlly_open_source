import React from "react";
import { useStore } from "@/utils/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFolders, fetchFiles, GetFolderFileProp, GetFolderSubFolderProp, createSubFolder, saveDocumentAs } from "@/api/folderRoutes";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/hooks/useChatStore";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { useToast } from "@/components/ui/use-toast";
import { StorageResourceEntity } from "@/types/document";
import { useFileUpload } from "../Folder/FilesTable/useFileUpload";
import { AddNewFolderModal } from "../CreateNewFolderModal/CreateNewFolderModal";

import { DocumentSelectorHeader } from "./DocumentSelectorHeader";
import { DocumentGrid } from "./DocumentGrid";
import { DocumentDropZone } from "./DocumentDropZone";
import { CopyToFolderDialog } from "./CopyToFolderDialog";
import { CreateFileDialog } from "./CreateFileDialog";
import { useDocumentActions } from "./useDocumentActions";
import { DocumentSelectorProps, SelectedItem, SortField, SortDirection, DocumentSelectorItem, SelectionEvent } from "./types";

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

	const [sortField, setSortField] = React.useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
	const [searchTerm, setSearchTerm] = React.useState("");

	// Copy to folder dialog state
	const [showCopyDialog, setShowCopyDialog] = React.useState(false);
	const [itemsToCopy, setItemsToCopy] = React.useState<{ id: string; name: string }[]>([]);
	const [isCopying, setIsCopying] = React.useState(false);
	
	// Create folder/file dialog state
	const [showCreateFolderModal, setShowCreateFolderModal] = React.useState(false);
	const [showCreateFileDialog, setShowCreateFileDialog] = React.useState(false);
	const [isCreatingFile, setIsCreatingFile] = React.useState(false);

	const {
		currentFolderStructure, isProjectWide, getFilesForFolder, getSubFoldersForFolder,
		setProjectContext, navigateToFolder, navigateBack,
		setSubFolders, setFiles, setRootId, setCurrentFolderStructure, addFolder,
	} = useDocumentStore();

	const currentFolderId = currentFolderStructure?.folderId || null;

	// File upload hook for drag-and-drop and file creation
	const { 
		handleFileUpload, 
		fileInputRef, 
		handleCreateTextFile,
		setTextFileName,
	} = useFileUpload(
		currentFolderId || "",
		session,
		activeProject,
	);

	// Document actions hook
	const { renameFile, deleteFile } = useDocumentActions({
		session,
		activeProject,
		currentFolderId,
		isProjectWide,
	});

	const shouldUseChatContext = useChatContext || (!propSelectedItems && !propSetSelectedItems);

	const selectedItems = shouldUseChatContext 
		? (selectedContexts[effectiveContextId] || []).map((ctx) => ({
			id: ctx.id, name: ctx.name,
			type: ctx.extension === "folder" ? "folder" as const : "file" as const,
		}))
		: propSelectedItems || [];

	// Initialize project context
	React.useEffect(() => {
		if (activeProject?.project_id) {
			setProjectContext(activeProject.project_id, isProjectWide);
		}
	}, [activeProject?.project_id, isProjectWide, setProjectContext]);

	// Initialize root folder
	useQuery({
		queryKey: ["initRootFolder", session?.access_token, activeProject?.project_id, isProjectWide],
		queryFn: async () => {
			if (!session || !activeProject?.project_id) return Promise.reject("Session or project not available");
			const data = await fetchFolders(session, activeProject?.project_id, null, isProjectWide);
			const rootFolder = data.find((folder: GetFolderSubFolderProp) => folder.name === "root");
			if (rootFolder) {
				setRootId(rootFolder.id, rootFolder.name);
				if (!currentFolderStructure) {
					setCurrentFolderStructure({
						folderId: "root", folderName: isProjectWide ? "Project Database" : "Personal Database",
						depth: 0, parent: null,
					});
				}
			}
			return data;
		},
		enabled: !!session && !!activeProject,
		staleTime: 5 * 60 * 1000,
	});

	const cachedSubFolders = getSubFoldersForFolder(currentFolderId || "root") || [];
	const cachedFiles = getFilesForFolder(currentFolderId || "root") || [];

	// Fetch folders
	const { data: foldersData, isFetching: isFetchingFolders } = useQuery({
		queryKey: ["folders", session?.access_token, activeProject?.project_id, currentFolderId, isProjectWide],
		queryFn: async () => {
			if (!session || !activeProject?.project_id) return Promise.reject("Session or project not available");
			const data = await fetchFolders(session, activeProject?.project_id, currentFolderId, isProjectWide);
			setSubFolders(currentFolderId || "root", data);
			return data;
		},
		enabled: !!session && !!activeProject && !cachedSubFolders.length,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch files
	const { data: filesData, isFetching: isFetchingFiles } = useQuery({
		queryKey: ["files", session?.access_token, activeProject?.project_id, currentFolderId, isProjectWide],
		queryFn: async () => {
			if (!session || !activeProject?.project_id) return Promise.reject("Session or project not available");
			const data = await fetchFiles(session, activeProject?.project_id, currentFolderId, isProjectWide);
			const files: StorageResourceEntity[] = [];
			data?.forEach((folder: GetFolderFileProp) => {
				folder?.storage_relations?.forEach((file) => {
					if (file.storage_resources) files.push(file.storage_resources);
				});
			});
			setFiles(currentFolderId || "root", files);
			return data;
		},
		enabled: !!session && !!activeProject && !cachedFiles.length,
		staleTime: 5 * 60 * 1000,
	});

	const displayFolders = cachedSubFolders.length > 0 ? cachedSubFolders : (foldersData || []);
	const displayFiles = cachedFiles.length > 0 ? cachedFiles : [];

	const extractedFiles = React.useMemo(() => {
		if (displayFiles.length > 0) return displayFiles;
		const files: StorageResourceEntity[] = [];
		filesData?.forEach((folder: GetFolderFileProp) => {
			folder?.storage_relations?.forEach((file) => {
				if (file.storage_resources) files.push(file.storage_resources);
			});
		});
		return files;
	}, [displayFiles, filesData]);

	// Build sorted/filtered items
	const sortedAndFilteredItems: DocumentSelectorItem[] = React.useMemo(() => {
		const items: DocumentSelectorItem[] = [
		...displayFolders.map((folder: GetFolderSubFolderProp) => ({
				id: folder.id, name: folder.name, type: "folder" as const, created_at: folder.created_at,
		})),
		...extractedFiles.map((file: StorageResourceEntity) => ({
				id: file.id, name: file.file_name || "", type: "file" as const, created_at: file.created_at || "",
				file_name: file.file_name, metadata: file.metadata, url: file.url,
		})),
		];

		return items
			.filter((item) => {
				const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
				if (folderSelectOnly && item.type === "file") return false;
				return matchesSearch;
			})
			.sort((a, b) => {
				if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
				if (sortField === "name") {
					return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
				}
				return sortDirection === "asc"
					? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					: new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});
	}, [displayFolders, extractedFiles, searchTerm, sortField, sortDirection, folderSelectOnly]);

	const handleSort = (field: SortField) => {
		if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		else { setSortField(field); setSortDirection("asc"); }
	};

	// Prefetch folder contents on hover for faster navigation
	const prefetchFolderContents = React.useCallback((folderId: string) => {
		if (!session || !activeProject?.project_id) return;
		
		const cachedFolders = getSubFoldersForFolder(folderId);
		const cachedFiles = getFilesForFolder(folderId);
		
		// Only prefetch if not already cached
		if (!cachedFolders?.length) {
			queryClient.prefetchQuery({
				queryKey: ["folders", session.access_token, activeProject.project_id, folderId, isProjectWide],
				queryFn: () => fetchFolders(session, activeProject.project_id, folderId, isProjectWide),
				staleTime: 5 * 60 * 1000,
			});
		}
		if (!cachedFiles?.length) {
			queryClient.prefetchQuery({
				queryKey: ["files", session.access_token, activeProject.project_id, folderId, isProjectWide],
				queryFn: () => fetchFiles(session, activeProject.project_id, folderId, isProjectWide),
				staleTime: 5 * 60 * 1000,
			});
		}
	}, [session, activeProject?.project_id, isProjectWide, queryClient, getSubFoldersForFolder, getFilesForFolder]);

	const toggleItemSelection = (item: SelectedItem, event?: SelectionEvent) => {
		if (folderSelectOnly && item.type !== "folder") return;
		
		const isCtrlOrCmd = event?.ctrlKey || event?.metaKey;

		if (shouldUseChatContext) {
			if (!effectiveContextId) return;
			const currentContexts = selectedContexts[effectiveContextId] || [];
			const isSelected = currentContexts.some((ctx) => ctx.id === item.id);
			
			let newContexts;
			if (isCtrlOrCmd) {
				// Ctrl/Cmd+Click: Toggle this item without affecting others
				newContexts = isSelected
					? currentContexts.filter((ctx) => ctx.id !== item.id)
					: [...currentContexts, { id: item.id, name: item.name, extension: item.type === "folder" ? "folder" : "file" }];
			} else {
				// Regular click: Toggle selection (clear others if not selected)
				newContexts = isSelected
				? currentContexts.filter((ctx) => ctx.id !== item.id)
					: [...currentContexts, { id: item.id, name: item.name, extension: item.type === "folder" ? "folder" : "file" }];
			}
			setSelectedContexts(effectiveContextId, newContexts);
		} else {
			if (!propSetSelectedItems) return;
			propSetSelectedItems((prev) => {
				const isSelected = prev.some((i) => i.id === item.id);
				if (isCtrlOrCmd) {
					// Ctrl/Cmd+Click: Toggle this item without affecting others
					return isSelected ? prev.filter((i) => i.id !== item.id) : [...prev, item];
				}
				// Regular click: Toggle selection
				return isSelected ? prev.filter((i) => i.id !== item.id) : [...prev, item];
			});
		}
	};

	// Handle range selection (Shift+Click)
	const handleRangeSelection = (startIndex: number, endIndex: number) => {
		const itemsInRange = sortedAndFilteredItems.slice(startIndex, endIndex + 1);
		const newItems: SelectedItem[] = itemsInRange
			.filter((item) => !folderSelectOnly || item.type === "folder")
			.map((item) => ({ id: item.id, name: item.name, type: item.type }));

		if (shouldUseChatContext) {
			if (!effectiveContextId) return;
			const currentContexts = selectedContexts[effectiveContextId] || [];
			// Add range items to existing selection (merge, don't replace)
			const existingIds = new Set(currentContexts.map((ctx) => ctx.id));
			const newContexts = [
				...currentContexts,
				...newItems
					.filter((item) => !existingIds.has(item.id))
					.map((item) => ({ id: item.id, name: item.name, extension: item.type === "folder" ? "folder" : "file" })),
			];
			setSelectedContexts(effectiveContextId, newContexts);
		} else {
			if (!propSetSelectedItems) return;
			propSetSelectedItems((prev) => {
				const existingIds = new Set(prev.map((i) => i.id));
				return [...prev, ...newItems.filter((item) => !existingIds.has(item.id))];
			});
		}
	};

	// Bulk actions
	const handleBulkDelete = async () => {
		const filesToDelete = selectedItems.filter((item) => item.type === "file");
		if (filesToDelete.length === 0) {
			toast({ title: "No files selected", description: "Only files can be deleted. Folder deletion coming soon.", duration: 3000 });
			return;
		}
		
		// Delete files one by one
		let successCount = 0;
		for (const file of filesToDelete) {
			const success = await deleteFile(file.id);
			if (success) successCount++;
		}
		
		if (successCount > 0) {
			toast({ title: "Files deleted", description: `Successfully deleted ${successCount} file(s)`, duration: 3000 });
		}
	};

	const handleBulkMove = () => {
		toast({ title: "Coming Soon", description: "Moving multiple files will be available in a future update", duration: 3000 });
	};

	const handleBulkAddToChat = () => {
		// All selected items are already in the chat context
		toast({ title: "Added to Chat", description: `${selectedItems.length} item(s) are now in the chat context`, duration: 2000 });
	};

	// Copy file(s) to another folder
	const handleCopyFile = (fileId: string, fileName: string) => {
		setItemsToCopy([{ id: fileId, name: fileName }]);
		setShowCopyDialog(true);
	};

	const handleBulkCopy = () => {
		// Filter only files (folders can't be copied yet)
		const filesToCopy = selectedItems
			.filter((item) => item.type === "file")
			.map((item) => ({ id: item.id, name: item.name }));
		
		if (filesToCopy.length === 0) {
			toast({ title: "No files selected", description: "Only files can be copied. Folder copying coming soon.", duration: 3000 });
			return;
		}
		
		setItemsToCopy(filesToCopy);
		setShowCopyDialog(true);
	};

	const handleCopyToFolder = async (targetFolderId: string, folderName: string) => {
		if (!session || !activeProject?.project_id) return;
		
		setIsCopying(true);
		let successCount = 0;
		
		try {
			for (const item of itemsToCopy) {
				const result = await saveDocumentAs(session, activeProject.project_id, item.id, targetFolderId);
				if (result) successCount++;
			}
			
			if (successCount > 0) {
				// Invalidate target folder's cache so new files show when navigating there
				setFiles(targetFolderId, []);
				queryClient.invalidateQueries({
					queryKey: ["files", session.access_token, activeProject.project_id, targetFolderId, isProjectWide],
				});
				
				toast({
					title: "Files Copied",
					description: `${successCount} file(s) copied to "${folderName}"`,
					duration: 3000,
				});
				setShowCopyDialog(false);
				setItemsToCopy([]);
			} else {
				toast({
					title: "Copy Failed",
					description: "Failed to copy files. Please try again.",
					variant: "destructive",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error copying files:", error);
			toast({
				title: "Copy Failed",
				description: "An error occurred while copying files.",
				variant: "destructive",
				duration: 3000,
			});
		} finally {
			setIsCopying(false);
		}
	};

	const removeSelectedItem = (id: string) => {
		if (shouldUseChatContext) {
			if (!effectiveContextId) return;
			const newContexts = (selectedContexts[effectiveContextId] || []).filter((ctx) => ctx.id !== id);
			setSelectedContexts(effectiveContextId, newContexts);
		} else {
			if (!propSetSelectedItems) return;
			propSetSelectedItems((prev) => prev.filter((item) => item.id !== id));
		}
	};

	const handleCreateFolder = (name: string) => {
		if (!activeProject || !session) return;
		createSubFolder(session, activeProject.project_id, name, currentFolderId, isProjectWide, (data) => {
				addFolder(currentFolderId || "root", data);
		});
		setShowCreateFolderModal(false);
	};

	// Handler for context menu: trigger folder creation modal
	const handleContextCreateFolder = () => {
		setShowCreateFolderModal(true);
	};

	// Handler for context menu: trigger file creation dialog
	const handleContextCreateFile = () => {
		setShowCreateFileDialog(true);
	};

	// Handler for creating the text file
	const handleCreateFile = async (fileName: string) => {
		setIsCreatingFile(true);
		try {
			setTextFileName(fileName);
			// Small delay to ensure state is set
			setTimeout(() => {
				handleCreateTextFile();
				setShowCreateFileDialog(false);
				setIsCreatingFile(false);
			}, 100);
		} catch (error) {
			console.error("Error creating file:", error);
			setIsCreatingFile(false);
		}
	};

	// Handler for context menu: trigger file upload
	const handleContextUploadFile = () => {
		fileInputRef.current?.click();
	};

	const handleRefresh = React.useCallback(async () => {
		if (!session || !activeProject?.project_id) return;
		setSubFolders(currentFolderId || "root", []);
		setFiles(currentFolderId || "root", []);
		await queryClient.invalidateQueries({ queryKey: ["folders", session.access_token, activeProject.project_id, currentFolderId, isProjectWide] });
		await queryClient.invalidateQueries({ queryKey: ["files", session.access_token, activeProject.project_id, currentFolderId, isProjectWide] });
		toast({ title: "Refreshed", description: "Folder contents have been updated", duration: 2000 });
	}, [session, activeProject?.project_id, currentFolderId, isProjectWide, queryClient, setSubFolders, setFiles, toast]);

	const handleFilesDropped = (files: FileList) => {
		// Create a synthetic event for the existing handler
		const dataTransfer = new DataTransfer();
		Array.from(files).forEach((file) => dataTransfer.items.add(file));
		const syntheticEvent = { target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
		handleFileUpload(syntheticEvent);
	};

	// Show loading when fetching and no cached data available
	const isLoading = (isFetchingFolders && cachedSubFolders.length === 0) || 
		(isFetchingFiles && cachedFiles.length === 0);

	return (
		<>
			<input ref={fileInputRef} style={{ display: "none" }} type="file" multiple />
			<div className="flex flex-col h-full">
				<Card className="border flex flex-col flex-1 min-h-0">
					<DocumentSelectorHeader
						activeProject={activeProject}
						currentFolderId={currentFolderId || ""}
						currentFolderStructure={currentFolderStructure}
						isProjectWide={isProjectWide}
						navigateBack={navigateBack}
						onCreateFolder={handleCreateFolder}
						onRefresh={handleRefresh}
						onScopeChange={(value) => activeProject?.project_id && setProjectContext(activeProject.project_id, value === "project")}
						onSort={handleSort}
						searchTerm={searchTerm}
						session={session}
						setSearchTerm={setSearchTerm}
						sortDirection={sortDirection}
						sortField={sortField}
					/>
					<CardContent className="p-0 flex-1 min-h-0">
						<DocumentDropZone disabled={isLoading} onFilesDropped={handleFilesDropped} className="h-full">
							<ScrollArea className="h-full">
								<DocumentGrid
									contextFolderId={contextFolder.id || undefined}
									isLoading={isLoading}
									items={sortedAndFilteredItems}
									onBulkAddToChat={handleBulkAddToChat}
									onBulkCopy={handleBulkCopy}
									onBulkDelete={handleBulkDelete}
									onBulkMove={handleBulkMove}
									onCopyFile={handleCopyFile}
									onCreateFile={handleContextCreateFile}
									onCreateFolder={handleContextCreateFolder}
									onDeleteFile={async (fileId, fileName) => {
										const success = await deleteFile(fileId);
										return success;
									}}
									onFolderClick={(folderId, folderName) => navigateToFolder(folderId, folderName)}
									onOpenInSidePanel={(fileId, fileName) => {
										addTab({ isOpen: true, type: "sources", resourceId: fileId, filename: fileName });
									}}
									onPrefetchFolder={prefetchFolderContents}
									onRangeSelection={handleRangeSelection}
									onRenameFile={async (fileId, newName) => {
										const success = await renameFile(fileId, newName);
										return success;
									}}
									onSetOutputFolder={(folderId, folderName) => {
										setContextFolder(folderId, folderName);
										toast({ title: "Output folder set", description: `Files will be saved in ${folderName}`, duration: 3000 });
									}}
									onToggleSelection={toggleItemSelection}
									onUploadFile={handleContextUploadFile}
									selectedItems={selectedItems}
								/>
						</ScrollArea>
						</DocumentDropZone>
					</CardContent>
				</Card>
			</div>
			
			{/* Copy to Folder Dialog */}
			<CopyToFolderDialog
				isCopying={isCopying}
				itemsToCopy={itemsToCopy}
				onCopy={handleCopyToFolder}
				onOpenChange={setShowCopyDialog}
				open={showCopyDialog}
			/>

			{/* Create Folder Modal */}
			<AddNewFolderModal
				onAdd={handleCreateFolder}
				parentFolderName={currentFolderStructure?.folderName || (isProjectWide ? "Project Root" : "Personal Root")}
				open={showCreateFolderModal}
				onOpenChange={setShowCreateFolderModal}
			/>

			{/* Create File Dialog */}
			<CreateFileDialog
				open={showCreateFileDialog}
				onOpenChange={setShowCreateFileDialog}
				onConfirm={handleCreateFile}
				isCreating={isCreatingFile}
			/>
		</>
	);
}; 
