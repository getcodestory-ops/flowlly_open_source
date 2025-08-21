import React from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { type Editor } from "@tiptap/react";
import { ToolTipedButton } from "../ToolBar";

interface ColorToolsProps {
	editor: Editor;
}

const ColorTools: React.FC<ColorToolsProps> = ({ editor }) => {
	return (
		<Popover>
			<PopoverTrigger>
				<ToolTipedButton onClick={() => {}} tooltip="Text Color">
					<div className="flex items-center gap-1">
						<div 
							className="w-4 h-4 rounded border border-gray-300" 
							style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }}
						/>
						<span className="text-xs">A</span>
					</div>
				</ToolTipedButton>
			</PopoverTrigger>
			<PopoverContent className="w-64">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Text Color</h4>
						<p className="text-sm text-muted-foreground">
							Choose a color for the selected text.
						</p>
					</div>
					<div className="grid grid-cols-6 gap-2">
						{[
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
						].map(({ color, name }) => (
							<button
								className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
								key={color}
								onClick={() => {
									// First unset any existing color, then set the new color
									editor.chain()
										.focus()
										.unsetColor()
										.setColor(color)
										.run();
								}}
								style={{ backgroundColor: color }}
								title={name}
							/>
						))}
					</div>
					<button
						className="text-sm text-gray-600 hover:text-gray-800 underline"
						onClick={() => {
							editor.chain()
								.focus()
								.unsetColor()
								.run();
						}}
					>
						Remove color
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ColorTools; 