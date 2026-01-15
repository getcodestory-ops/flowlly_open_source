import React, { useState } from "react";
import { FaTable, FaImage, FaSpinner, FaPlus } from "react-icons/fa";
import { Plus } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { type Editor } from "@tiptap/react";
import { uploadImageForEditor } from "@/api/folderRoutes";
import { useStore } from "@/utils/store";

interface InsertMenuProps {
	editor: Editor;
}

const InsertMenu: React.FC<InsertMenuProps> = ({ editor }) => {
	const { toast } = useToast();
	const sessionToken = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	
	const [showTableDialog, setShowTableDialog] = useState(false);
	const [showImageDialog, setShowImageDialog] = useState(false);
	const [tableRows, setTableRows] = useState(3);
	const [tableCols, setTableCols] = useState(3);
	const [isUploading, setIsUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState("");

	const insertTable = (): void => {
		editor
			.chain()
			.focus()
			.insertTable({
				rows: tableRows,
				cols: tableCols,
				withHeaderRow: true,
			})
			.run();
		setShowTableDialog(false);
	};

	const handleImageUpload = async (file: File): Promise<void> => {
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
				editor.chain().focus().setImage({ src: result.url }).run();
				toast({
					title: "Success",
					description: "Image uploaded successfully.",
				});
			}
			setShowImageDialog(false);
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

	const insertImageFromUrl = (): void => {
		if (imageUrl) {
			editor.chain().focus().setImage({ src: imageUrl }).run();
			setImageUrl("");
			setShowImageDialog(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="px-2 py-1 h-8 hover:bg-gray-100 gap-1"
						size="sm"
						variant="ghost"
					>
						<Plus className="h-4 w-4" />
						<span className="text-xs">Insert</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-48">
					<DropdownMenuItem 
						className="cursor-pointer"
						onClick={() => setShowTableDialog(true)}
					>
						<FaTable className="mr-2 h-3 w-3" />
						Table
					</DropdownMenuItem>
					<DropdownMenuItem 
						className="cursor-pointer"
						onClick={() => setShowImageDialog(true)}
					>
						<FaImage className="mr-2 h-3 w-3" />
						Image
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Table Dialog */}
			<Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
				<DialogContent className="sm:max-w-[350px]">
					<DialogHeader>
						<DialogTitle>Insert Table</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="rows" className="text-right">Rows</Label>
							<Input
								id="rows"
								type="number"
								min="1"
								max="20"
								value={tableRows}
								onChange={(e) => setTableRows(Number(e.target.value))}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="columns" className="text-right">Columns</Label>
							<Input
								id="columns"
								type="number"
								min="1"
								max="10"
								value={tableCols}
								onChange={(e) => setTableCols(Number(e.target.value))}
								className="col-span-3"
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<Button onClick={insertTable}>Insert Table</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Image Dialog */}
			<Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Insert Image</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label>Upload from computer</Label>
							<Input
								type="file"
								accept="image/*"
								disabled={isUploading}
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										handleImageUpload(file);
									}
								}}
							/>
						</div>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-2 text-gray-500">or</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Image URL</Label>
							<Input
								type="text"
								placeholder="https://example.com/image.jpg"
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setShowImageDialog(false)}>
							Cancel
						</Button>
						<Button onClick={insertImageFromUrl} disabled={!imageUrl || isUploading}>
							{isUploading ? <FaSpinner className="animate-spin mr-2" /> : null}
							Insert
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default InsertMenu;
