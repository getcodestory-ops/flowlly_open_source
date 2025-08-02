import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaExclamationTriangle } from "react-icons/fa";

interface UnsavedChangesDialogProps {
	isOpen: boolean;
	onSave: () => void;
	onDiscard: () => void;
	onCancel: () => void;
	isSaving?: boolean;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
	isOpen,
	onSave,
	onDiscard,
	onCancel,
	isSaving = false,
}) => {
	return (
		<Dialog onOpenChange={() => !isSaving && onCancel()} open={isOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FaExclamationTriangle className="h-5 w-5 text-orange-500" />
						Unsaved Changes
					</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p className="text-sm text-gray-600">
						You have unsaved changes that will be lost if you continue. 
						What would you like to do?
					</p>
				</div>
				<DialogFooter className="flex gap-2">
					<Button
						disabled={isSaving}
						onClick={onCancel}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={isSaving}
						onClick={onDiscard}
						variant="destructive"
					>
						Discard Changes
					</Button>
					<Button
						className="bg-blue-600 hover:bg-blue-700"
						disabled={isSaving}
						onClick={onSave}
					>
						{isSaving ? "Saving..." : "Save & Continue"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UnsavedChangesDialog; 