import React, { useCallback, useState } from "react";
import { FaFileDownload, FaSpinner, FaFileAlt, FaFileCsv } from "react-icons/fa";
import { RxTriangleDown } from "react-icons/rx";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarShortcut,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { useToast } from "@/components/ui/use-toast";
import { type Editor } from "@tiptap/react";
import { handleExportTables, areThereTablesinEditor, printDocument } from "../utils";
import { ToolTipedButton } from "../ToolBar";

interface ExportToolsProps {
	editor: Editor;
	onShowSaveAsDialog: () => void;
}

const ExportTools: React.FC<ExportToolsProps> = ({ editor, onShowSaveAsDialog }) => {
	const { toast } = useToast();
	const [isPrinting, setIsPrinting] = useState(false);

	const printPreview = useCallback(() => {
		if (editor) {
			setIsPrinting(true);
			
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

	return (
		<Menubar className="bg-transparent border-none p-0 m-0 shadow-none">
			<MenubarMenu>
				<MenubarTrigger asChild>
					<ToolTipedButton onClick={() => {}} tooltip="Export">
						<FaFileDownload /> <RxTriangleDown />
					</ToolTipedButton>
				</MenubarTrigger>
				<MenubarContent>
					<MenubarItem 
						className="cursor-pointer"
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
						onClick={onShowSaveAsDialog}
					>
						Save As
						<MenubarShortcut>
							<FaFileAlt className="h-4 w-4" />
						</MenubarShortcut>
					</MenubarItem>
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
	);
};

export default ExportTools; 