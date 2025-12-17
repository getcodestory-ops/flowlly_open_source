import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { RenameDialogProps } from "./types";

export const RenameDialog: React.FC<RenameDialogProps> = ({
	open,
	onOpenChange,
	currentName,
	itemType,
	onConfirm,
	isRenaming = false,
}) => {
	const [newName, setNewName] = useState(currentName);

	// Reset name when dialog opens with new currentName
	useEffect(() => {
		if (open) {
			setNewName(currentName);
		}
	}, [open, currentName]);

	const handleConfirm = () => {
		const trimmedName = newName.trim();
		if (trimmedName && trimmedName !== currentName) {
			onConfirm(trimmedName);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !isRenaming) {
			e.preventDefault();
			handleConfirm();
		}
	};

	const isValidName = newName.trim().length > 0 && newName.trim() !== currentName;

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						Rename {itemType === "folder" ? "Folder" : "File"}
					</DialogTitle>
					<DialogDescription>
						Enter a new name for this {itemType}.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Name</Label>
						<Input
							autoFocus
							disabled={isRenaming}
							id="name"
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={`Enter ${itemType} name`}
							value={newName}
						/>
					</div>
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						disabled={isRenaming}
						onClick={() => onOpenChange(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={isRenaming || !isValidName}
						onClick={handleConfirm}
					>
						{isRenaming ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Renaming...
							</>
						) : (
							"Rename"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

