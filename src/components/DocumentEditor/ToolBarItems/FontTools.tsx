import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type Editor } from "@tiptap/react";

interface FontToolsProps {
	editor: Editor;
}

const FontTools: React.FC<FontToolsProps> = ({ editor }) => {
	const fontFamilies = [
		{ name: "Default", value: "default", display: "Font" },
		{ name: "Arial", value: "Arial, sans-serif", display: "Arial" },
		{ name: "Helvetica", value: "Helvetica, sans-serif", display: "Helvetica" },
		{ name: "Times New Roman", value: "Times New Roman, serif", display: "Times" },
		{ name: "Georgia", value: "Georgia, serif", display: "Georgia" },
		{ name: "Courier New", value: "Courier New, monospace", display: "Courier" },
		{ name: "Verdana", value: "Verdana, sans-serif", display: "Verdana" },
		{ name: "Trebuchet MS", value: "Trebuchet MS, sans-serif", display: "Trebuchet" },
		{ name: "Impact", value: "Impact, sans-serif", display: "Impact" },
		{ name: "Comic Sans MS", value: "Comic Sans MS, cursive", display: "Comic Sans" },
	];

	const fontSizes = [
		{ name: "Default", value: "default", display: "Size" },
		{ name: "12px", value: "12px", display: "12" },
		{ name: "14px", value: "14px", display: "14" },
		{ name: "16px", value: "16px", display: "16" },
		{ name: "18px", value: "18px", display: "18" },
		{ name: "24px", value: "24px", display: "24" },
		{ name: "32px", value: "32px", display: "32" },
	];

	const getCurrentFontFamily = () => {
		const attrs = editor.getAttributes("textStyle");
		return attrs.fontFamily || "default";
	};

	const getCurrentFontSize = () => {
		const attrs = editor.getAttributes("textStyle");
		return attrs.fontSize || "default";
	};

	const getCurrentFontFamilyDisplay = () => {
		const current = getCurrentFontFamily();
		const found = fontFamilies.find((f) => f.value === current);
		return found?.display || "Font";
	};

	const getCurrentFontSizeDisplay = () => {
		const current = getCurrentFontSize();
		const found = fontSizes.find((s) => s.value === current);
		return found?.display || "Size";
	};

	return (
		<div className="flex items-center gap-1">
			{/* Font Family Selector */}
			<Select
				onValueChange={(value) => {
					if (value === "default") {
						editor.chain()
							.focus()
							.unsetFontFamily()
							.run();
					} else {
						editor.chain()
							.focus()
							.setFontFamily(value)
							.run();
					}
				}}
				value={getCurrentFontFamily()}
			>
				<SelectTrigger 
					className="h-8 w-20 text-xs px-2 border-0 bg-transparent hover:bg-gray-100 focus:ring-1"
				>
					<SelectValue>
						{getCurrentFontFamilyDisplay()}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{fontFamilies.map((font) => (
						<SelectItem 
							className="text-sm" 
							key={font.value} 
							value={font.value}
						>
							<span 
								className="truncate"
								style={{ 
									fontFamily: font.value === "default" ? undefined : font.value,
								}}
							>
								{font.name}
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				onValueChange={(value) => {
					if (value === "default") {
						editor.chain()
							.focus()
							.unsetFontSize()
							.run();
					} else {
						editor.chain()
							.focus()
							.setFontSize(value)
							.run();
					}
				}}
				value={getCurrentFontSize()}
			>
				<SelectTrigger 
					className="h-8 w-16 text-xs px-2 border-0 bg-transparent hover:bg-gray-100 focus:ring-1"
				>
					<SelectValue>{getCurrentFontSizeDisplay()}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{fontSizes.map((size) => (
						<SelectItem 
							className="text-sm" 
							key={size.value} 
							value={size.value}
						>
							{size.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default FontTools; 