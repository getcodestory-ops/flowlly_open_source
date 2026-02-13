import React, { useState, useCallback } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { getInlineDocument, saveDocumentAs, fetchResource } from "@/api/folderRoutes";
import { updateDocumentName } from "@/api/documentRoutes";
import { useStore, useViewStore } from "@/utils/store";
import { X, Folder, Plus, ChevronLeft, ChevronRight, Box, PanelLeft, PanelLeftClose, MessageSquare, Loader2, Columns2 } from "lucide-react";
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
import AttachmentTray from "./AttachmentTray";

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
	const { tabs, activeTabId, setActiveTab, removeTab, clearAllTabs, addTab, reorderTabs, selectedContexts, setSelectedContexts, isWaitingForResponse, streamingKey } = useChatStore();
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
	// Pointer-based drag and drop state
	const [isDragging, setIsDragging] = useState(false);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
	const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
	const [dragSplitZone, setDragSplitZone] = useState<"left" | "right" | null>(null);
	const dragInfoRef = React.useRef<{
		isDragging: boolean;
		tabIndex: number;
		startX: number;
		startY: number;
		tabWidth: number;
		tabRects: DOMRect[];
	} | null>(null);
	const insertionIndexRef = React.useRef<number | null>(null);
	const dragSplitZoneRef = React.useRef<"left" | "right" | null>(null);
	const wasDraggingRef = React.useRef(false);
	const contentAreaRef = React.useRef<HTMLDivElement>(null);
	// Split view state
	const [splitTabId, setSplitTabId] = useState<string | null>(null);
	const [splitRatio, setSplitRatio] = useState(50);
	const [focusedPanel, setFocusedPanel] = useState<"left" | "right">("left");
	const [isResizingDivider, setIsResizingDivider] = useState(false);
	const { session, activeProject, activeChatEntity, unsavedChanges, setUnsavedChanges, clearUnsavedChanges, clearAllUnsavedChanges } = useStore();
	const { toast } = useToast();

	const activeTab = tabs.find((tab) => tab.id === activeTabId);
	const splitTab = splitTabId ? tabs.find((t) => t.id === splitTabId) : null;
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

	const inLineViewableExtensions = ["pdf", "oga", "wav", "mp3", "mp4", "webm", "ogg", "jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff", "csv", "json", "xml", "html", "docx", "doc", "xlsx", "xls", "ppt", "pptx", "odt", "ods", "odp", "md", "jsonl", "py", "css", "js", "ts", "tsx", "template", "database", "excalidraw", "glb", "gltf"];

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

	// --- Pointer-based drag and drop for tab reordering (Arc/Zen style) ---

	// Compute CSS transform for each tab during drag to animate the gap
	const getTabDragStyle = (index: number): React.CSSProperties => {
		if (!isDragging || draggedIndex === null || dragInfoRef.current === null) return {};

		// The dragged tab becomes invisible (shown as floating ghost instead)
		if (index === draggedIndex) {
			return { opacity: 0, pointerEvents: "none" as const };
		}

		const di = draggedIndex;
		const w = dragInfoRef.current.tabWidth;
		const gi = insertionIndex;
		let shift = 0;

		// Close the gap left by the dragged tab
		if (index > di) shift -= w;

		// Open gap at the insertion point
		if (gi !== null) {
			const compactedIndex = index > di ? index - 1 : index;
			if (compactedIndex >= gi) shift += w;
		}

		return {
			transform: shift ? `translateX(${shift}px)` : "none",
			transition: "transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)",
		};
	};

	const handleTabPointerDown = (e: React.PointerEvent, index: number) => {
		if (e.button !== 0) return;

		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const tabContainer = el.parentElement!;
		const allRects = Array.from(tabContainer.children).map(
			(c) => (c as HTMLElement).getBoundingClientRect()
		);

		dragInfoRef.current = {
			isDragging: false,
			tabIndex: index,
			startX: e.clientX,
			startY: e.clientY,
			tabWidth: rect.width,
			tabRects: allRects,
		};

		const onPointerMove = (ev: PointerEvent) => {
			const info = dragInfoRef.current;
			if (!info) return;

			const dx = ev.clientX - info.startX;
			const dy = ev.clientY - info.startY;

			if (!info.isDragging) {
				if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
					info.isDragging = true;
					setIsDragging(true);
					setDraggedIndex(info.tabIndex);
				}
				return;
			}

			ev.preventDefault();
			setDragPos({ x: ev.clientX, y: ev.clientY });

			// Check if cursor is over the content area (below tab bar) for drag-to-split
			const contentRect = contentAreaRef.current?.getBoundingClientRect();
			if (contentRect && ev.clientY > contentRect.top + 30) {
				const relX = ev.clientX - contentRect.left;
				const mid = contentRect.width / 2;
				const zone = relX < mid ? "left" as const : "right" as const;
				dragSplitZoneRef.current = zone;
				setDragSplitZone(zone);
				insertionIndexRef.current = null;
				setInsertionIndex(null);
			} else {
				dragSplitZoneRef.current = null;
				setDragSplitZone(null);

				// Compute insertion index from cursor position vs compacted tab midpoints
				const rects = info.tabRects;
				const di = info.tabIndex;
				const w = info.tabWidth;

				const midpoints: number[] = [];
				for (let i = 0; i < rects.length; i++) {
					if (i === di) continue;
					let mp = rects[i].left + rects[i].width / 2;
					if (i > di) mp -= w;
					midpoints.push(mp);
				}

				let idx = midpoints.length;
				for (let i = 0; i < midpoints.length; i++) {
					if (ev.clientX < midpoints[i]) {
						idx = i;
						break;
					}
				}

				insertionIndexRef.current = idx;
				setInsertionIndex(idx);
			}
		};

		const onPointerUp = () => {
			const info = dragInfoRef.current;

			if (info?.isDragging) {
				wasDraggingRef.current = true;
				setTimeout(() => { wasDraggingRef.current = false; }, 10);

				const splitZone = dragSplitZoneRef.current;
				const insertion = insertionIndexRef.current;

				if (splitZone && tabs.length >= 2) {
					handleDragToSplit(splitZone, info.tabIndex);
				} else if (insertion !== null && insertion !== info.tabIndex) {
					reorderTabs(info.tabIndex, insertion);
				}
			}

			// Clean up all drag state
			dragInfoRef.current = null;
			insertionIndexRef.current = null;
			dragSplitZoneRef.current = null;
			setIsDragging(false);
			setDraggedIndex(null);
			setInsertionIndex(null);
			setDragSplitZone(null);

			document.removeEventListener("pointermove", onPointerMove);
			document.removeEventListener("pointerup", onPointerUp);
		};

		document.addEventListener("pointermove", onPointerMove);
		document.addEventListener("pointerup", onPointerUp);
	};

	// --- Split view handlers ---

	const handleDragToSplit = (zone: "left" | "right", dragIdx: number) => {
		const draggedTab = tabs[dragIdx];
		if (!draggedTab) return;

		if (!splitTabId) {
			// Activate split view
			if (zone === "right") {
				if (draggedTab.id === activeTabId) {
					const otherTab = tabs.find((t) => t.id !== draggedTab.id);
					if (otherTab) { setActiveTab(otherTab.id); setSplitTabId(draggedTab.id); }
				} else {
					setSplitTabId(draggedTab.id);
				}
			} else {
				if (draggedTab.id === activeTabId) {
					const otherTab = tabs.find((t) => t.id !== draggedTab.id);
					if (otherTab) setSplitTabId(otherTab.id);
				} else {
					const prevActive = activeTabId;
					setActiveTab(draggedTab.id);
					if (prevActive) setSplitTabId(prevActive);
				}
			}
		} else {
			// Split already active - update the target panel
			if (zone === "left") {
				if (draggedTab.id === splitTabId) {
					const prevActive = activeTabId;
					setActiveTab(draggedTab.id);
					if (prevActive) setSplitTabId(prevActive);
				} else {
					setActiveTab(draggedTab.id);
				}
			} else {
				if (draggedTab.id === activeTabId) {
					const prevSplit = splitTabId;
					setSplitTabId(draggedTab.id);
					setActiveTab(prevSplit);
				} else {
					setSplitTabId(draggedTab.id);
				}
			}
		}
		setFocusedPanel(zone);
	};

	const toggleSplit = () => {
		if (splitTabId) {
			setSplitTabId(null);
			setSplitRatio(50);
			setFocusedPanel("left");
		} else {
			const otherTab = tabs.find((t) => t.id !== activeTabId);
			if (otherTab) {
				setSplitTabId(otherTab.id);
				setSplitRatio(50);
				setFocusedPanel("left");
			}
		}
	};

	const closeSplit = () => {
		setSplitTabId(null);
		setSplitRatio(50);
		setFocusedPanel("left");
	};

	const handleTabClick = (tabId: string) => {
		if (wasDraggingRef.current) return;
		if (!splitTabId) {
			setActiveTab(tabId);
			return;
		}
		if (focusedPanel === "left") {
			if (tabId === splitTabId) {
				const prevActive = activeTabId;
				setActiveTab(tabId);
				setSplitTabId(prevActive);
			} else {
				setActiveTab(tabId);
			}
		} else {
			if (tabId === activeTabId) {
				const prevSplit = splitTabId;
				setSplitTabId(tabId);
				setActiveTab(prevSplit);
			} else {
				setSplitTabId(tabId);
			}
		}
	};

	// Resizable split divider
	const handleDividerPointerDown = (e: React.PointerEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsResizingDivider(true);

		const onMove = (ev: PointerEvent) => {
			const contentRect = contentAreaRef.current?.getBoundingClientRect();
			if (!contentRect) return;
			const relX = ev.clientX - contentRect.left;
			const ratio = Math.min(80, Math.max(20, (relX / contentRect.width) * 100));
			setSplitRatio(ratio);
		};

		const onUp = () => {
			setIsResizingDivider(false);
			document.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerup", onUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};

		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onUp);
	};

	// Clean up split view when tabs are removed
	React.useEffect(() => {
		if (splitTabId && !tabs.find((t) => t.id === splitTabId)) {
			setSplitTabId(null);
			setSplitRatio(50);
			setFocusedPanel("left");
		}
		if (splitTabId && activeTabId && splitTabId === activeTabId) {
			const otherTab = tabs.find((t) => t.id !== activeTabId);
			if (otherTab) {
				setSplitTabId(otherTab.id);
			} else {
				setSplitTabId(null);
				setSplitRatio(50);
				setFocusedPanel("left");
			}
		}
	}, [tabs, activeTabId, splitTabId]);

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
									const isSplitActive = splitTabId === tab.id;
									const fileExtension = getFileExtension(tab.filename);
									const fileConfig = getFileConfig(fileExtension);
									
									return (
										<button
											className={cn(
												"group relative flex items-center gap-1.5 px-2.5 h-[28px] text-xs transition-colors duration-150 flex-shrink-0 max-w-[160px] border rounded-t-md select-none touch-none",
												isActive 
													? "bg-indigo-100 text-gray-900 border-gray-300" 
													: isSplitActive
													? "bg-emerald-50 text-gray-900 border-emerald-300"
													: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-indigo-100",
												isDragging && draggedIndex !== index ? "cursor-default" : "cursor-grab"
											)}
											key={tab.id}
											onClick={() => handleTabClick(tab.id)}
											onPointerDown={(e) => handleTabPointerDown(e, index)}
											style={getTabDragStyle(index)}
										>
										{/* Split panel indicator */}
										{splitTabId && (isActive || isSplitActive) && (
											<div className={cn(
												"absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-full",
												isActive ? "bg-indigo-400" : "bg-emerald-400"
											)} />
										)}
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
					{/* Split view toggle */}
					{tabs.length >= 2 && (
						<Button
							className={cn(
								"h-7 w-7 p-0 flex-shrink-0 ml-1",
								splitTabId && "bg-indigo-50 hover:bg-indigo-100"
							)}
							onClick={toggleSplit}
							size="icon"
							title={splitTabId ? "Close split view" : "Split view"}
							variant="ghost"
						>
							<Columns2 className={cn("h-3.5 w-3.5", splitTabId ? "text-indigo-600" : "text-gray-500")} />
						</Button>
					)}
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
		<div className="flex-1 overflow-hidden relative" ref={contentAreaRef}>
			{/* Attachment tray - shown below tabs when chat tab is active */}
			{activeTab?.type === "chat" && <AttachmentTray />}

			{/* Empty state */}
				{tabs.length === 0 && !splitTabId && (
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

				{/* Split view panel headers and resizable divider */}
				{splitTabId && (
					<>
						{/* Left panel header */}
						<div 
							className={cn(
								"absolute top-0 left-0 h-7 z-10 flex items-center gap-2 px-3 border-b text-xs cursor-pointer select-none transition-colors",
								focusedPanel === "left" 
									? "bg-indigo-50/80 border-indigo-200" 
									: "bg-gray-50/80 border-gray-200 hover:bg-gray-100/60"
							)}
							onClick={() => setFocusedPanel("left")}
							style={{ width: `${splitRatio}%` }}
						>
							<div className={cn(
								"w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
								focusedPanel === "left" ? "bg-indigo-400" : "bg-gray-300"
							)} />
							<span className={cn(
								"truncate font-medium transition-colors",
								focusedPanel === "left" ? "text-indigo-700" : "text-gray-500"
							)}>
								{activeTab?.filename || activeTab?.title}
							</span>
						</div>
						{/* Right panel header */}
						<div 
							className={cn(
								"absolute top-0 h-7 z-10 flex items-center justify-between gap-2 px-3 border-b text-xs cursor-pointer select-none transition-colors",
								focusedPanel === "right" 
									? "bg-emerald-50/80 border-emerald-200" 
									: "bg-gray-50/80 border-gray-200 hover:bg-gray-100/60"
							)}
							onClick={() => setFocusedPanel("right")}
							style={{ left: `${splitRatio}%`, width: `${100 - splitRatio}%` }}
						>
							<div className="flex items-center gap-2 min-w-0">
								<div className={cn(
									"w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
									focusedPanel === "right" ? "bg-emerald-400" : "bg-gray-300"
								)} />
								<span className={cn(
									"truncate font-medium transition-colors",
									focusedPanel === "right" ? "text-emerald-700" : "text-gray-500"
								)}>
									{splitTab?.filename || splitTab?.title}
								</span>
							</div>
							<div 
								className="flex-shrink-0 hover:bg-gray-200/70 rounded p-0.5 transition-colors"
								onClick={(e) => { e.stopPropagation(); closeSplit(); }}
							>
								<X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
							</div>
						</div>
						{/* Resizable divider handle */}
						<div 
							className={cn(
								"absolute top-0 bottom-0 z-20 cursor-col-resize group flex items-center justify-center",
								isResizingDivider && "bg-indigo-100/30"
							)}
							onPointerDown={handleDividerPointerDown}
							style={{ left: `calc(${splitRatio}% - 4px)`, width: "8px" }}
						>
							<div className={cn(
								"w-[2px] h-full transition-colors duration-150",
								isResizingDivider ? "bg-indigo-400" : "bg-gray-200 group-hover:bg-indigo-300"
							)} />
						</div>
					</>
				)}

				{/* Drag-to-split zone overlays */}
				{isDragging && tabs.length >= 2 && (
					<div className="absolute inset-0 z-30 pointer-events-none">
						<div className={cn(
							"absolute inset-y-0 left-0 w-1/2 flex items-center justify-center transition-all duration-200 rounded-l-lg",
							dragSplitZone === "left" 
								? "bg-indigo-500/[0.06] ring-2 ring-inset ring-indigo-300/40" 
								: "bg-transparent"
						)}>
							{dragSplitZone === "left" && (
								<div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg border border-indigo-200/80 animate-in zoom-in-95 fade-in duration-150">
									<div className="flex items-center gap-2.5">
										<PanelLeft className="h-4 w-4 text-indigo-500" />
										<span className="text-sm font-medium text-indigo-700">Left panel</span>
									</div>
								</div>
							)}
						</div>
						<div className={cn(
							"absolute inset-y-0 right-0 w-1/2 flex items-center justify-center transition-all duration-200 rounded-r-lg",
							dragSplitZone === "right" 
								? "bg-emerald-500/[0.06] ring-2 ring-inset ring-emerald-300/40" 
								: "bg-transparent"
						)}>
							{dragSplitZone === "right" && (
								<div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg border border-emerald-200/80 animate-in zoom-in-95 fade-in duration-150">
									<div className="flex items-center gap-2.5">
										<Columns2 className="h-4 w-4 text-emerald-500" />
										<span className="text-sm font-medium text-emerald-700">Right panel</span>
									</div>
								</div>
							)}
						</div>
						{dragSplitZone && (
							<div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400/30" />
						)}
					</div>
				)}

				{/* Tab content panels */}
				{tabs.map((tab) => {
					const isLeftVisible = tab.id === activeTabId;
					const isRightVisible = splitTabId !== null && tab.id === splitTabId;

					return (
						<div 
							className={cn(
								"overflow-auto",
								splitTabId
									? (isLeftVisible || isRightVisible ? "absolute top-7 bottom-0" : "hidden")
									: cn("absolute inset-0", isLeftVisible ? "block" : "hidden")
							)}
							key={tab.id}
							style={splitTabId && (isLeftVisible || isRightVisible) ? {
								left: isLeftVisible ? 0 : `${splitRatio}%`,
								width: isLeftVisible ? `${splitRatio}%` : `${100 - splitRatio}%`,
							} : undefined}
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
					);
				})}
			</div>
			{/* Floating ghost tab - follows cursor during drag (Arc/Zen style) */}
			{isDragging && draggedIndex !== null && draggedIndex < tabs.length && (() => {
				const dragTab = tabs[draggedIndex];
				const ext = getFileExtension(dragTab.filename);
				const config = getFileConfig(ext);
				return (
					<div 
						className="fixed z-[100] pointer-events-none"
						style={{
							left: dragPos.x,
							top: dragPos.y,
							transform: "translate(-50%, -50%)",
						}}
					>
						<div className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/95 backdrop-blur-md rounded-lg shadow-2xl shadow-black/[0.12] border border-gray-200/80 whitespace-nowrap scale-105">
							{dragTab.type === "chat" ? (
								<MessageSquare className="h-3 w-3 text-purple-600 flex-shrink-0" />
							) : dragTab.type === "folder" ? (
								<Folder className="h-3 w-3 text-blue-600 flex-shrink-0" />
							) : (
								<div className={cn("flex-shrink-0 flex items-center justify-center w-3.5 h-3.5", config.color)}>
									<FileIconSvg className="h-3.5 w-3.5" iconKey={config.iconKey} />
								</div>
							)}
							<span className="text-gray-900 font-medium max-w-[140px] truncate">
								{dragTab.filename || dragTab.title}
							</span>
						</div>
					</div>
				);
			})()}
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
