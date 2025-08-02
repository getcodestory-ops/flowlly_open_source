import React from "react";
import { FaUndo, FaRedo } from "react-icons/fa";
import { type Editor } from "@tiptap/react";
import { ToolTipedButton } from "../ToolBar";

interface UndoRedoToolsProps {
	editor: Editor;
}

const UndoRedoTools: React.FC<UndoRedoToolsProps> = ({ editor }) => {
	return (
		<>
			<ToolTipedButton
				onClick={() => editor.chain().focus()
					.undo()
					.run()}
				tooltip="Undo"
			>
				<FaUndo />
			</ToolTipedButton>
			<ToolTipedButton
				onClick={() => editor.chain().focus()
					.redo()
					.run()}
				tooltip="Redo"
			>
				<FaRedo />
			</ToolTipedButton>
		</>
	);
};

export default UndoRedoTools; 