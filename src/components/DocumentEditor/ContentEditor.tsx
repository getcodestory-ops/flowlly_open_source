import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderLine from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Toolbar from "./ToolBar";
import { HoverExtension } from "./extensions/HoverExtension";
import { DiffStyleExtension } from "./extensions/DiffStyleExtension";
import ReactChartDisplayExtension from "./extensions/ReactChartDisplayExtension";
import Image from "@tiptap/extension-image";
import EditorProvider from "./EditorProvider";
interface EditorBlockProps {
  content: string | any;
  setContent?: (_: string) => void;
  saveFunction?: (_: string) => void;
  documentType?: string;
  documentId?: string;
  documentName?: string;
  includeToolbar?: boolean;
}

const ContentEditor = ({
	content,
	setContent,
	saveFunction,
	documentType = "Minutes of the meeting",
	documentId,
	documentName,
}: EditorBlockProps): React.ReactNode => {
	const editorInstance = useEditor({
		extensions: [
			StarterKit,
			Markdown.configure({
				html: true,
			}),
			UnderLine,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Table.configure({
				resizable: true,
			}),
			Image.configure({
				allowBase64: true,
				inline: true,
			}),
			TableRow,
			TableHeader,
			TableCell,
			HoverExtension,
			DiffStyleExtension,
		],
		editorProps: {
			attributes: {
				class: "focus:outline-none",
			},
		},
		content: content || "",
		immediatelyRender: false,

	});

	useEffect(() => {
		if (editorInstance && content !== undefined) {
			editorInstance.commands.setContent(content);
		}
	}, [content, editorInstance]);

	const handleAIEditedContent = (newAIContent: string): void => {
		if (editorInstance) {
			editorInstance.commands.setContent(newAIContent);
			if (setContent) setContent(newAIContent);
		}
	};

	return editorInstance && (
		<>
			<Toolbar
				documentId={documentId}
				documentName={documentName}
				documentType={documentType}
				editor={editorInstance}
				onAIEditedContent={handleAIEditedContent}
				saveFunction={saveFunction}
			/>
			<EditorProvider editor={editorInstance} />
		</>
	);
};
export default ContentEditor;
