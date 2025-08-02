import React from "react";
import { FaSave, FaSpinner } from "react-icons/fa";
import { type Editor } from "@tiptap/react";
import { ToolTipedButton } from "../ToolBar";

export enum SaveStatus {
	SAVED = "Saved",
	SAVING = "Saving",
	UNSAVED = "Unsaved",
	ERROR = "Error",
}

interface SaveButtonProps {
	editor: Editor;
	saveStatus: SaveStatus;
	onSave: () => void;
	hasUnsavedChanges: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ 
	editor, 
	saveStatus, 
	onSave, 
	hasUnsavedChanges, 
}) => {
	const getButtonVariant = () => {
		if (hasUnsavedChanges) return "default";
		return "ghost";
	};

	const getTooltipText = () => {
		switch (saveStatus) {
			case SaveStatus.SAVING:
				return "Saving...";
			case SaveStatus.SAVED:
				return "Document saved";
			case SaveStatus.UNSAVED:
				return "Save document (Ctrl+S)";
			case SaveStatus.ERROR:
				return "Failed to save - click to retry";
			default:
				return "Save document";
		}
	};

	const getIcon = () => {
		if (saveStatus === SaveStatus.SAVING) {
			return <FaSpinner className="h-4 w-4 animate-spin" />;
		}
		return <FaSave className="h-4 w-4" />;
	};

	return (
		<div className="flex items-center gap-2">
			<ToolTipedButton
				className={hasUnsavedChanges ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
				disabled={saveStatus === SaveStatus.SAVING}
				onClick={onSave}
				tooltip={getTooltipText()}
				variant={getButtonVariant()}
			>
				{getIcon()}
			</ToolTipedButton>
			{hasUnsavedChanges && (
				<span className="text-xs text-orange-600 font-medium">
					Unsaved changes
				</span>
			)}
		</div>
	);
};

export default SaveButton; 