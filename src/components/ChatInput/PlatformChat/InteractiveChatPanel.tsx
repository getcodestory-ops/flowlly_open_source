import React, { useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { getInlineDocument, saveDocumentAs, fetchResource } from "@/api/folderRoutes";
import { updateDocumentName } from "@/api/documentRoutes";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { X, FileText, FileImage, FileAudio, FileVideo, FileCode, File, Pencil, Download, Folder, Plus, Save, Edit3, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import TopToolbar from "./ChatPanel/TopToolbar";
import InlineDocumentViewer from "./ChatPanel/InlineDocumentViewer";
import { htmlExtensions } from "./ChatPanel/fileExtensions";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import RunningLogViewer from "@/components/WorkflowComponents/RunningLogViewer";
import FileProgressPanel from "../../StreamResponse/FileProgressPanel";
import { DocumentSelector } from "@/components/DocumentSelector";
import { useToast } from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
} from "@/components/ui/dialog";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";
import { UnsavedChangesDialog } from "@/components/DocumentEditor/ToolBarItems";
import TodoPanel from "@/components/StreamResponse/TodoPanel";



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

// Helper function to get sandbox_id for API calls
const getSandboxId = (tab: any): string => {
	// For sandbox files, use the explicit sandbox_id field if available
	if (tab.type === "sandbox" && tab.sandbox_id) {
		return tab.sandbox_id;
	}
	// Fallback to resourceId for non-sandbox files or if sandbox_id is not available
	return tab.resourceId;
};

const InteractiveChatPanel = ({ heightOffset = 20 }: {heightOffset?: number}) : React.ReactNode => {
	const { tabs, activeTabId, setActiveTab, removeTab, clearAllTabs, addTab } = useChatStore();
	const [viewModes, setViewModes] = useState<{[tabId: string]: "original" | "text"}>({});
	const [editingTabId, setEditingTabId] = useState<string | null>(null);
	const [editedName, setEditedName] = useState<string>("");
	const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedFolderName, setSelectedFolderName] = useState<string>("");
	const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
	const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);
	const scrollContainerRef = React.useRef<HTMLDivElement>(null);
	const tabAreaRef = React.useRef<HTMLDivElement>(null);
	const { session, activeProject, unsavedChanges, setUnsavedChanges, clearUnsavedChanges, clearAllUnsavedChanges } = useStore();
	const { toast } = useToast();

	const activeTab = tabs.find((tab) => tab.id === activeTabId);

	// Query to get resource data for download functionality
	const { data: downloadResource } = useQuery({
		queryKey: ["downloadResource", session, activeProject, activeTab?.resourceId, activeTab?.type],
		queryFn: () => {
			if (!session || !activeProject?.project_id || !activeTab?.resourceId) {
				return Promise.reject("No session, active project, or resource ID");
			}
			if (!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox")) {
				return Promise.reject("Unsupported tab type for download");
			}
			const isSandboxFile = activeTab.type === "sandbox";
			const sandboxId = getSandboxId(activeTab);
			return getInlineDocument({ 
				session, 
				projectId: activeProject.project_id, 
				resourceId: sandboxId, // Use explicit sandbox_id for API call
				isSandboxFile,
				fileName: activeTab.filename,
			});
		},
		enabled: !!session && !!activeProject?.project_id && !!activeTab?.resourceId && (activeTab?.type === "sources" || activeTab?.type === "sandbox"),
	});

	const handlePrintActiveHtml = async(): Promise<void> => {
		try {
			if (!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox")) return;
			const extension = getFileExtension(activeTab.filename);
			if (!htmlExtensions.includes(extension)) return;
			if (!session || !activeProject?.project_id || !activeTab.resourceId) return;

			const isSandboxFile = activeTab.type === "sandbox";
			const sandboxId = getSandboxId(activeTab);
			const resource = await fetchResource(
				session,
				activeProject.project_id,
				sandboxId, // Use explicit sandbox_id for API call
				isSandboxFile,
				activeTab.filename,
			);

			let htmlContent: string | null = null;
			let cssContent: string | null = null;
			let headerContent: string | null = null;

			if (isSandboxFile && typeof resource === "string") {
				htmlContent = resource;
			} else if ((resource as any)?.metadata?.content) {
				htmlContent = (resource as any).metadata.content;
				cssContent = (resource as any).metadata.style;
				headerContent = (resource as any).metadata.header;
			}

			if (!htmlContent) return;

			let workingHtmlContent = htmlContent;
			let headContent = "";
			try {
				const hasBaseTag = /<base\s[^>]*href=/i.test(workingHtmlContent);
				const baseHref = typeof document !== "undefined" ? document.baseURI : "/";
				if (!hasBaseTag && baseHref) {
					headContent += `\n<base href="${baseHref}">\n`;
				}
			} catch {}
			if (cssContent) {
				headContent += `\n<style type="text/css">\n${cssContent}\n</style>\n`;
			}
			if (headerContent) {
				headContent += `${headerContent}\n`;
			}

			if (headContent) {
				const headRegex = /<head[^>]*>/i;
				const headMatch = workingHtmlContent.match(headRegex);
				if (headMatch) {
					const headEndIndex = headMatch.index! + headMatch[0].length;
					workingHtmlContent = workingHtmlContent.slice(0, headEndIndex) + headContent + workingHtmlContent.slice(headEndIndex);
				} else {
					const htmlRegex = /<html[^>]*>/i;
					const htmlMatch = workingHtmlContent.match(htmlRegex);
					if (htmlMatch) {
						const htmlEndIndex = htmlMatch.index! + htmlMatch[0].length;
						const headSection = `\n<head>${headContent}</head>\n`;
						workingHtmlContent = workingHtmlContent.slice(0, htmlEndIndex) + headSection + workingHtmlContent.slice(htmlEndIndex);
					} else {
						workingHtmlContent = `<!DOCTYPE html>\n<html>\n<head>${headContent}</head>\n<body>\n${workingHtmlContent}\n</body>\n</html>`;
					}
				}
			}

			const printWindow = window.open("", "_blank");
			if (!printWindow) return;
			const hasHtmlTag = /<html[^>]*>/i.test(workingHtmlContent);
			const htmlToPrint = hasHtmlTag
				? workingHtmlContent
				: `<!DOCTYPE html><html><head></head><body>${workingHtmlContent}</body></html>`;
			printWindow.document.open();
			printWindow.document.write(htmlToPrint);
			printWindow.document.close();
			const triggerPrint = () => {
				try {
					printWindow.focus();
					printWindow.print();
				} catch {}
			};
			if (printWindow.document.readyState === "complete") {
				setTimeout(triggerPrint, 100);
			} else {
				printWindow.onload = () => setTimeout(triggerPrint, 100);
			}
		} catch {}
	};

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

	const getFileExtension = (filename?: string): string => {
		if (!filename) return "txt";
		const parts = filename.split(".");
		return parts.length > 1 && parts[parts.length - 1] ? parts[parts.length - 1] : "txt";
	};

	const getCurrentViewMode = (tabId: string): "original" | "text" => viewModes[tabId] || "original";
	
	const setCurrentViewMode = (tabId: string, mode: "original" | "text"): void => {
		setViewModes((prev) => ({ ...prev, [tabId]: mode }));
	};

	const checkUnsavedChanges = (tabId: string, action: () => void): void => {
		const tab = tabs.find((t) => t.id === tabId);
		const documentId = tab?.resourceId || tabId; 
		
		if (unsavedChanges[documentId]) {
			setPendingAction(() => action);
			setShowUnsavedDialog(true);
		} else {
			action();
		}
	};

	const clearTabUnsavedChanges = (tabId: string): void => {
		const tab = tabs.find((t) => t.id === tabId);
		const documentId = tab?.resourceId || tabId;
		clearUnsavedChanges(documentId);
	};

	const handleTabClose = (tabId: string, e: React.MouseEvent): void => {
		e.stopPropagation();
		checkUnsavedChanges(tabId, () => {
			removeTab(tabId);
			clearTabUnsavedChanges(tabId);
		});
	};

	// Handle mode switching with unsaved changes check
	const handleModeSwitch = (tabId: string): void => {
		const currentMode = getCurrentViewMode(tabId);
		const newMode = currentMode === "original" ? "text" : "original";
		
		// Only check for unsaved changes when switching FROM text mode (edit mode)
		if (currentMode === "text") {
			checkUnsavedChanges(tabId, () => {
				setCurrentViewMode(tabId, newMode);
				clearTabUnsavedChanges(tabId);
			});
		} else {
			setCurrentViewMode(tabId, newMode);
			// Note: Unsaved changes will be set by ResourceTextViewer when actual content changes occur
		}
	};

	// Dialog handlers for unsaved changes
	const handleSaveAndContinue = async(): Promise<void> => {
		// For now, we'll just proceed with the action
		// In a full implementation, you'd want to save the content first
		if (pendingAction) {
			pendingAction();
			setPendingAction(null);
		}
		setShowUnsavedDialog(false);
	};

	const handleDiscardChanges = (): void => {
		if (pendingAction) {
			pendingAction();
			setPendingAction(null);
		}
		setShowUnsavedDialog(false);
	};

	const handleCancelAction = (): void => {
		setPendingAction(null);
		setShowUnsavedDialog(false);
	};

	const inLineViewableExtensions = ["pdf", "oga", "wav", "mp3", "mp4", "webm", "ogg", "wav", "jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff", "csv", "json", "xml", "html", ".xlsx", ".docx", ".doc", "docx", "doc", "xlsx", "md", "json", "jsonl", "py", "css", "js", "ts", "tsx", "ppt", "pptx"];

	const handleFileNameEdit = async(tabId: string, newName: string) => {
		if (!session || !activeProject) return;
		
		const tab = tabs.find((t) => t.id === tabId);
		if (!tab || (tab.type !== "sources" && tab.type !== "sandbox")) return;

		try {
			// Only try to update document name for storage files, not sandbox files
			if (tab.type === "sources") {
				const response = await updateDocumentName(session, tab.resourceId, newName);
				if (response) {
					toast({
						title: "File name updated",
						description: `File name updated to ${newName}`,
					});
				} else {
					toast({
						title: "Error",
						description: "Failed to update file name",
						variant: "destructive",
					});
				}
			} else {
				// For sandbox files, just show a message that rename is not supported
				toast({
					title: "Info",
					description: "Renaming sandbox files is not supported",
					variant: "default",
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
		if (tab.type === "sources" || tab.type === "sandbox") {
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

	// Tab scrolling functions
	const checkScrollButtons = () => {
		if (!scrollContainerRef.current) return;
		
		const container = scrollContainerRef.current;
		const scrollLeft = container.scrollLeft;
		const scrollWidth = container.scrollWidth;
		const clientWidth = container.clientWidth;
		
		// Add small threshold to handle rounding errors
		const threshold = 1;
		
		setCanScrollLeft(scrollLeft > threshold);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - threshold);
	};

	const scrollTabs = (direction: "left" | "right") => {
		if (!scrollContainerRef.current) return;
		
		const container = scrollContainerRef.current;
		const scrollAmount = 150; // Scroll by 150px
		
		if (direction === "left") {
			container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
		} else {
			container.scrollBy({ left: scrollAmount, behavior: "smooth" });
		}
	};

	// Check scroll buttons when tabs change or on resize
	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			checkScrollButtons();
		}, 100); // Small delay to ensure DOM is updated
		
		return () => clearTimeout(timeoutId);
	}, [tabs]);

	// Handle mouse movement to show/hide edge arrows
	const handleTabAreaMouseMove = (e: React.MouseEvent) => {
		if (!tabAreaRef.current) return;
		
		const rect = tabAreaRef.current.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const areaWidth = rect.width;
		const edgeThreshold = 80; // 80px from edge for easier triggering
		
		// Show left arrow if near left edge and can scroll left
		setShowLeftArrow(canScrollLeft && mouseX < edgeThreshold);
		
		// Show right arrow if near right edge and can scroll right  
		setShowRightArrow(canScrollRight && mouseX > areaWidth - edgeThreshold);
	};

	const handleTabAreaMouseLeave = () => {
		setShowLeftArrow(false);
		setShowRightArrow(false);
	};

	// Check scroll buttons on scroll and resize
	React.useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const handleScroll = () => checkScrollButtons();
		const handleResize = () => checkScrollButtons();
		
		container.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleResize);
		
		// Initial check
		const timeoutId = setTimeout(checkScrollButtons, 100);
		
		return () => {
			container.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
			clearTimeout(timeoutId);
		};
	}, []);

	return (
		<div className={`h-[calc(100vh-${heightOffset}px)] flex flex-col bg-gray-50 rounded-lg border `}>
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
			{tabs.length > 0 && (
				<div className="flex items-center bg-gray-100 border-b border-gray-200 rounded-t-lg min-h-[52px]">
					<div 
						className="flex-1 min-w-0 relative"
						onMouseLeave={handleTabAreaMouseLeave}
						onMouseMove={handleTabAreaMouseMove}
						ref={tabAreaRef}
					>
						{/* Floating Left Arrow */}
						{showLeftArrow && (
							<div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 animate-in fade-in duration-200">
								<Button
									className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg border"
									onClick={() => scrollTabs("left")}
									size="icon"
									title="Scroll tabs left"
									variant="ghost"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
							</div>
						)}
						{showRightArrow && (
							<div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 animate-in fade-in duration-200">
								<Button
									className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg border"
									onClick={() => scrollTabs("right")}
									size="icon"
									title="Scroll tabs right"
									variant="ghost"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						)}
						<div 
							className="overflow-x-auto scrollbar-hide"
							ref={scrollContainerRef}
							style={{
								scrollbarWidth: "none",
								msOverflowStyle: "none",
							}}
						>
							<div className="flex items-end pb-1 px-2 gap-1 h-[51px]">
								{tabs.map((tab, index) => {
									const isActive = tab.id === activeTabId;
									const fileExtension = getFileExtension(tab.filename);
									
									// Chrome-like dynamic width
									const getTabWidth = () => {
										const maxWidth = 200;
										const minWidth = 120;
										if (tabs.length <= 3) return maxWidth;
										if (tabs.length <= 6) return Math.max(minWidth, 180);
										return Math.max(minWidth, Math.min(180, 600 / tabs.length));
									};
									
									return (
										<button
											className={`relative flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 flex-shrink-0 ${
												isActive 
													? "bg-white border border-gray-200 border-b-0 rounded-t-lg shadow-sm z-10 -mb-px h-[42px]" 
													: "bg-gray-200 hover:bg-gray-300 rounded-t-lg border border-gray-300 border-b-gray-100 mb-0 h-[38px]"
											}`}
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
											style={{ width: `${getTabWidth()}px` }}
										>
											{tab.type === "folder" ? (
												<Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
											) : (
												<div className="flex-shrink-0">{getFileIcon(fileExtension)}</div>
											)}
											<span className="truncate min-w-0 flex-1 overflow-hidden" title={tab.title}>
												{editingTabId === tab.id && (tab.type === "sources" || tab.type === "sandbox") ? (
													<input
														autoFocus
														className="text-sm bg-transparent border border-gray-300 rounded px-1 py-0 min-w-0 max-w-[150px] focus:outline-none focus:ring-1 focus:ring-blue-500"
														onBlur={() => handleFileNameInputBlur(tab.id)}
														onChange={(e) => setEditedName(e.target.value)}
														onKeyDown={(e) => handleFileNameKeyDown(e, tab.id)}
														value={editedName}
													/>
												) : (
													<span 
														className={(tab.type === "sources" || tab.type === "sandbox") ? "cursor-pointer hover:bg-gray-100 px-1 rounded" : ""}
														onDoubleClick={() => handleFileNameDoubleClick(tab)}
														title={(tab.type === "sources" || tab.type === "sandbox") ? "Double-click to edit filename" : tab.title}
													>
														{tab.filename || tab.title}
														{tab.type === "sandbox" && <span className="text-xs text-blue-600 ml-1">[sandbox]</span>}
														{unsavedChanges[tab.resourceId || tab.id] && (
															<span className="text-orange-600 ml-1">•</span>
														)}
													</span>
												)}
											</span>
											<div
												className="h-4 w-4 p-0 hover:bg-gray-200 flex-shrink-0 ml-1 inline-flex items-center justify-center rounded cursor-pointer"
												onClick={(e) => handleTabClose(tab.id, e)}
											>
												<X className="h-3 w-3" />
											</div>
										</button>
									);
								})}
							</div>
						</div>
					</div>
					<TopToolbar
						canDownload={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox") && !!downloadResource?.url}
						canPrint={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox") && htmlExtensions.includes(getFileExtension(activeTab.filename))}
						canRename={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox")}
						canSaveAs={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox")}
						hasUnsavedInEdit={!!(activeTab && unsavedChanges[activeTab.resourceId || activeTab.id] && (activeTab.type === "sources" || activeTab.type === "sandbox") && getCurrentViewMode(activeTab.id) === "text")}
						isEditMode={!!activeTab && getCurrentViewMode(activeTab.id) === "text"}
						onAddFolder={handleAddFolderSelector}
						onCloseAll={() => {
							const hasAnyUnsavedChanges = Object.values(unsavedChanges).some(Boolean);
							if (hasAnyUnsavedChanges) {
								setPendingAction(() => () => {
									clearAllTabs();
									clearAllUnsavedChanges();
								});
								setShowUnsavedDialog(true);
							} else {
								clearAllTabs();
							}
						}}
						onDownload={handleDownload}
						onPrint={handlePrintActiveHtml}
						onRename={() => activeTab && handleFileNameDoubleClick(activeTab)}
						onSaveAs={() => setShowSaveAsDialog(true)}
						onToggleMode={() => activeTab && handleModeSwitch(activeTab.id)}
					/>
				</div>
			)}
			<div className="flex-1 overflow-auto relative">
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
						className={`absolute px-2 inset-0 ${tab.id === activeTabId ? "block" : "hidden"}`}
						key={tab.id}
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
											[
												"md",
												"py",
												"js",
												"ts",
												"tsx",
												"css",
												"json",
												"jsonl",
											].includes(getFileExtension(tab.filename)) ? (
													<ResourceTextViewer 
														lastReloadTime={tab.lastReloadTime}
														resource_id={tab.resourceId}
													/>
												) : (
													<InlineDocumentViewer 
														fileExtension={getFileExtension(tab.filename)} 
														lastReloadTime={tab.lastReloadTime}
														resourceId={tab.resourceId}
													/>
												)
										) : (
											<ResourceTextViewer 
												lastReloadTime={tab.lastReloadTime}
												resource_id={tab.resourceId}
											/>
										)}
									</>
								)}
								{getFileExtension(tab.filename) === "txt" && (
									<ResourceTextViewer 
										lastReloadTime={tab.lastReloadTime} 
										resource_id={tab.resourceId}
									/>
								)}
							</>
						)}
						{tab.type === "sandbox" && (
							<>
								{inLineViewableExtensions.includes(getFileExtension(tab.filename)) && (
									<>
										{getCurrentViewMode(tab.id) === "original" ? (
											[
												"md",
												"py",
												"js",
												"ts",
												"tsx",
												"css",
												"json",
												"jsonl",
												"txt",
											].includes(getFileExtension(tab.filename)) ? (
													<ResourceTextViewer 
														fileName={tab.filename}
														isSandboxFile
														lastReloadTime={tab.lastReloadTime}
														resource_id={getSandboxId(tab)}
													/>
												) : (
													<InlineDocumentViewer 
														fileExtension={getFileExtension(tab.filename)} 
														fileName={tab.filename}
														isSandboxFile
														lastReloadTime={tab.lastReloadTime}
														resourceId={getSandboxId(tab)}
													/>
												)
										) : (
											<ResourceTextViewer 
												fileName={tab.filename}
												isSandboxFile
												lastReloadTime={tab.lastReloadTime}
												resource_id={getSandboxId(tab)}
											/>
										)}
									</>
								)}
								{getFileExtension(tab.filename) === "txt" && (
									<ResourceTextViewer 
										fileName={tab.filename}
										isSandboxFile
										lastReloadTime={tab.lastReloadTime}
										resource_id={getSandboxId(tab)}
									/>
								)}
							</>
						)}
						{tab.type === "editor" && (
							<ResourceTextViewer 
								lastReloadTime={tab.lastReloadTime}
								resource_id={tab.resourceId}
							/> 
						)}
						{tab.type === "log" && (
							<RunningLogViewer logId={tab.resourceId} />
						)}
						{tab.type === "todo" && (
							<TodoPanel file={tab.resourceId} />
						)}
						{tab.type === "fileProgress" && (
							<FileProgressPanel fileName={tab.resourceId} />
						)}
					</div>
				))}
			</div>
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
			<UnsavedChangesDialog
				isOpen={showUnsavedDialog}
				isSaving={false}
				onCancel={handleCancelAction}
				onDiscard={handleDiscardChanges}
				onSave={handleSaveAndContinue}
			/>
		</div>
	);
};

export default InteractiveChatPanel;
