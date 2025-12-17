import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { DeleteConfirmDialogProps } from "./types";

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
	open,
	onOpenChange,
	itemName,
	itemType,
	onConfirm,
	isDeleting = false,
}) => {
	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-red-500" />
						Delete {itemType === "folder" ? "Folder" : "File"}
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete{" "}
						<span className="font-medium text-gray-900">{itemName}</span>?
						{itemType === "folder" && (
							<span className="block mt-2 text-amber-600">
								This will also delete all files and subfolders inside this folder.
							</span>
						)}
						<span className="block mt-2">This action cannot be undone.</span>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						disabled={isDeleting}
						onClick={() => onOpenChange(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={isDeleting}
						onClick={handleConfirm}
						variant="destructive"
					>
						{isDeleting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

