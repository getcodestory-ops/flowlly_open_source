import React, { useEffect, useState, useCallback, useRef } from "react";
import { MessageCircle } from "lucide-react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import EmailModal from "../AiActions/EmailModal";
import { useStore } from "@/utils/store";
import { useEditorStore } from "@/hooks/useEditorStore";
import { Button, ButtonProps } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
(pdfMake as any).vfs = pdfFonts.vfs;
import { type Editor } from "@tiptap/react";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";
import { saveDocumentAs } from "@/api/folderRoutes";
import {
	ExportTools,
	UndoRedoTools,
	HeadingTextStyles,
	TextFormatting,
	ColorTools,
	ListTools,
	TableTools,
	ImageTools,
	AITools,
	SaveButton,
	SaveStatus,
	UnsavedChangesDialog,
	FontTools,
} from "./ToolBarItems";
interface ToolbarProps {
	documentType: string;
	saveFunction?: (_: string) => void;
	onAIEditedContent?: (_: string) => void;
	documentId?: string;
	documentName?: string;
	editor: Editor;
	showComments?: boolean;
	onShowComments?: () => void;
}



const Toolbar: React.FC<ToolbarProps> = ({
	saveFunction,
	documentType,
	onAIEditedContent,
	documentId,
	documentName,
	editor,
	showComments = true,
	onShowComments,
}) => {
	const [saveStatus, setSaveStatus] = useState(SaveStatus.SAVED);
	const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
	const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
	const { session: sessionToken, activeProject, unsavedChanges, setUnsavedChanges, clearUnsavedChanges } = useStore();
	const { toast } = useToast();
	const { threads, setCommentsVisible } = useEditorStore();
	const unresolvedCommentsCount = threads.filter((thread) => !thread.resolvedAt).length;
	// Get unsaved changes for this specific document
	const hasUnsavedChanges = documentId ? unsavedChanges[documentId] || false : false;
	const lastSavedContent = useRef<string>("");
	const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedFolderName, setSelectedFolderName] = useState<string>("");

	// Track content changes for unsaved state
	useEffect(() => {
		if (editor) {
			const handleUpdate = () => {
				const currentContent = editor.getHTML();
				const hasChanges = currentContent !== lastSavedContent.current;
				if (documentId) {
					setUnsavedChanges(documentId, hasChanges);
				}
				
				if (hasChanges && saveStatus === SaveStatus.SAVED) {
					setSaveStatus(SaveStatus.UNSAVED);
				}
			};

			editor.on("update", handleUpdate);
			
			// Set initial content
			lastSavedContent.current = editor.getHTML();
			
			return () => {
				editor.off("update", handleUpdate);
			};
		}
	}, [editor, saveStatus]);

	// Manual save function
	const handleSave = useCallback(async() => {
		if (!saveFunction || !editor || saveStatus === SaveStatus.SAVING) return;
		
		setSaveStatus(SaveStatus.SAVING);
		
		try {
			const content = editor.getHTML();
			await saveFunction(content);
			lastSavedContent.current = content;
			if (documentId) {
				clearUnsavedChanges(documentId);
			}
			setSaveStatus(SaveStatus.SAVED);
			
			toast({
				title: "Document saved",
				description: "Your changes have been saved successfully.",
			});
		} catch (error) {
			setSaveStatus(SaveStatus.ERROR);
			toast({
				title: "Save failed",
				description: "Failed to save the document. Please try again.",
				variant: "destructive",
			});
		}
	}, [saveFunction, editor, saveStatus, toast]);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleSave]);

	// Handle beforeunload warning
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);

	// Dialog handlers
	const handleSaveAndContinue = async() => {
		await handleSave();
		if (pendingNavigation) {
			pendingNavigation();
			setPendingNavigation(null);
		}
		setShowUnsavedDialog(false);
	};

	const handleDiscardChanges = () => {
		if (documentId) {
			clearUnsavedChanges(documentId);
		}
		setSaveStatus(SaveStatus.SAVED);
		if (pendingNavigation) {
			pendingNavigation();
			setPendingNavigation(null);
		}
		setShowUnsavedDialog(false);
	};

	const handleCancelNavigation = () => {
		setPendingNavigation(null);
		setShowUnsavedDialog(false);
	};




	const setSaveAsFolder = (folderId: string | null, folderName: string): void => {
		setSelectedFolderId(folderId);
		setSelectedFolderName(folderName);
	};

	const handleSaveAs = async(): Promise<void> => {
		if (!selectedFolderId || !documentId || !sessionToken || !activeProject?.project_id) return;
		const response = await saveDocumentAs(sessionToken, activeProject?.project_id, documentId, selectedFolderId);
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
	};


	if (!editor) {
		return null;
	}
	return (
		<div className="flex top-0 sticky z-10 bg-white border border-gray-200 rounded-md shadow-sm w-full">
			<div className="flex px-2 py-1.5 rounded-lg justify-between w-full">
				<div className="flex items-center gap-0.5">
					<SaveButton 
						editor={editor}
						hasUnsavedChanges={hasUnsavedChanges}
						onSave={handleSave}
						saveStatus={saveStatus}
					/>
					<Separator className="mx-1" orientation="vertical" />
					<ExportTools 
						editor={editor} 
						onShowSaveAsDialog={() => setShowSaveAsDialog(true)} 
					/>
					<Separator className="mx-1" orientation="vertical" />
					<UndoRedoTools editor={editor} />
					<Separator className="mx-1" orientation="vertical" />
					<HeadingTextStyles editor={editor} />
					<FontTools editor={editor} />
					<TextFormatting editor={editor} />
					<Separator className="mx-1" orientation="vertical" />
					<ColorTools editor={editor} />
					<ListTools editor={editor} />
					<Separator className="mx-1" orientation="vertical" />
					<TableTools editor={editor} />
					<ImageTools editor={editor} />
				</div>
				<div className="flex items-center gap-2">
					{!showComments && onShowComments && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="relative">
										<Button
											className="h-8 w-8 p-0"
											onClick={onShowComments}
											size="sm"
											variant="ghost"
										>
											<MessageCircle className="h-4 w-4" />
										</Button>
										{unresolvedCommentsCount > 0 && (
											<div className="absolute -top-0 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
												{unresolvedCommentsCount > 99 ? "99+" : unresolvedCommentsCount}
											</div>
										)}
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Show comments {unresolvedCommentsCount > 0 && `(${unresolvedCommentsCount} unresolved)`}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					{sessionToken && (
						<EmailModal
							editor={editor}
							sessionToken={sessionToken}
							subject={documentType}
						/>
					)}
				</div>
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
				isSaving={saveStatus === SaveStatus.SAVING}
				onCancel={handleCancelNavigation}
				onDiscard={handleDiscardChanges}
				onSave={handleSaveAndContinue}
			/>
		</div>
	);
};

type ToolTipedButtonProps = {
	children: React.ReactNode;
	tooltip: string;
} & ButtonProps;

export const ToolTipedButton = ({
	children,
	tooltip,
	...buttonProps
}: ToolTipedButtonProps) => {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<Button
						{...buttonProps}
						className={cn("px-1.5 py-1 h-8", buttonProps.className)}
						size="sm"
						variant={buttonProps.variant || "ghost"}
					>
						{children}
					</Button>
				</TooltipTrigger>
				<TooltipContent>{tooltip}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default Toolbar;
