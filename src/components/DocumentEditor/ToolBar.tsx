import React, { useCallback, useEffect, useState } from "react";

import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarShortcut,
	MenubarTrigger,
} from "@/components/ui/menubar";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	FaBold,
	FaItalic,
	FaUnderline,
	FaListUl,
	FaListOl,
	FaUndo,
	FaRedo,
	FaTable,
	FaSpinner,
	FaImage,
	FaMagic,
	FaFileCsv,
	FaStrikethrough,
	FaHighlighter
} from "react-icons/fa";
import { RxTriangleDown } from "react-icons/rx";
import { FaFileAlt } from "react-icons/fa";
import { MdHighlight } from "react-icons/md";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { FaFileDownload } from "react-icons/fa";
import useDebounce from "@/utils/useDebounce";
import EmailModal from "../AiActions/EmailModal";
import { useStore } from "@/utils/store";
import { Button, ButtonProps } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageForEditor } from "@/api/folderRoutes";
import { useToast } from "@/components/ui/use-toast";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import { handleExportTables, areThereTablesinEditor, convertToPdf, printDocument } from "./utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateDocumentName } from "@/api/documentRoutes";
(pdfMake as any).vfs = pdfFonts.vfs;
import { type Editor } from "@tiptap/react";
import AIEditorLayout from "./AIEditor.tsx/AIEditorLayout";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";
import { saveDocumentAs } from "@/api/folderRoutes";
interface ToolbarProps {
	documentType: string;
	saveFunction?: (_: string) => void;
	onAIEditedContent?: (_: string) => void;
	documentId?: string;
	documentName?: string;
	editor: Editor;
}

enum SaveStatus {
	SAVED = "Saved",
	SAVING = "Saving",
	HIDDEN = "Hidden",
	UNSAVED = "Unsaved",
	ERROR = "Error",
}

