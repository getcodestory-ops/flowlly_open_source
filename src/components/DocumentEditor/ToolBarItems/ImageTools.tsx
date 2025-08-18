import React, { useState } from "react";
import { FaSpinner, FaImage, FaExpand, FaCompress, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { type Editor } from "@tiptap/react";
import { uploadImageForEditor } from "@/api/folderRoutes";
import { useStore } from "@/utils/store";


interface ImageToolsProps {
	editor: Editor;
}

const ImageTools: React.FC<ImageToolsProps> = ({ editor }) => {
	const { toast } = useToast();
	const sessionToken = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const [isUploading, setIsUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [imageWidth, setImageWidth] = useState([300]);
	const [isImageSelected, setIsImageSelected] = useState(false);

	// Update image selection state when editor updates
	React.useEffect(() => {
		if (!editor) return;

		const updateImageState = (): void => {
			try {
				const imageSelected = editor.isActive("image");
				setIsImageSelected(imageSelected);
			} catch (error) {
				console.warn("Error checking image state:", error);
				setIsImageSelected(false);
			}
		};

		// Initial check
		updateImageState();

		// Listen for editor updates
		editor.on("selectionUpdate", updateImageState);
		editor.on("transaction", updateImageState);

		return () => {
			editor.off("selectionUpdate", updateImageState);
			editor.off("transaction", updateImageState);
		};
	}, [editor]);

	const handleImageUpload = async(file: File): Promise<void> => {
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
			setIsUploading(false);
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

	const imageActions = [
		{
			label: "Align Left",
			icon: <FaAlignLeft className="w-3 h-3" />,
			action: () => editor.chain().focus()
				.setTextAlign("left")
				.run(),
		},
		{
			label: "Align Center", 
			icon: <FaAlignCenter className="w-3 h-3" />,
			action: () => editor.chain().focus()
				.setTextAlign("center")
				.run(),
		},
		{
			label: "Align Right",
			icon: <FaAlignRight className="w-3 h-3" />,
			action: () => editor.chain().focus()
				.setTextAlign("right")
				.run(),
		},
		{
			label: "Small Size",
			icon: <FaCompress className="w-3 h-3" />,
			action: () => editor.chain().focus()
				.updateAttributes("image", { width: 200 })
				.run(),
		},
		{
			label: "Medium Size",
			icon: <FaImage className="w-3 h-3" />,
			action: () => editor.chain().focus()
				.updateAttributes("image", { width: 400 })
				.run(),
		},
		{
			label: "Large Size",
			icon: <FaExpand className="w-3 h-3" />,
			action: () => editor.chain().focus()
				.updateAttributes("image", { width: 600 })
				.run(),
		},
	];

	return (
		<div className="flex items-center gap-1">
			{/* Image Actions Dropdown - only show when image is selected */}
			{isImageSelected && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className="px-1.5 py-1 h-8 hover:bg-gray-100 active:bg-gray-200 bg-green-50 border border-green-200"
							size="sm"
							title="Image Actions"
							variant="ghost"
						>
							<FaImage className="text-green-600" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56">
						{imageActions.map((action, index) => (
							<React.Fragment key={action.label}>
								{index === 3 && <DropdownMenuSeparator />}
								<DropdownMenuItem onClick={action.action}>
									<div className="flex items-center gap-2">
										{action.icon}
										{action.label}
									</div>
								</DropdownMenuItem>
							</React.Fragment>
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
			)}
			{/* Insert Image Popover - always available */}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						className={`px-1.5 py-1 h-8 hover:bg-gray-100 active:bg-gray-200 ${isImageSelected ? "opacity-60" : ""}`}
						disabled={isUploading}
						size="sm"
						title="Insert Image"
						variant="ghost"
					>
						{isUploading ? (
							<FaSpinner className="animate-spin" />
						) : (
							<FaImage />
						)}
					</Button>
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
							<div className="text-center text-sm text-muted-foreground py-2">or</div>
							<Input
								id="imageUrl"
								onChange={(e) => setImageUrl(e.target.value)}
								placeholder="Image URL"
								type="text"
								value={imageUrl}
							/>
						</div>
						<Button
							disabled={!imageUrl}
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
		</div>
	);
};

export default ImageTools; 