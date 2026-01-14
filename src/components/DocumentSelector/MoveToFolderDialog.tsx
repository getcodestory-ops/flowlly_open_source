import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderInput, Loader2 } from "lucide-react";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";

interface MoveToFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemsToMove: { id: string; name: string }[];
	onMove: (targetFolderId: string, folderName: string) => Promise<void>;
	isMoving?: boolean;
	currentFolderId?: string;
}

export const MoveToFolderDialog: React.FC<MoveToFolderDialogProps> = ({
	open,
	onOpenChange,
	itemsToMove,
	onMove,
	isMoving = false,
	currentFolderId,
}) => {
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedFolderName, setSelectedFolderName] = useState<string>("");

	const handleFolderSelect = (folderId: string | null, folderName: string) => {
		setSelectedFolderId(folderId);
		setSelectedFolderName(folderName);
	};

	const handleMove = async () => {
		if (selectedFolderId) {
			await onMove(selectedFolderId, selectedFolderName);
			// Reset selection after move
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

	const itemCount = itemsToMove.length;
	const isSingleItem = itemCount === 1;

	// Prevent moving to the same folder
	const isSameFolder = selectedFolderId === currentFolderId;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FolderInput className="h-5 w-5" />
						{isSingleItem
							? `Move "${itemsToMove[0]?.name}"`
							: `Move ${itemCount} files`}
					</DialogTitle>
				</DialogHeader>

				<div className="py-2">
					<p className="text-sm text-gray-500 mb-4">
						Select a destination folder to move {isSingleItem ? "this file" : "these files"} to.
					</p>
					
					<FolderSelector
						selectedFolderId={selectedFolderId}
						onFolderSelect={handleFolderSelect}
						hideLabel
					/>

					{isSameFolder && selectedFolderId && (
						<p className="text-sm text-amber-600 mt-2">
							Files are already in this folder. Please select a different folder.
						</p>
					)}
				</div>

				<div className="flex justify-end gap-2 mt-4">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isMoving}
					>
						Cancel
					</Button>
					<Button
						onClick={handleMove}
						disabled={!selectedFolderId || isMoving || isSameFolder}
					>
						{isMoving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Moving...
							</>
						) : (
							<>
								<FolderInput className="mr-2 h-4 w-4" />
								Move {isSingleItem ? "File" : `${itemCount} Files`}
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
