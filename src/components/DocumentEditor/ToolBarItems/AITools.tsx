import React from "react";
import { FaMagic } from "react-icons/fa";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import { type Editor } from "@tiptap/react";
import AIEditorLayout from "../AIEditor.tsx/AIEditorLayout";
import { ToolTipedButton } from "../ToolBar";

interface AIToolsProps {
	editor: Editor;
	documentId?: string;
	onAIEditedContent?: (content: string) => void;
}

const AITools: React.FC<AIToolsProps> = ({ editor, documentId, onAIEditedContent }) => {
	if (!documentId) {
		return null;
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<ToolTipedButton onClick={() => {}} tooltip="AI writer">
					<FaMagic />
				</ToolTipedButton>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[99vw] sm:h-[100vh] flex flex-col">
				<div className="flex-1">
					<AIEditorLayout
						chatTarget="editor"
						content={editor.getHTML()}
						folderId={documentId}
						folderName="Document Editor"
						onContentUpdate={onAIEditedContent}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AITools; 