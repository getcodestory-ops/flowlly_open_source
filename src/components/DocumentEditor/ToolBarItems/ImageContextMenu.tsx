import React, { useState, useEffect } from "react";
import { FaImage, FaExpand, FaCompress, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { type Editor } from "@tiptap/react";

interface ImageContextMenuProps {
	editor: Editor;
}

const ImageContextMenu: React.FC<ImageContextMenuProps> = ({ editor }) => {
	const [isImageSelected, setIsImageSelected] = useState(false);
	const [imageWidth, setImageWidth] = useState([300]);

	useEffect(() => {
		if (!editor) return;

		const updateImageState = (): void => {
			try {
				setIsImageSelected(editor.isActive("image"));
			} catch (error) {
				setIsImageSelected(false);
			}
		};

		updateImageState();
		editor.on("selectionUpdate", updateImageState);
		editor.on("transaction", updateImageState);

		return () => {
			editor.off("selectionUpdate", updateImageState);
			editor.off("transaction", updateImageState);
		};
	}, [editor]);

	const imageActions = [
		{
			label: "Align Left",
			icon: <FaAlignLeft className="w-3 h-3" />,
			action: () => editor.chain().focus().setTextAlign("left").run(),
		},
		{
			label: "Align Center", 
			icon: <FaAlignCenter className="w-3 h-3" />,
			action: () => editor.chain().focus().setTextAlign("center").run(),
		},
		{
			label: "Align Right",
			icon: <FaAlignRight className="w-3 h-3" />,
			action: () => editor.chain().focus().setTextAlign("right").run(),
		},
		{
			label: "Small (200px)",
			icon: <FaCompress className="w-3 h-3" />,
			action: () => editor.chain().focus().updateAttributes("image", { width: 200 }).run(),
		},
		{
			label: "Medium (400px)",
			icon: <FaImage className="w-3 h-3" />,
			action: () => editor.chain().focus().updateAttributes("image", { width: 400 }).run(),
		},
		{
			label: "Large (600px)",
			icon: <FaExpand className="w-3 h-3" />,
			action: () => editor.chain().focus().updateAttributes("image", { width: 600 }).run(),
		},
	];

	// Only render when an image is selected
	if (!isImageSelected) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="px-2 py-1 h-8 hover:bg-green-100 bg-green-50 border border-green-200 gap-1"
					size="sm"
					variant="ghost"
				>
					<FaImage className="h-3.5 w-3.5 text-green-600" />
					<span className="text-xs text-green-700">Image</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Alignment</div>
				{imageActions.slice(0, 3).map((action) => (
					<DropdownMenuItem
						key={action.label}
						onClick={action.action}
					>
						<div className="flex items-center gap-2">
							{action.icon}
							{action.label}
						</div>
					</DropdownMenuItem>
				))}
				
				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Size</div>
				{imageActions.slice(3, 6).map((action) => (
					<DropdownMenuItem
						key={action.label}
						onClick={action.action}
					>
						<div className="flex items-center gap-2">
							{action.icon}
							{action.label}
						</div>
					</DropdownMenuItem>
				))}
				
				<DropdownMenuSeparator />
				<div className="px-2 py-2">
					<Label className="text-xs font-medium">Custom Width</Label>
					<div className="mt-2">
						<Slider
							className="w-full"
							max={800}
							min={100}
							onValueChange={(value) => {
								setImageWidth(value);
								try {
									editor.chain().focus()
										.updateAttributes("image", { width: value[0] })
										.run();
								} catch (error) {
									console.warn("Error updating image width:", error);
								}
							}}
							step={10}
							value={imageWidth}
						/>
						<div className="flex justify-between text-xs text-muted-foreground mt-1">
							<span>100px</span>
							<span>{imageWidth[0]}px</span>
							<span>800px</span>
						</div>
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ImageContextMenu;
