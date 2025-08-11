import React, { useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { getInlineDocument, saveDocumentAs, fetchResource } from "@/api/folderRoutes";
import { updateDocumentName } from "@/api/documentRoutes";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { X, FileText, FileImage, FileAudio, FileVideo, FileCode, File, Pencil, Download, Folder, Plus, Save, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import RunningLogViewer from "@/components/WorkflowComponents/RunningLogViewer";
import { DocumentSelector } from "@/components/DocumentSelector";
import { useToast } from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
} from "@/components/ui/dialog";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";
import { UnsavedChangesDialog } from "@/components/DocumentEditor/ToolBarItems";

const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff"];
const tifExtensions = ["tif", "tiff"];
const htmlExtensions = ["html", "htm"];
const microsoftExtensions = ["doc", "docx", "xlsx", "xls", "ppt", "pptx"];
const csvExtensions = ["csv"];

// CSV Viewer Component
const CSVViewer = ({ resourceId, isSandboxFile, fileName, lastReloadTime }: { resourceId: string, isSandboxFile?: boolean, fileName?: string, lastReloadTime?: number }) => {
	const [csvData, setCsvData] = useState<string[][]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { session } = useStore();
	const { activeProject } = useStore();

	const { data: resource, isLoading, isError } = useQuery({
		queryKey: ["csvResource", session, activeProject, resourceId, isSandboxFile, fileName, lastReloadTime],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return fetchResource(session, activeProject.project_id, resourceId, isSandboxFile, fileName);
		},
		enabled: !!session && !!activeProject?.project_id && !!resourceId,
	});

	React.useEffect(() => {
		const parseCsvContent = async() => {
			// Handle both string response (sandbox) and metadata structure (storage)
			let csvText: string | null = null;
			
			if (isSandboxFile && typeof resource === "string") {
				csvText = resource;
			} else if (resource?.metadata?.content) {
				csvText = resource.metadata.content;
			}
			
			if (!csvText) {
				if (!isLoading && !isError) {
					setError("No CSV content available");
				}
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				
				// Simple CSV parser - handles basic CSV format
				const lines = csvText.split("\n").filter((line: string) => line.trim());
				const parsedData = lines.map((line: string) => {
					// Handle quoted fields and commas within quotes
					const result = [];
					let current = "";
					let inQuotes = false;
					
					for (let i = 0; i < line.length; i++) {
						const char = line[i];
						if (char === "\"") {
							inQuotes = !inQuotes;
						} else if (char === "," && !inQuotes) {
							result.push(current.trim());
							current = "";
						} else {
							current += char;
						}
					}
					result.push(current.trim());
					return result;
				});
				
				setCsvData(parsedData);
			} catch (err) {
				setError("Failed to parse CSV content");
			} finally {
				setLoading(false);
			}
		};

		parseCsvContent();
	}, [resource, isLoading, isError]);

	if (isLoading || loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-sm text-gray-600">Loading CSV...</div>
			</div>
		);
	}

	if (isError || error) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<FileText className="h-16 w-16 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">{error || "Failed to load CSV file"}</p>
			</div>
		);
	}

	if (csvData.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<FileText className="h-16 w-16 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">No data found in CSV</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full overflow-auto">
			<div className="min-w-full">
				<table className="w-full border-collapse border border-gray-300">
					<thead>
						{csvData.length > 0 && (
							<tr className="bg-gray-50">
								{csvData[0].map((header, index) => (
									<th 
										className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900 sticky top-0 bg-gray-50"
										key={index}
									>
										{header}
									</th>
								))}
							</tr>
						)}
					</thead>
					<tbody>
						{csvData.slice(1).map((row, rowIndex) => (
							<tr className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} key={rowIndex}>
								{row.map((cell, cellIndex) => (
									<td 
										className="border border-gray-300 px-3 py-2 text-sm text-gray-900 max-w-xs truncate"
										key={cellIndex}
										title={cell}
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

// HTML Viewer Component
const HTMLViewer = ({ resourceId, isSandboxFile, fileName, lastReloadTime }: { resourceId: string, isSandboxFile?: boolean, fileName?: string, lastReloadTime?: number }) => {
	const { session } = useStore();
	const { activeProject } = useStore();

	const { data: resource, isLoading, isError } = useQuery({
		queryKey: ["htmlResource", session, activeProject, resourceId, isSandboxFile, fileName, lastReloadTime],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return fetchResource(session, activeProject.project_id, resourceId, isSandboxFile, fileName);
		},
		enabled: !!session && !!activeProject?.project_id && !!resourceId,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-sm text-gray-600">Loading HTML...</div>
			</div>
		);
	}

	// Handle both string response (sandbox) and metadata structure (storage)
	let htmlContent: string | null = null;
	let cssContent: string | null = null;
	let headerContent: string | null = null;
	
	if (isSandboxFile && typeof resource === "string") {
		htmlContent = resource;
	} else if (resource?.metadata?.content) {
		htmlContent = resource.metadata.content;
		cssContent = resource.metadata.style;
		headerContent = resource.metadata.header;
	}

	if (isError || !htmlContent) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<FileText className="h-16 w-16 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">Failed to load HTML file</p>
			</div>
		);
	}

	// Create enhanced HTML content with injected CSS and header if available
	const createEnhancedHtmlContent = (): string => {
		// Ensure htmlContent is not null at this point
		if (!htmlContent) return "";
		
		let workingHtmlContent = htmlContent;
		
		// Build head content with CSS and header
		let headContent = "";
		if (cssContent) {
			headContent += `\n<style type="text/css">\n${cssContent}\n</style>\n`;
		}
		if (headerContent) {
			headContent += `${headerContent}\n`;
		}

		// If we have content to inject into head
		if (headContent) {
			// Check if HTML already has a <head> section
			const headRegex = /<head[^>]*>/i;
			const headMatch = workingHtmlContent.match(headRegex);

			if (headMatch) {
				// Insert content after the opening <head> tag
				const headEndIndex = headMatch.index! + headMatch[0].length;
				workingHtmlContent = workingHtmlContent.slice(0, headEndIndex) + headContent + workingHtmlContent.slice(headEndIndex);
			} else {
				// If no <head> tag exists, check for <html> tag and add <head> section
				const htmlRegex = /<html[^>]*>/i;
				const htmlMatch = workingHtmlContent.match(htmlRegex);
				
				if (htmlMatch) {
					const htmlEndIndex = htmlMatch.index! + htmlMatch[0].length;
					const headSection = `\n<head>${headContent}</head>\n`;
					workingHtmlContent = workingHtmlContent.slice(0, htmlEndIndex) + headSection + workingHtmlContent.slice(htmlEndIndex);
				} else {
					// If no <html> tag, wrap the entire content and add <head> with content
					workingHtmlContent = `<!DOCTYPE html>\n<html>\n<head>${headContent}</head>\n<body>\n${workingHtmlContent}\n</body>\n</html>`;
				}
			}
		}

		return workingHtmlContent;
	};

	const enhancedHtmlContent = createEnhancedHtmlContent();
	const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(enhancedHtmlContent)}`;

	return (
		<div className="w-full h-full overflow-auto">
			<iframe 
				className="border-0 bg-white w-full h-full"
				sandbox="allow-same-origin"
				src={dataUrl}
				title="HTML Document"
			/>
		</div>
	);
};

const InlineDocumentViewer = ({ resourceId, fileExtension, isSandboxFile, fileName, lastReloadTime }: {resourceId: string, fileExtension: string, isSandboxFile?: boolean, fileName?: string, lastReloadTime?: number}) : React.ReactNode => {
	const { session } = useStore();
	const { activeProject } = useStore();
	
	const needsInlineUrl = !csvExtensions.includes(fileExtension) && !htmlExtensions.includes(fileExtension);
	
	const { data: resource } = useQuery({
		queryKey: ["getInlineFileUrl", session, activeProject, resourceId, isSandboxFile, fileName, lastReloadTime],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return getInlineDocument({ 
				session, 
				projectId: activeProject.project_id, 
				resourceId,
				isSandboxFile,
				fileName,
			});
		},
		enabled: needsInlineUrl && !!session && !!activeProject?.project_id,
	});


	if (csvExtensions.includes(fileExtension)) {
		return (
			<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm">
				<CSVViewer 
					fileName={fileName}
					isSandboxFile={isSandboxFile} 
					lastReloadTime={lastReloadTime}
					resourceId={resourceId}
				/>
			</div>
		);
	}

	if (htmlExtensions.includes(fileExtension)) {
		return (
			<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm">
				<HTMLViewer 
					fileName={fileName}
					isSandboxFile={isSandboxFile} 
					lastReloadTime={lastReloadTime}
					resourceId={resourceId}
				/>
			</div>
		);
	}

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
			{resource && !imageExtensions.includes(fileExtension) && !microsoftExtensions.includes(fileExtension) && (
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
			const isSandboxFile = activeTab.type === "sandbox";
			return getInlineDocument({ 
				session, 
				projectId: activeProject.project_id, 
				resourceId: activeTab.resourceId,
				isSandboxFile,
				fileName: activeTab.filename,
			});
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

	const checkUnsavedChanges = (tabId: string, action: () => void) => {
		const tab = tabs.find((t) => t.id === tabId);
		const documentId = tab?.resourceId || tabId; 
		
		if (unsavedChanges[documentId]) {
			setPendingAction(() => action);
			setShowUnsavedDialog(true);
		} else {
			action();
		}
	};

	const clearTabUnsavedChanges = (tabId: string) => {
		const tab = tabs.find((t) => t.id === tabId);
		const documentId = tab?.resourceId || tabId;
		clearUnsavedChanges(documentId);
	};

	const handleTabClose = (tabId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		checkUnsavedChanges(tabId, () => {
			removeTab(tabId);
			clearTabUnsavedChanges(tabId);
		});
	};

	// Handle mode switching with unsaved changes check
	const handleModeSwitch = (tabId: string) => {
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
	const handleSaveAndContinue = async() => {
		// For now, we'll just proceed with the action
		// In a full implementation, you'd want to save the content first
		if (pendingAction) {
			pendingAction();
			setPendingAction(null);
		}
		setShowUnsavedDialog(false);
	};

	const handleDiscardChanges = () => {
		if (pendingAction) {
			pendingAction();
			setPendingAction(null);
		}
		setShowUnsavedDialog(false);
	};

	const handleCancelAction = () => {
		setPendingAction(null);
		setShowUnsavedDialog(false);
	};

	const inLineViewableExtensions = ["pdf", "oga", "wav", "mp3", "mp4", "webm", "ogg", "wav", "jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff", "csv", "json", "xml", "html", ".xlsx", ".docx", ".doc", "docx", "doc", "xlsx", "md", "json", "jsonl", "py", "css", "js", "ts", "tsx"];

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
							className="overflow-x-auto"
							ref={scrollContainerRef}
							style={{
								scrollbarWidth: "none",
								msOverflowStyle: "none",
								// @ts-ignore
								"&::-webkit-scrollbar": { display: "none" },
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
						</div>
					</div>
					<div className="flex items-center gap-1 px-3 bg-gray-100 border-l border-gray-200 rounded-tr-lg">
						<div className="flex items-center gap-1">
							<Button 
								className="h-8 w-8 p-0"
								disabled={!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox")}
								onClick={() => activeTab && handleFileNameDoubleClick(activeTab)}
								size="icon"
								title={(activeTab?.type === "sources" || activeTab?.type === "sandbox") ? "Rename file" : "Rename not available"}
								variant="ghost"
							>
								<Edit3 className="h-4 w-4" />
							</Button>
							<Button 
								className="h-8 w-8 p-0"
								disabled={!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox") || !downloadResource?.url}
								onClick={handleDownload}
								size="icon"
								title={(activeTab?.type === "sources" || activeTab?.type === "sandbox") ? "Download file" : "Download not available"}
								variant="ghost"
							>
								<Download className="h-4 w-4" />
							</Button>
							<Button 
								className="h-8 w-8 p-0"
								disabled={!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox")}
								onClick={() => setShowSaveAsDialog(true)}
								size="icon"
								title={(activeTab?.type === "sources" || activeTab?.type === "sandbox") ? "Save as copy" : "Save not available"}
								variant="ghost"
							>
								<Save className="h-4 w-4" />
							</Button>
							<Button 
								className={`gap-1 px-2 h-8 transition-all duration-200 relative ${
									(activeTab?.type === "sources" || activeTab?.type === "sandbox") && getCurrentViewMode(activeTab.id) === "text" 
										? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" 
										: "hover:bg-gray-100 border border-transparent"
								} ${(activeTab?.type !== "sources" && activeTab?.type !== "sandbox") ? "opacity-50" : ""}`}
								disabled={!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox")}
								onClick={() => activeTab && handleModeSwitch(activeTab.id)}
								size="sm"
								title={
									!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox")
										? "Edit mode not available" 
										: (getCurrentViewMode(activeTab.id) === "original" ? "Switch to edit mode" : "Switch to view mode")
								}
								variant="ghost"
							>
								{!activeTab || (activeTab.type !== "sources" && activeTab.type !== "sandbox") || getCurrentViewMode(activeTab.id) === "original" ? (
									<>
										<Pencil className="h-4 w-4" />
										<span className="text-xs font-medium">Edit</span>
									</>
								) : (
									<>
										<FileText className="h-4 w-4" />
										<span className="text-xs font-medium">View</span>
									</>
								)}
								{activeTab && unsavedChanges[activeTab.resourceId || activeTab.id] && (activeTab.type === "sources" || activeTab.type === "sandbox") && getCurrentViewMode(activeTab.id) === "text" && (
									<div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
								)}
							</Button>
						</div>
						{/* Universal actions */}
						<Button
							className="h-8 w-8 p-0"
							onClick={handleAddFolderSelector}
							size="icon"
							title="Add Files and Folders"
							variant="ghost"
						>
							<Folder className="h-4 w-4" />
						</Button>
						<Button
							className="h-8 w-8 p-0"
							onClick={() => {
								// Check if any tab has unsaved changes
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
							size="icon"
							title="Close All Tabs"
							variant="ghost"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
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
											
											getFileExtension(tab.filename) === "md" ? (
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
											
											getFileExtension(tab.filename) === "md" ? (
												<ResourceTextViewer 
													fileName={tab.filename}
													isSandboxFile
													lastReloadTime={tab.lastReloadTime}
													resource_id={tab.resourceId}
												/>
											) : (
												<InlineDocumentViewer 
													fileExtension={getFileExtension(tab.filename)} 
													fileName={tab.filename}
													isSandboxFile
													lastReloadTime={tab.lastReloadTime}
													resourceId={tab.resourceId}
												/>
											)
										) : (
											<ResourceTextViewer 
												fileName={tab.filename}
												isSandboxFile
												lastReloadTime={tab.lastReloadTime}
												resource_id={tab.resourceId}
											/>
										)}
									</>
								)}
								{getFileExtension(tab.filename) === "txt" && (
									<ResourceTextViewer 
										fileName={tab.filename}
										isSandboxFile
										lastReloadTime={tab.lastReloadTime}
										resource_id={tab.resourceId}
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
