import React, { useState, useEffect } from "react";
import { type Editor } from "@tiptap/react";
import { MessageCircle } from "lucide-react";
import { ToolTipedButton } from "../ToolBar";

interface CommentToolsProps {
  editor: Editor;
  onCreateComment?: () => void;
}

const CommentTools: React.FC<CommentToolsProps> = ({ 
	editor, 
	onCreateComment, 
}) => {
	const [isDisabled, setIsDisabled] = useState(true);

	// Listen to editor selection changes
	useEffect(() => {
		const updateSelectionState = () => {
			setIsDisabled(editor.state.selection.empty);
		};

		// Update on mount
		updateSelectionState();

		// Listen to editor updates
		editor.on("selectionUpdate", updateSelectionState);
		editor.on("update", updateSelectionState);

		return () => {
			editor.off("selectionUpdate", updateSelectionState);
			editor.off("update", updateSelectionState);
		};
	}, [editor]);

	const handleCreateComment = () => {
		// eslint-disable-next-line no-console
		console.log("Comment button clicked!");
    
		if (editor.state.selection.empty) {
			// eslint-disable-next-line no-console
			console.log("No text selected");
			return;
		}
    
		// eslint-disable-next-line no-console
		console.log("Creating comment with onCreateComment:", !!onCreateComment);
    
		if (onCreateComment) {
			onCreateComment();
		} else {
			// eslint-disable-next-line no-console
			console.log("Using fallback comment creation");
			// This fallback is not needed now since we handle it in ContentEditor
		}
	};

	return (
		<ToolTipedButton
			className={isDisabled ? "opacity-50" : ""}
			disabled={isDisabled}
			onClick={handleCreateComment}
			tooltip={
				isDisabled 
					? "Select text to add a comment" 
					: "Add comment to selected text"
			}
			variant={isDisabled ? "ghost" : "ghost"}
		>
			<MessageCircle className="h-4 w-4" />
		</ToolTipedButton>
	);
};

export default CommentTools; 