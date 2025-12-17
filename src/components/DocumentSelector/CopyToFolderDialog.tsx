import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";

interface CopyToFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemsToCopy: { id: string; name: string }[];
	onCopy: (targetFolderId: string, folderName: string) => Promise<void>;
	isCopying?: boolean;
}

export const CopyToFolderDialog: React.FC<CopyToFolderDialogProps> = ({
	open,
	onOpenChange,
	itemsToCopy,
	onCopy,
	isCopying = false,
}) => {
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedFolderName, setSelectedFolderName] = useState<string>("");

	const handleFolderSelect = (folderId: string | null, folderName: string) => {
		setSelectedFolderId(folderId);
		setSelectedFolderName(folderName);
	};

	const handleCopy = async () => {
		if (selectedFolderId) {
			await onCopy(selectedFolderId, selectedFolderName);
			// Reset selection after copy
			setSelectedFolderId(null);
			setSelectedFolderName("");
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Reset selection when closing
			setSelectedFolderId(null);
			setSelectedFolderName("");
		}
		onOpenChange(newOpen);
	};

	const itemCount = itemsToCopy.length;
	const isSingleItem = itemCount === 1;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Copy className="h-5 w-5" />
						{isSingleItem
							? `Copy "${itemsToCopy[0]?.name}"`
							: `Copy ${itemCount} files`}
					</DialogTitle>
				</DialogHeader>

				<div className="py-2">
					<p className="text-sm text-gray-500 mb-4">
						Select a destination folder to copy {isSingleItem ? "this file" : "these files"} to.
					</p>
					
					<FolderSelector
						selectedFolderId={selectedFolderId}
						onFolderSelect={handleFolderSelect}
						hideLabel
					/>
				</div>

				<div className="flex justify-end gap-2 mt-4">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isCopying}
					>
						Cancel
					</Button>
					<Button
						onClick={handleCopy}
						disabled={!selectedFolderId || isCopying}
					>
						{isCopying ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Copying...
							</>
						) : (
							<>
								<Copy className="mr-2 h-4 w-4" />
								Copy {isSingleItem ? "File" : `${itemCount} Files`}
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
