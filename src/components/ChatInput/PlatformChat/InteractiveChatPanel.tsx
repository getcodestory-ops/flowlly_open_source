import React, { useState, useCallback } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { getInlineDocument, saveDocumentAs, fetchResource } from "@/api/folderRoutes";
import { updateDocumentName } from "@/api/documentRoutes";
import { useStore, useViewStore } from "@/utils/store";
import { X, Folder, Plus, ChevronLeft, ChevronRight, Box, PanelLeft, PanelLeftClose, MessageSquare, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";
import PlatformChatComponent from "./PlatformChatComponent";
import LayoutModeToggle from "./components/LayoutModeToggle";

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
	const { tabs, activeTabId, setActiveTab, removeTab, clearAllTabs, addTab, selectedContexts, setSelectedContexts, isWaitingForResponse, streamingKey } = useChatStore();
	const { chatLayoutMode, setChatLayoutMode } = useViewStore();
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
	const { session, activeProject, activeChatEntity, unsavedChanges, setUnsavedChanges, clearUnsavedChanges, clearAllUnsavedChanges } = useStore();
	const { toast } = useToast();

	const activeTab = tabs.find((tab) => tab.id === activeTabId);
	const [isDownloading, setIsDownloading] = useState(false);

	// Context attachment logic for the active tab
	const currentChatId = activeChatEntity?.id || "untitled";
	const currentContexts = selectedContexts[currentChatId] || [];
	const isActiveTabInContext = !!(
		activeTab &&
		activeTab.resourceId &&
		(activeTab.type === "sources" || activeTab.type === "sandbox") &&
		currentContexts.some((ctx) => ctx.id === activeTab.resourceId)
	);
	const canAddActiveTabAsContext = !!(
		activeTab &&
		activeTab.resourceId &&
		(activeTab.type === "sources" || activeTab.type === "sandbox")
	);

	const handleToggleContext = useCallback(() => {
		if (!activeTab || !activeTab.resourceId) return;
		const fileId = activeTab.resourceId;
		const fileName = activeTab.filename || activeTab.title || "file";
		const extension = getFileExtension(fileName);

		const isAlreadyAdded = currentContexts.some((ctx) => ctx.id === fileId);
		if (isAlreadyAdded) {
			setSelectedContexts(currentChatId, currentContexts.filter((ctx) => ctx.id !== fileId));
		} else {
			setSelectedContexts(currentChatId, [...currentContexts, { id: fileId, name: fileName, extension }]);
		}
	}, [activeTab, currentChatId, currentContexts, setSelectedContexts]);

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

	const handleDownload = useCallback(async () => {
		if (!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox")) return;
		if (!session || !activeProject?.project_id || !activeTab.resourceId) return;
		
		setIsDownloading(true);
		try {
			const isSandboxFile = activeTab.type === "sandbox";
			const sandboxId = getSandboxId(activeTab);
			const resource = await getInlineDocument({ 
				session, 
				projectId: activeProject.project_id, 
				resourceId: sandboxId,
				isSandboxFile,
				fileName: activeTab.filename,
			});
			
			if (resource?.url && activeTab.filename) {
				const link = document.createElement("a");
				link.href = resource.url;
				link.download = activeTab.filename;
				link.target = "_blank";
				link.rel = "noopener noreferrer";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		} catch (error) {
			console.error("Error downloading file:", error);
			toast({
				title: "Error",
				description: "Failed to download file",
				variant: "destructive",
			});
		} finally {
			setIsDownloading(false);
		}
	}, [activeTab, session, activeProject?.project_id, toast]);

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

	const inLineViewableExtensions = ["pdf", "oga", "wav", "mp3", "mp4", "webm", "ogg", "jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff", "csv", "json", "xml", "html", "docx", "doc", "xlsx", "xls", "ppt", "pptx", "odt", "ods", "odp", "md", "jsonl", "py", "css", "js", "ts", "tsx", "template", "database", "excalidraw"];

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
		<div 
			className="flex flex-col bg-gray-50 "
			style={{ height: `calc(100vh - ${heightOffset}px)` }}
		>
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
				<div className="flex items-center bg-gray-50 rounded-t-lg">
					<div 
						className="flex-1 w-0 min-w-0 relative overflow-hidden"
						onMouseLeave={handleTabAreaMouseLeave}
						onMouseMove={handleTabAreaMouseMove}
						ref={tabAreaRef}
					>
						{/* Floating Left Arrow */}
						{showLeftArrow && (
							<div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 animate-in fade-in duration-200">
								<Button
									className="h-6 w-6 p-0 bg-white/95 hover:bg-white shadow-md border border-gray-200"
									onClick={() => scrollTabs("left")}
									size="icon"
									title="Scroll tabs left"
									variant="ghost"
								>
									<ChevronLeft className="h-3.5 w-3.5" />
								</Button>
							</div>
						)}
						{showRightArrow && (
							<div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 animate-in fade-in duration-200">
								<Button
									className="h-6 w-6 p-0 bg-white/95 hover:bg-white shadow-md border border-gray-200"
									onClick={() => scrollTabs("right")}
									size="icon"
									title="Scroll tabs right"
									variant="ghost"
								>
									<ChevronRight className="h-3.5 w-3.5" />
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
							<div className="flex items-center px-1.5 gap-0.25 h-[36px]">
								{tabs.map((tab, index) => {
									const isActive = tab.id === activeTabId;
									const fileExtension = getFileExtension(tab.filename);
									const fileConfig = getFileConfig(fileExtension);
									
									return (
										<button
											className={cn(
												"group relative flex items-center gap-1.5 px-2.5 h-[28px] text-xs transition-all duration-150 flex-shrink-0 max-w-[160px] border border-indigo-100 rounded-t-md",
												isActive 
													? "bg-indigo-100 text-gray-900  border border-gray-300 rounded-t-md" 
													: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 "
											)}
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
										>
										{/* File icon */}
										{tab.type === "chat" ? (
											<div className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded bg-purple-100">
												{(isWaitingForResponse || streamingKey) ? (
													<Loader2 className="h-3 w-3 text-purple-600 animate-spin" />
												) : (
													<MessageSquare className="h-3 w-3 text-purple-600" />
												)}
											</div>
										) : tab.type === "folder" ? (
											<div className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded bg-blue-100">
												<Folder className="h-3 w-3 text-blue-600" />
											</div>
										) : (
											<div className={cn(
												"flex-shrink-0 flex items-center justify-center w-4 h-4 rounded",
												fileConfig.bg, fileConfig.color
											)}>
												<FileIconSvg className="h-4 w-4" iconKey={fileConfig.iconKey} />
											</div>
										)}
											
											{/* File name */}
											<span className="truncate min-w-0 flex-1" title={tab.filename || tab.title}>
												{editingTabId === tab.id && (tab.type === "sources" || tab.type === "sandbox") ? (
													<input
														autoFocus
														className="text-xs bg-transparent border border-gray-300 rounded px-1 py-0 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
														onBlur={() => handleFileNameInputBlur(tab.id)}
														onChange={(e) => setEditedName(e.target.value)}
														onKeyDown={(e) => handleFileNameKeyDown(e, tab.id)}
														value={editedName}
													/>
												) : (
													<span 
														className="truncate flex items-center gap-1"
														onDoubleClick={() => handleFileNameDoubleClick(tab)}
													>
														{tab.filename || tab.title}
														{tab.type === "sandbox" && (
															<Box className={cn("h-2.5 w-2.5 flex-shrink-0 opacity-60", fileConfig.color)} />
														)}
													</span>
												)}
											</span>
											
											{/* Unsaved indicator */}
											{unsavedChanges[tab.resourceId || tab.id] && (
												<span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
											)}
											
										{/* Close button - visible on hover or when active, hidden for permanent chat tab */}
										{tab.type !== "chat" && (
											<div
												className={cn(
													"h-4 w-4 flex-shrink-0 inline-flex items-center justify-center rounded-sm cursor-pointer transition-all",
													isActive 
														? "hover:bg-gray-200 text-gray-500" 
														: "opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400"
												)}
												onClick={(e) => handleTabClose(tab.id, e)}
											>
												<X className="h-3 w-3" />
											</div>
										)}
										</button>
									);
								})}
							</div>
						</div>
					</div>
					{activeTab?.type === "chat" ? (
					<div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border-l border-gray-200 rounded-tr-lg">
						<LayoutModeToggle />
					</div>
				) : (
					<TopToolbar
						canAddContext={canAddActiveTabAsContext}
						canDownload={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox") && !isDownloading}
						canPrint={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox") && htmlExtensions.includes(getFileExtension(activeTab.filename))}
						canRename={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox")}
						canSaveAs={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox")}
						canToggleEditMode={!!activeTab && (activeTab.type === "sources" || activeTab.type === "sandbox") && htmlExtensions.includes(getFileExtension(activeTab.filename))}
						hasUnsavedInEdit={!!(activeTab && unsavedChanges[activeTab.resourceId || activeTab.id] && (activeTab.type === "sources" || activeTab.type === "sandbox") && getCurrentViewMode(activeTab.id) === "text")}
						isAddedAsContext={isActiveTabInContext}
						isDownloading={isDownloading}
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
						onToggleContext={handleToggleContext}
						onToggleMode={() => activeTab && handleModeSwitch(activeTab.id)}
					/>
				)}
				</div>
			)}
			<div className="flex-1 overflow-auto relative b">
				{tabs.length === 0 && (
					<div className="flex items-center justify-center h-full text-gray-500">
						<div className="text-center">
							<Folder className="h-16 w-16 mx-auto mb-4 text-gray-300" />
							<p className="text-lg font-medium mb-2">No files or folders selected</p>
							<p className="text-sm mb-4">Click &ldquo;Select Files and Folders&rdquo; to get started</p>
							
							{/* Mode toggle when empty */}
							<Button
								className={cn(
									"gap-2 transition-all duration-200",
									chatLayoutMode === "agent"
										? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
										: "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
								)}
								onClick={() => setChatLayoutMode(chatLayoutMode === "agent" ? "split" : "agent")}
								size="sm"
								variant="outline"
							>
								{chatLayoutMode === "agent" ? (
									<>
										<PanelLeft className="h-4 w-4" />
										<span>Switch to Split View</span>
									</>
								) : (
									<>
										<PanelLeftClose className="h-4 w-4" />
										<span>Switch to Focus Mode</span>
									</>
								)}
							</Button>
						</div>
					</div>
				)}
				{tabs.map((tab) => (
					<div 
						className={cn(
							"absolute inset-0",
							tab.id === activeTabId ? "block" : "hidden",
						)}
						key={tab.id}
					>
						{tab.type === "folder" && (
							<DocumentSelector 
								contextId={tab.contextId} 
								singleSelect={tab.singleSelect}
								useChatContext 
							/>
						)}
						{tab.type === "sources" && (
							<>
								{inLineViewableExtensions.includes(getFileExtension(tab.filename)) && (
									<>
										{getCurrentViewMode(tab.id) === "original" ? (
											["md", "py", "js", "ts", "tsx", "css", "json", "jsonl", "template", "database", "excalidraw"].includes(getFileExtension(tab.filename)) ? (
												<ResourceTextViewer 
													fileName={tab.filename}
													lastReloadTime={tab.lastReloadTime}
													resource_id={tab.resourceId}
												/>
											) : (
												<InlineDocumentViewer 
													fileExtension={getFileExtension(tab.filename)} 
													fileName={tab.filename}
													lastReloadTime={tab.lastReloadTime}
													resourceId={tab.resourceId}
												/>
											)
										) : (
											<ResourceTextViewer 
												fileName={tab.filename}
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
												"template",
												"database",
												"excalidraw",
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
					{tab.type === "chat" && activeProject && (
						<PlatformChatComponent
							chatTarget="agent"
							folderId={activeProject.project_id}
							heightOffset={heightOffset + 42}
						/>
					)}
				</div>
				))}
			</div>
			<Dialog onOpenChange={setShowSaveAsDialog} open={showSaveAsDialog}>
				<DialogContent className="sm:max-w-[500px]" title="Save Document As">
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
