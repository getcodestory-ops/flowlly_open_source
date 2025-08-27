import React from "react";
import { 
	FaBold, 
	FaItalic, 
	FaUnderline, 
	FaStrikethrough, 
	FaHighlighter 
} from "react-icons/fa";
import { RxTriangleDown } from "react-icons/rx";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarShortcut,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { type Editor } from "@tiptap/react";
import { ToolTipedButton } from "../ToolBar";

interface TextFormattingProps {
	editor: Editor;
}

const TextFormatting: React.FC<TextFormattingProps> = ({ editor }) => {
	return (
		<Menubar className="bg-transparent border-none p-0 m-0 shadow-none">
			<MenubarMenu>
				<MenubarTrigger asChild>
					<ToolTipedButton onClick={() => {}} tooltip="Text Formatting">
						<div className="flex items-center gap-1">
							<FaBold className={`${editor.isActive("bold") ? "text-indigo-600" : ""}`} />
							<FaItalic className={`${editor.isActive("italic") ? "text-indigo-600" : ""}`} />
							<RxTriangleDown />
						</div>
					</ToolTipedButton>
				</MenubarTrigger>
				<MenubarContent>
					<MenubarItem 
						className="cursor-pointer"
						onClick={() => editor.chain().focus()
							.toggleMark("bold")
							.run()}
					>
						<FaBold className={`mr-2 ${editor.isActive("bold") ? "text-indigo-600" : ""}`} />
						Bold
						<MenubarShortcut>Ctrl+B</MenubarShortcut>
					</MenubarItem>
					<MenubarItem 
						className="cursor-pointer"
						onClick={() => editor.chain().focus()
							.toggleMark("italic")
							.run()}
					>
						<FaItalic className={`mr-2 ${editor.isActive("italic") ? "text-indigo-600" : ""}`} />
						Italic
						<MenubarShortcut>Ctrl+I</MenubarShortcut>
					</MenubarItem>
					<MenubarItem 
						className="cursor-pointer"
						onClick={() => editor.chain().focus()
							.toggleMark("underline")
							.run()}
					>
						<FaUnderline className={`mr-2 ${editor.isActive("underline") ? "text-indigo-600" : ""}`} />
						Underline
						<MenubarShortcut>Ctrl+U</MenubarShortcut>
					</MenubarItem>
					<MenubarItem 
						className="cursor-pointer"
						onClick={() => editor.chain().focus()
							.toggleMark("strike")
							.run()}
					>
						<FaStrikethrough className={`mr-2 ${editor.isActive("strike") ? "text-indigo-600" : ""}`} />
						Strikethrough
					</MenubarItem>
					<MenubarItem 
						className="cursor-pointer"
						onClick={() => editor.chain().focus()
							.toggleMark("highlight")
							.run()}
					>
						<FaHighlighter className={`mr-2 ${editor.isActive("highlight") ? "text-indigo-600" : ""}`} />
						Highlight
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
};

export default TextFormatting; 