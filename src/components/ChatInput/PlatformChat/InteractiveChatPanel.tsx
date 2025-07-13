import {  useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { getInlineDocument, saveDocumentAs } from "@/api/folderRoutes";
import { updateDocumentName } from "@/api/documentRoutes";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { X, FileText, FileImage, FileAudio, FileVideo, FileCode, File, Pencil, Download, Folder, Plus, Save } from "lucide-react";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import RunningLogViewer from "@/components/WorkflowComponents/RunningLogViewer";
import { DocumentSelector } from "@/components/DocumentSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
} from "@/components/ui/dialog";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";

const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff"];
const tifExtensions = ["tif", "tiff"];
const htmlExtensions = ["html", "htm"];
const microsoftExtensions = ["doc", "docx", "xlsx", "xls", "ppt", "pptx"];

const InlineDocumentViewer = ({ resourceId, fileExtension }: {resourceId: string, fileExtension: string}) : React.ReactNode => {
	const { session } = useStore();
	const { activeProject } = useStore();
	const { data: resource } = useQuery({
		queryKey: ["getInlineFileUrl", session, activeProject, resourceId],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return getInlineDocument({ session, projectId: activeProject.project_id, resourceId });
		},
	});
	return (
		<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
			{resource && imageExtensions.includes(fileExtension) && !tifExtensions.includes(fileExtension) && (
				<img 
					alt="Resource" 
					className="max-w-full max-h-full object-contain" 
					src={resource?.url}
				/>
			)}
			{resource && tifExtensions.includes(fileExtension) && (
				<div className="flex flex-col items-center justify-center p-4">
					<FileImage className="h-16 w-16 text-gray-400" />
					<p className="mt-2 text-sm text-gray-600">TIF viewer not supported in browser</p>
					<a 
						className="mt-2 text-blue-500 hover:underline text-sm"
						download
						href={resource?.url}
					>
						Download file to view
					</a>
				</div>
			)}
			{resource && microsoftExtensions.includes(fileExtension) && (
				<div className="h-full w-full">
					<iframe 
						className="border-0 bg-white"
						height="100%"
						src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource?.url)}`}
						title="Word Document"
						width="100%"
					/>
				</div>
			)}
			{resource && htmlExtensions.includes(fileExtension) && (
				<iframe 
					className="border-0 bg-white"
					height="100%"
					sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
					src={resource?.url}
					title="HTML Document"
					width="100%"
				/>
			)}
			{resource && !imageExtensions.includes(fileExtension) && !htmlExtensions.includes(fileExtension) && !microsoftExtensions.includes(fileExtension) && (
				
				<iframe 
					className="border-0"
					height="100%"
					src={resource?.url}
					width="100%"
				/>
			)}
		</div>
	);
};

const getFileIcon = (extension: string) : React.ReactNode => {
	const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff"];
	const audioExts = ["mp3", "wav", "ogg", "oga"];
	const videoExts = ["mp4", "webm"];
	const codeExts = ["js", "ts", "jsx", "tsx", "html", "htm", "css", "json", "md"];
	const documentExts = ["pdf", "doc", "docx"];

	if (imageExts.includes(extension)) return <FileImage className="h-4 w-4" />;
	if (audioExts.includes(extension)) return <FileAudio className="h-4 w-4" />;
	if (videoExts.includes(extension)) return <FileVideo className="h-4 w-4" />;
	if (codeExts.includes(extension)) return <FileCode className="h-4 w-4" />;
	if (documentExts.includes(extension)) return <FileText className="h-4 w-4" />;
	return <File className="h-4 w-4" />;
};

const InteractiveChatPanel = () : React.ReactNode => {
	const { tabs, activeTabId, setActiveTab, removeTab, clearAllTabs, addTab } = useChatStore();
	const [viewModes, setViewModes] = useState<{[tabId: string]: "original" | "text"}>({});
	const [editingTabId, setEditingTabId] = useState<string | null>(null);
	const [editedName, setEditedName] = useState<string>("");
	const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedFolderName, setSelectedFolderName] = useState<string>("");
	const { session } = useStore();
	const { activeProject } = useStore();
	const { toast } = useToast();

	const activeTab = tabs.find((tab) => tab.id === activeTabId);

	// Query to get resource data for download functionality
	const { data: downloadResource } = useQuery({
		queryKey: ["downloadResource", session, activeProject, activeTab?.resourceId],
		queryFn: () => {
			if (!session || !activeProject?.project_id || !activeTab?.resourceId) {
				return Promise.reject("No session, active project, or resource ID");
			}
			return getInlineDocument({ session, projectId: activeProject.project_id, resourceId: activeTab.resourceId });
		},
		enabled: !!session && !!activeProject?.project_id && !!activeTab?.resourceId,
	});

	const handleDownload = () => {
		if (downloadResource?.url && activeTab?.filename) {
			const link = document.createElement("a");
			link.href = downloadResource.url;
			link.download = activeTab.filename;
			link.target = "_blank"; // Ensure it doesn't replace current window
			link.rel = "noopener noreferrer"; // Security best practice
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const getFileExtension = (filename?: string) => {
		if (!filename) return "txt";
		const parts = filename.split(".");
		return parts.length > 1 && parts[parts.length - 1] ? parts[parts.length - 1] : "txt";
	};

	const getCurrentViewMode = (tabId: string) => viewModes[tabId] || "original";
	
	const setCurrentViewMode = (tabId: string, mode: "original" | "text") => {
		setViewModes((prev) => ({ ...prev, [tabId]: mode }));
	};

	const handleTabClose = (tabId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		removeTab(tabId);
	};

	const inLineViewableExtensions = ["pdf", "oga", "wav", "mp3", "mp4", "webm", "ogg", "wav", "jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff", "csv", "json", "xml", "html", ".xlsx", ".docx", ".doc", "docx", "doc", "xlsx", "md"];

	const handleFileNameEdit = async(tabId: string, newName: string) => {
		if (!session || !activeProject) return;
		
		const tab = tabs.find((t) => t.id === tabId);
		if (!tab || tab.type !== "sources") return;

		try {
			const response = await updateDocumentName(session, tab.resourceId, newName);
			if (response) {
				toast({
					title: "File name updated",
					description: `File name updated to ${newName}`,
				});
				
				// Update the tab title in the store (we'll need to add this function)
				// For now, we can update local state and it will refresh on next load
			} else {
				toast({
					title: "Error",
					description: "Failed to update file name",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update file name",
				variant: "destructive",
			});
		}
		
		setEditingTabId(null);
	};

	const handleFileNameDoubleClick = (tab: any) => {
		if (tab.type === "sources") {
			setEditingTabId(tab.id);
			setEditedName(tab.filename || tab.title || "");
		}
	};

	const handleFileNameInputBlur = (tabId: string) => {
		const newName = editedName.trim();
		if (newName && newName !== tabs.find((t) => t.id === tabId)?.filename) {
			handleFileNameEdit(tabId, newName);
		} else {
			setEditingTabId(null);
		}
	};

	const handleFileNameKeyDown = (e: React.KeyboardEvent, tabId: string) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleFileNameInputBlur(tabId);
		} else if (e.key === "Escape") {
			setEditingTabId(null);
		}
	};

	const setSaveAsFolder = (folderId: string | null, folderName: string): void => {
		setSelectedFolderId(folderId);
		setSelectedFolderName(folderName);
	};

	const handleSaveAs = async(): Promise<void> => {
		if (!selectedFolderId || !activeTab?.resourceId || !session || !activeProject?.project_id) return;
		
		try {
			const response = await saveDocumentAs(session, activeProject.project_id, activeTab.resourceId, selectedFolderId);
			if (response) {
				setShowSaveAsDialog(false);
				toast({
					title: "Success",
					description: "Document saved successfully in " + selectedFolderName,
				});
			} else {
				setShowSaveAsDialog(false);
				toast({
					title: "Error",
					description: "Failed to save document",
					variant: "destructive",
				});
			}
		} catch (error) {
			setShowSaveAsDialog(false);
			toast({
				title: "Error",
				description: "Failed to save document",
				variant: "destructive",
			});
		}
	};

	const handleAddFolderSelector = () => {
		addTab({
			isOpen: true,
			type: "folder",
			resourceId: "folder-selector",
			title: "Select Files and Folders",
		});
	};

	return (
		<div className="h-[calc(100vh-20px)] flex flex-col bg-gray-50 rounded-lg border border-gray-200">
			{/* Header with Select Files and Folders button */}
			{tabs.length === 0 && (
				<div className="flex items-center justify-center p-4 bg-white border-b border-gray-200 rounded-t-lg">
					<Button
						className="gap-2"
						onClick={handleAddFolderSelector}
						variant="default"
					>
						<Plus className="h-4 w-4" />
						Select Files and Folders
					</Button>
				</div>
			)}
			{/* Tab Bar */}
			{tabs.length > 0 && (
				<div className="flex items-center bg-white border-b border-gray-200 rounded-t-lg">
					<ScrollArea className="flex-1">
						<div className="flex items-center">
							{tabs.map((tab) => {
								const isActive = tab.id === activeTabId;
								const fileExtension = getFileExtension(tab.filename);
								
								return (
									<button
										className={`flex items-center gap-2 px-3 py-2 text-sm border-r border-gray-200 hover:bg-gray-50 min-w-0 max-w-48 ${
											isActive ? "bg-gray-50 border-b-2 border-b-blue-500" : ""
										}`}
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
									>
										{tab.type === "folder" ? (
											<Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
										) : (
											<div className="flex-shrink-0">{getFileIcon(fileExtension)}</div>
										)}
										<span className="truncate" title={tab.title}>
											{tab.title}
										</span>
										<Button
											className="h-4 w-4 p-0 hover:bg-gray-200 flex-shrink-0 ml-1"
											onClick={(e) => handleTabClose(tab.id, e)}
											size="icon"
											variant="ghost"
										>
											<X className="h-3 w-3" />
										</Button>
									</button>
								);
							})}
						</div>
					</ScrollArea>
					<div className="flex items-center gap-1 px-2">
						<Button
							className="gap-2"
							onClick={handleAddFolderSelector}
							size="sm"
							title="Add Files and Folders"
							variant="ghost"
						>
							<Folder className="h-4 w-4" />Drive 
						</Button>
						<Button
							className="h-6 w-6 p-0"
							onClick={clearAllTabs}
							size="icon"
							title="Close All Tabs"
							variant="ghost"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
			{/* Active Tab Header */}
			{activeTab && (
				<div className="flex items-center gap-2 p-2 bg-white border-b border-gray-200">
					{activeTab.type === "folder" ? (
						<>
							<Folder className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">Select Files and Folders</span>
						</>
					) : (
						<>
							{getFileIcon(getFileExtension(activeTab.filename))}
							{editingTabId === activeTab.id ? (
								<input
									autoFocus
									className="text-sm font-medium bg-transparent border border-gray-300 rounded px-2 py-1 min-w-0 max-w-[300px] focus:outline-none focus:ring-1 focus:ring-blue-500"
									onBlur={() => handleFileNameInputBlur(activeTab.id)}
									onChange={(e) => setEditedName(e.target.value)}
									onKeyDown={(e) => handleFileNameKeyDown(e, activeTab.id)}
									value={editedName}
								/>
							) : (
								<span 
									className="text-sm font-medium cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
									onDoubleClick={() => handleFileNameDoubleClick(activeTab)}
									title="Double-click to edit filename"
								>
									{activeTab.filename}
								</span>
							)}
						</>
					)}
					<div className="flex-1" />
					{activeTab.type !== "folder" && (
						<>
							<Button 
								className="gap-2"
								disabled={!downloadResource?.url}
								onClick={handleDownload}
								size="sm"
								variant="ghost"
							>
								<Download className="h-4 w-4" />
								Download
							</Button>
							<Button 
								className="gap-2"
								onClick={() => setShowSaveAsDialog(true)}
								size="sm"
								variant="ghost"
							>
								<Save className="h-4 w-4" />
								Save As
							</Button>
							<Button 
								className="gap-2"
								onClick={() => {
									const currentMode = getCurrentViewMode(activeTab.id);
									setCurrentViewMode(activeTab.id, currentMode === "original" ? "text" : "original");
								}}
								size="sm"
								variant="ghost"
							>
								{getCurrentViewMode(activeTab.id) === "original" ? <Pencil className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
								{getCurrentViewMode(activeTab.id) === "original" ? "View and Edit File Content" : "View Original"}
							</Button>
						</>
					)}
				</div>
			)}
			{/* Tab Content */}
			<div className="flex-1 p-4 overflow-auto relative">
				{tabs.length === 0 && (
					<div className="flex items-center justify-center h-full text-gray-500">
						<div className="text-center">
							<Folder className="h-16 w-16 mx-auto mb-4 text-gray-300" />
							<p className="text-lg font-medium mb-2">No files or folders selected</p>
							<p className="text-sm">Click &ldquo;Select Files and Folders&rdquo; to get started</p>
						</div>
					</div>
				)}
				{tabs.map((tab) => (
					<div 
						className={`absolute inset-0 ${tab.id === activeTabId ? "block" : "hidden"}`}
						key={tab.id}
						style={{ padding: "1rem" }}
					>
						{tab.type === "folder" && (
							<DocumentSelector 
								contextId={tab.contextId} 
								useChatContext 
							/>
						)}
						{tab.type === "sources" && (
							<>
								{inLineViewableExtensions.includes(getFileExtension(tab.filename)) && (
									<>
										{getCurrentViewMode(tab.id) === "original" ? (
											getFileExtension(tab.filename) === "md" ? (
												<ResourceTextViewer resource_id={tab.resourceId} />
											) : (
												<InlineDocumentViewer 
													fileExtension={getFileExtension(tab.filename)} 
													resourceId={tab.resourceId}
												/>
											)
										) : (
											<ResourceTextViewer resource_id={tab.resourceId} />
										)}
									</>
								)}
								{getFileExtension(tab.filename) === "txt" && (
									<ResourceTextViewer resource_id={tab.resourceId} />
								)}
							</>
						)}
						{tab.type === "editor" && (
							<ResourceTextViewer resource_id={tab.resourceId} /> 
						)}
						{tab.type === "log" && (
							<RunningLogViewer logId={tab.resourceId} />
						)}
					</div>
				))}
			</div>
			{/* Save As Dialog */}
			<Dialog onOpenChange={setShowSaveAsDialog} open={showSaveAsDialog}>
				<DialogContent className="sm:max-w-[500px]">
					<h2 className="text-xl font-semibold mb-4">Save Document As</h2>
					<FolderSelector 
						onFolderSelect={setSaveAsFolder}
						selectedFolderId={selectedFolderId}
					/>
					<div className="flex justify-end gap-2 mt-4">
						<Button onClick={() => setShowSaveAsDialog(false)} variant="outline">
							Cancel
						</Button>
						<Button 
							disabled={!selectedFolderId} 
							onClick={handleSaveAs}
						>
							Save
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default InteractiveChatPanel;