const Toolbar: React.FC<ToolbarProps> = ({
	saveFunction,
	documentType,
	onAIEditedContent,
	documentId,
	documentName,
	editor,
}) => {
	const [saveStatus, setSaveStatus] = useState(SaveStatus.HIDDEN);
	const sessionToken = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const { toast } = useToast();
	const [isUploading, setIsUploading] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isPrinting, setIsPrinting] = useState(false);
	const deBounceSave = useDebounce(() => {
		setSaveStatus(SaveStatus.SAVING);

		if (saveFunction && editor) saveFunction(editor.storage.markdown.getMarkdown());

		setTimeout(() => {
			setSaveStatus(SaveStatus.SAVED);
			setTimeout(() => {
				setSaveStatus(SaveStatus.HIDDEN);
			}, 7000);
		}, 3000); // Show "Saved" for 1 second
	}, 10000);
	const [fileName, setFileName] = useState<string | undefined>(documentName);
	const [editingFileName, setEditingFileName] = useState<string | undefined>(documentName);
	const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedFolderName, setSelectedFolderName] = useState<string>("");

	useEffect(() => {
		if (editor) {
			editor.on("update", deBounceSave);
		}
		return () => {
			if (editor) {
				editor.off("update", deBounceSave);
			}
		};
	}, [editor, deBounceSave]);

	const handleFileNameChange = async(newName: string) => {
		if (!documentId) return;
		if (!sessionToken) return;
		const response = await updateDocumentName(sessionToken, documentId, newName);
		if (response) {
			toast({
				title: "File name updated",
				description: "File name updated to " + newName,
			});
			setFileName(newName);
		} else {
			toast({
				title: "Error",
				description: "Failed to update file name",
				variant: "destructive",
			});
			setEditingFileName(fileName);
		}
	};


	const handleFileNameInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const newName = e.target.value.trim();
		if (newName && newName !== fileName) {
			handleFileNameChange(newName);
		} else {
			setEditingFileName(fileName); // Reset to original name if empty or unchanged
		}
	};

	const exportPdf = useCallback(() => {
		if (editor) {
			setIsExporting(true);
			toast({
				title: "Exporting PDF",
				description: "Please wait while we generate your PDF...",
			});
			
			// Get the editor DOM element
			const editorElement = document.querySelector(".ProseMirror");
			
			if (!editorElement) {
				toast({
					title: "Error",
					description: "Error in processing document. Please try again later.",
					variant: "destructive",
				});
				setIsExporting(false);
				return;
			}
			convertToPdf(editorElement as HTMLElement)
				.then(() => {
					toast({
						title: "Success",
						description: "PDF exported successfully",
					});
				})
				.catch((error) => {
					console.error("Error exporting PDF:", error);
					toast({
						title: "Error",
						description: "Failed to export PDF. Please try again.",
						variant: "destructive",
					});
				})
				.finally(() => {
					setIsExporting(false);
				});
		}
	}, [editor, toast]);

	const printPreview = useCallback(() => {
		if (editor) {
			setIsPrinting(true);
			
			// Get the editor DOM element
			const editorElement = document.querySelector(".ProseMirror");
			
			if (!editorElement) {
				toast({
					title: "Error",
					description: "Error in processing document for printing. Please try again later.",
					variant: "destructive",
				});
				setIsPrinting(false);
				return;
			}
			
			try {
				printDocument(editorElement as HTMLElement);
				toast({
					title: "Success",
					description: "Print dialog opened in a new window",
				});
			} catch (error) {
				console.error("Error opening print dialog:", error);
				toast({
					title: "Error",
					description: "Failed to open print dialog. Please check your popup settings and try again.",
					variant: "destructive",
				});
			} finally {
				setIsPrinting(false);
			}
		}
	}, [editor, toast]);

	const [tableRows, setTableRows] = useState(3);
	const [tableCols, setTableCols] = useState(3);

	const [imageUrl, setImageUrl] = useState("");
	// const [zoomLevel, setZoomLevel] = useState(100);

	const handleImageUpload = async(file: File) => {
		if (!sessionToken) {
			toast({
				title: "Error",
				description: "You must be logged in to upload images.",
				variant: "destructive",
			});
			return;
		}

		setIsUploading(true);
		if (!activeProject?.project_id) {
			toast({
				title: "Error",
				description: "No active project found.",
				variant: "destructive",
			});
			return;
		}
		try {
			const result = await uploadImageForEditor({
				session: sessionToken,
				projectId: activeProject?.project_id,
				file,
			});
			if (editor) {
				editor.chain().focus()
					.setImage({ src: result.url })
					.run();
			
				toast({
					title: "Success",
					description: "Image uploaded successfully.",
				});
			}
		} catch (error) {
			console.error("Error uploading image:", error);
			toast({
				title: "Error",
				description: "Failed to upload image. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
		}
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
		<div className="flex top-0 sticky z-10 bg-white border-b w-full ">
			<div className="flex px-4 py-2 rounded-lg justify-between w-full">
				<div className="flex items-center gap-1">
					<Menubar className="bg-transparent border-none p-0 m-0 shadow-none">
						<MenubarMenu>
							<MenubarTrigger className="bg-transparent border-none p-0 m-0 shadow-none">
								<ToolTipedButton onClick={() => {}} tooltip="Export">
									<FaFileDownload /> <RxTriangleDown />
								</ToolTipedButton>
							</MenubarTrigger>
							<MenubarContent>
								<MenubarItem className="cursor-pointer"
									disabled={isPrinting}
									onClick={printPreview}
								>
									{isPrinting ? (
										<>
											Opening Print Dialog... <FaSpinner className="h-4 w-4 ml-2 animate-spin" />
										</>
									) : (
										<>
											Print
											<MenubarShortcut>
												<FaFileDownload className="h-4 w-4" />
											</MenubarShortcut>
										</>
									)}
								</MenubarItem>
								<MenubarItem 
									className="cursor-pointer"
									onClick={() => setShowSaveAsDialog(true)}
								>
									Save As
									<MenubarShortcut>
										<FaFileAlt className="h-4 w-4" />
									</MenubarShortcut>
								</MenubarItem>
								{/* <MenubarItem className="cursor-pointer"
									disabled={isExporting}
									onClick={exportPdf}
								>
									{isExporting ? (
										<>
											Exporting PDF... <FaSpinner className="h-4 w-4 ml-2 animate-spin" />
										</>
									) : (
										<>
											Export PDF
											<MenubarShortcut>
												<FaFileDownload className="h-4 w-4" />
											</MenubarShortcut>
										</>
									)}
								</MenubarItem> */}
								{areThereTablesinEditor(editor) && (
									<MenubarItem
										className="cursor-pointer"
										onClick={() => handleExportTables(editor)}
									>
									Export Tables
										<MenubarShortcut>
											<FaFileCsv className="h-4 w-4" />
										</MenubarShortcut>
									</MenubarItem>
								)}
							</MenubarContent>
						</MenubarMenu>
					</Menubar>
					<Separator orientation="vertical" />
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.undo()
							.run()}
						tooltip="Undo"
					>
						<FaUndo />
					</ToolTipedButton>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.redo()
							.run()}
						tooltip="Redo"
					>
						<FaRedo />
					</ToolTipedButton>
					<Select
						onValueChange={(value) => {
							// Skip if the same style is already applied
							if (value === "p" && editor.isActive("paragraph")) {
								return;
							}
							if (value !== "p" && editor.isActive("heading", { level: parseInt(value.charAt(1)) })) {
								return;
							}
							
							// Apply the style
							if (value === "p") {
								editor.chain().focus()
									.setParagraph()
									.run();
							} else {
								editor
									.chain()
									.focus()
									.toggleHeading({ level: parseInt(value.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6 })
									.run();
							}
						}}
						value={
							editor.isActive("heading", { level: 1 }) 
								? "h1" 
								: editor.isActive("heading", { level: 2 }) 
									? "h2" 
									: editor.isActive("heading", { level: 3 }) 
										? "h3" 
										: "p"
						}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Select heading level" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="p">Paragraph</SelectItem>
								<SelectItem value="h1">Heading 1</SelectItem>
								<SelectItem value="h2">Heading 2</SelectItem>
								<SelectItem value="h3">Heading 3</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.toggleMark("bold")
							.run()}
						tooltip="Bold"
						variant={editor.isActive("bold") ? "secondary" : "ghost"}
					>
						<FaBold className={`${editor.isActive("bold") ? "text-indigo-600" : ""}`} />
					</ToolTipedButton>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.toggleMark("italic")
							.run()}
						tooltip="Italic"
						variant={editor.isActive("italic") ? "secondary" : "ghost"}
					>
						<FaItalic className={`${editor.isActive("italic") ? "text-indigo-600" : ""}`} />
					</ToolTipedButton>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.toggleMark("underline")
							.run()}
						tooltip="Underline"
						variant={editor.isActive("underline") ? "secondary" : "ghost"}
					>
						<FaUnderline className={`${editor.isActive("underline") ? "text-indigo-600" : ""}`} />
					</ToolTipedButton>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.toggleMark("strike")
							.run()}
						tooltip="Strikethrough"
						variant={editor.isActive("strike") ? "secondary" : "ghost"}
					>
						<FaStrikethrough className={`${editor.isActive("strike") ? "text-indigo-600" : ""}`} />
					</ToolTipedButton>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.toggleMark("highlight")
							.run()}
						tooltip="Highlight"
						variant={editor.isActive("highlight") ? "secondary" : "ghost"}
					>
						<FaHighlighter className={`${editor.isActive("highlight") ? "text-indigo-600" : ""}`} />
					</ToolTipedButton>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.toggleBulletList()
							.run()}
						tooltip="Bullet List"
					>
						<FaListUl />
					</ToolTipedButton>
					<ToolTipedButton
						onClick={() => editor.chain().focus()
							.toggleOrderedList()
							.run()}
						tooltip="Ordered List"
					>
						<FaListOl />
					</ToolTipedButton>
					{/* FOnt family in turotail 2:09:08 */}
					{/* Multi color at 2:29:33 */}
					{/* Highlight 2:32:27 */}
					{/*  Link button 2:39:20 */}
					{/* ALign (left alighn, righ aliwgn, center align) line height 2:51:54 */}
					{/* FOnt size 3:00:20 */}

					{/* <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <FaCode />
        </Button> */}
					{/* <ToolTipedButton tooltip="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <FaCode />
        </ToolTipedButton> */}
					<Separator orientation="vertical" />
					<Popover>
						<PopoverTrigger>
							<ToolTipedButton onClick={() => {}} tooltip="Insert Table">
								<FaTable />
							</ToolTipedButton>
						</PopoverTrigger>
						<PopoverContent className="w-80">
							<div className="grid gap-4">
								<div className="space-y-2">
									<h4 className="font-medium leading-none">Insert Table</h4>
									<p className="text-sm text-muted-foreground">
										Set the number of rows and columns for your table.
									</p>
								</div>
								<div className="grid gap-2">
									<div className="grid grid-cols-3 items-center gap-4">
										<Label htmlFor="rows">Rows</Label>
										<Input
											className="col-span-2 h-8"
											id="rows"
											onChange={(e) => setTableRows(Number(e.target.value))}
											type="number"
											value={tableRows}
										/>
									</div>
									<div className="grid grid-cols-3 items-center gap-4">
										<Label htmlFor="columns">Columns</Label>
										<Input
											className="col-span-2 h-8"
											id="columns"
											onChange={(e) => setTableCols(Number(e.target.value))}
											type="number"
											value={tableCols}
										/>
									</div>
								</div>
								<Button
									onClick={() => {
										editor
											.chain()
											.focus()
											.insertTable({
												rows: tableRows,
												cols: tableCols,
												withHeaderRow: true,
											})
											.run();
									}}
								>
									Insert Table
								</Button>
							</div>
						</PopoverContent>
					</Popover>
					{/* <Separator orientation="vertical" />
        <Button variant="ghost" onClick={handleZoomOut}>
          <FaSearchMinus />
        </Button>
        <span className="mx-2">{zoomLevel}%</span>
        <Button variant="ghost" onClick={handleZoomIn}>
          <FaSearchPlus />
        </Button> */}
					{documentId && (
						<Dialog>
							<DialogTrigger asChild>
								<ToolTipedButton onClick={() => {}} tooltip="AI writer">
									<FaMagic />
								</ToolTipedButton>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[99vw] sm:h-[100vh] flex flex-col">
								<div className="flex-1 ">
									<AIEditorLayout
										chatTarget="editor"
										content={editor.getHTML()}
										folderId={documentId}
										folderName="Document Editor"
										onContentUpdate={onAIEditedContent}
									/>
								</div>
							</DialogContent>
						</Dialog>
					)}
					<Popover>
						<PopoverTrigger>
							<ToolTipedButton disabled={isUploading} tooltip="Insert Image">
								{isUploading ? (
									<FaSpinner className="animate-spin" />
								) : (
									<FaImage />
								)}
							</ToolTipedButton>
						</PopoverTrigger>
						<PopoverContent className="w-80">
							<div className="grid gap-4">
								<div className="space-y-2">
									<h4 className="font-medium leading-none">Insert Image</h4>
									<p className="text-sm text-muted-foreground">
										Upload an image or enter a URL.
									</p>
								</div>
								<div className="grid gap-2">
									<Input
										accept="image/*"
										id="imageUpload"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												handleImageUpload(file);
											}
										}}
										type="file"
									/>
									<div className="- or -" />
									<Input
										id="imageUrl"
										onChange={(e) => setImageUrl(e.target.value)}
										placeholder="Image URL"
										type="text"
										value={imageUrl}
									/>
								</div>
								<Button
									onClick={() => {
										if (imageUrl) {
											editor.chain().focus()
												.setImage({ src: imageUrl })
												.run();
											setImageUrl("");
										}
									}}
								>
									Insert Image from URL
								</Button>
							</div>
						</PopoverContent>
					</Popover>
					{/* <Separator orientation="vertical" /> */}
				</div>
				<div className="flex items-center gap-2">
					<div className="font-sm ">
						{saveStatus === SaveStatus.SAVED && (
							<span className="text-sm">Saved to Drive</span>
						)}
						{saveStatus === SaveStatus.SAVING && (
							<div className="flex items-center gap-2">
								<FaSpinner className="h-4 w-4 animate-spin" />
								<span className="text-sm">Saving...</span>
							</div>
						)}
					</div>
					{sessionToken && (
						<EmailModal
							editor={editor}
							sessionToken={sessionToken}
							subject={documentType}
						/>
					)}
				</div>
			</div>
			{fileName && (
				<div className="absolute top-[53px] bg-white left-2">
					<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-b-md border-x border-b">
						<FaFileAlt className="text-gray-500 h-3 w-3" />
						<input 
							className="text-xs text-gray-700 bg-transparent border-none outline-none hover:outline-none focus:outline-none hover:ring-1 hover:ring-gray-200 focus:ring-1 focus:ring-gray-300 rounded px-1 max-w-[200px] truncate"
							onBlur={handleFileNameInputBlur}
							onChange={(e) => setEditingFileName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									e.currentTarget.blur();
								}
							}}
							title={fileName}
							type="text"
							value={editingFileName}
						/>
					</div>
				</div>
			)}
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
						className={cn("px-2", buttonProps.className)}
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
