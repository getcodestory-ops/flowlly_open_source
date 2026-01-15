import React from "react";
import { 
	FaBold, 
	FaItalic, 
	FaUnderline, 
	FaStrikethrough, 
	FaHighlighter,
	FaListUl,
	FaListOl,
	FaPalette,
	FaFont,
	FaTextHeight,
} from "react-icons/fa";
import { Type, Check } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type Editor } from "@tiptap/react";

interface FormatMenuProps {
	editor: Editor;
}

const colors = [
	{ color: "#000000", name: "Black" },
	{ color: "#dc2626", name: "Red" },
	{ color: "#ea580c", name: "Orange" },
	{ color: "#ca8a04", name: "Yellow" },
	{ color: "#16a34a", name: "Green" },
	{ color: "#2563eb", name: "Blue" },
	{ color: "#9333ea", name: "Purple" },
	{ color: "#c2410c", name: "Brown" },
	{ color: "#64748b", name: "Gray" },
	{ color: "#0891b2", name: "Cyan" },
	{ color: "#be123c", name: "Rose" },
	{ color: "#4338ca", name: "Indigo" },
];

const fontFamilies = [
	{ name: "Default", value: "default" },
	{ name: "Arial", value: "Arial, sans-serif" },
	{ name: "Helvetica", value: "Helvetica, sans-serif" },
	{ name: "Times New Roman", value: "Times New Roman, serif" },
	{ name: "Georgia", value: "Georgia, serif" },
	{ name: "Courier New", value: "Courier New, monospace" },
	{ name: "Verdana", value: "Verdana, sans-serif" },
	{ name: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
];

const fontSizes = [
	{ name: "Default", value: "default" },
	{ name: "12px", value: "12px" },
	{ name: "14px", value: "14px" },
	{ name: "16px", value: "16px" },
	{ name: "18px", value: "18px" },
	{ name: "24px", value: "24px" },
	{ name: "32px", value: "32px" },
];

const FormatMenu: React.FC<FormatMenuProps> = ({ editor }) => {
	const hasActiveFormat = 
		editor.isActive("bold") || 
		editor.isActive("italic") || 
		editor.isActive("underline") ||
		editor.isActive("strike") ||
		editor.isActive("highlight") ||
		editor.isActive("bulletList") ||
		editor.isActive("orderedList");

	const getCurrentFontFamily = () => {
		const attrs = editor.getAttributes("textStyle");
		return attrs.fontFamily || "default";
	};

	const getCurrentFontSize = () => {
		const attrs = editor.getAttributes("textStyle");
		return attrs.fontSize || "default";
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className={`px-2 py-1 h-8 hover:bg-gray-100 gap-1 ${hasActiveFormat ? "bg-indigo-50" : ""}`}
					size="sm"
					variant="ghost"
				>
					<Type className="h-4 w-4" />
					<span className="text-xs">Format</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				{/* Font Section */}
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Font</div>
				
				{/* Font Family Sub-menu */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="cursor-pointer">
						<FaFont className="mr-2 h-3 w-3" />
						Font Family
						<span className="ml-auto text-xs text-gray-400 truncate max-w-[80px]">
							{fontFamilies.find(f => f.value === getCurrentFontFamily())?.name || "Default"}
						</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-48">
						{fontFamilies.map((font) => (
							<DropdownMenuItem
								key={font.value}
								className="cursor-pointer"
								onClick={() => {
									if (font.value === "default") {
										editor.chain().focus().unsetFontFamily().run();
									} else {
										editor.chain().focus().setFontFamily(font.value).run();
									}
								}}
							>
								<span style={{ fontFamily: font.value === "default" ? undefined : font.value }}>
									{font.name}
								</span>
								{getCurrentFontFamily() === font.value && (
									<Check className="ml-auto h-4 w-4 text-indigo-600" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				{/* Font Size Sub-menu */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="cursor-pointer">
						<FaTextHeight className="mr-2 h-3 w-3" />
						Font Size
						<span className="ml-auto text-xs text-gray-400">
							{fontSizes.find(s => s.value === getCurrentFontSize())?.name || "Default"}
						</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-32">
						{fontSizes.map((size) => (
							<DropdownMenuItem
								key={size.value}
								className="cursor-pointer"
								onClick={() => {
									if (size.value === "default") {
										editor.chain().focus().unsetFontSize().run();
									} else {
										editor.chain().focus().setFontSize(size.value).run();
									}
								}}
							>
								{size.name}
								{getCurrentFontSize() === size.value && (
									<Check className="ml-auto h-4 w-4 text-indigo-600" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				{/* Text Style Section */}
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Style</div>
				<DropdownMenuItem 
					className="cursor-pointer"
					onClick={() => editor.chain().focus().toggleMark("bold").run()}
				>
					<FaBold className={`mr-2 h-3 w-3 ${editor.isActive("bold") ? "text-indigo-600" : ""}`} />
					Bold
					<span className="ml-auto text-xs text-gray-400">Ctrl+B</span>
				</DropdownMenuItem>
				<DropdownMenuItem 
					className="cursor-pointer"
					onClick={() => editor.chain().focus().toggleMark("italic").run()}
				>
					<FaItalic className={`mr-2 h-3 w-3 ${editor.isActive("italic") ? "text-indigo-600" : ""}`} />
					Italic
					<span className="ml-auto text-xs text-gray-400">Ctrl+I</span>
				</DropdownMenuItem>
				<DropdownMenuItem 
					className="cursor-pointer"
					onClick={() => editor.chain().focus().toggleMark("underline").run()}
				>
					<FaUnderline className={`mr-2 h-3 w-3 ${editor.isActive("underline") ? "text-indigo-600" : ""}`} />
					Underline
					<span className="ml-auto text-xs text-gray-400">Ctrl+U</span>
				</DropdownMenuItem>
				<DropdownMenuItem 
					className="cursor-pointer"
					onClick={() => editor.chain().focus().toggleMark("strike").run()}
				>
					<FaStrikethrough className={`mr-2 h-3 w-3 ${editor.isActive("strike") ? "text-indigo-600" : ""}`} />
					Strikethrough
				</DropdownMenuItem>
				<DropdownMenuItem 
					className="cursor-pointer"
					onClick={() => editor.chain().focus().toggleMark("highlight").run()}
				>
					<FaHighlighter className={`mr-2 h-3 w-3 ${editor.isActive("highlight") ? "text-indigo-600" : ""}`} />
					Highlight
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Text Color Sub-menu */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="cursor-pointer">
						<FaPalette className="mr-2 h-3 w-3" />
						Text Color
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-48">
						<div className="grid grid-cols-4 gap-1 p-2">
							{colors.map(({ color, name }) => (
								<button
									className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
									key={color}
									onClick={() => {
										editor.chain().focus().unsetColor().setColor(color).run();
									}}
									style={{ backgroundColor: color }}
									title={name}
								/>
							))}
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem 
							className="cursor-pointer text-xs"
							onClick={() => editor.chain().focus().unsetColor().run()}
						>
							Remove color
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				{/* Lists Section */}
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Lists</div>
				<DropdownMenuItem 
					className="cursor-pointer"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<FaListUl className={`mr-2 h-3 w-3 ${editor.isActive("bulletList") ? "text-indigo-600" : ""}`} />
					Bullet List
				</DropdownMenuItem>
				<DropdownMenuItem 
					className="cursor-pointer"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<FaListOl className={`mr-2 h-3 w-3 ${editor.isActive("orderedList") ? "text-indigo-600" : ""}`} />
					Numbered List
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default FormatMenu;
