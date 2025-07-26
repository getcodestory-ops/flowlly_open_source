import React, { useState } from "react";
import { FaSpinner, FaImage } from "react-icons/fa";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { type Editor } from "@tiptap/react";
import { uploadImageForEditor } from "@/api/folderRoutes";
import { useStore } from "@/utils/store";
import { ToolTipedButton } from "../ToolBar";

interface ImageToolsProps {
	editor: Editor;
}

const ImageTools: React.FC<ImageToolsProps> = ({ editor }) => {
	const { toast } = useToast();
	const sessionToken = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const [isUploading, setIsUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState("");

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

	return (
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
	);
};

export default ImageTools; 