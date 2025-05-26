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
import Image from "@tiptap/extension-image";
import EditorProvider from "./EditorProvider";
import ReactChartDisplayExtension from "./extensions/ReactChartDisplayExtension";
import { ChartDirectiveExtension } from "./extensions/ChartDirectiveExtension";
import { convertDirectivesToHTML, convertHTMLToDirectives } from "@/utils/chartDirectiveProcessor";
// import CustomHighlight from "./extensions/CustomHighlight";

interface EditorBlockProps {
  content: string | any;
  setContent?: (_: string) => void;
  saveFunction?: (_: string) => void;
  documentType?: string;
  documentId?: string;
  documentName?: string;
  includeToolbar?: boolean;
  showDiffButtons?: boolean;
}

const ContentEditor = ({
	content,
	setContent,
	saveFunction,
	documentType = "Minutes of the meeting",
	documentId,
	documentName,
	showDiffButtons = true,
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
			DiffStyleExtension.configure({
				showDiffButtons: showDiffButtons,
				multicolor: true,
			}),
			ReactChartDisplayExtension,
			ChartDirectiveExtension,
			// CustomHighlight,
		],
		editorProps: {
			attributes: {
				class: "focus:outline-none",
			},
		},
		content: content ? convertDirectivesToHTML(content) : "",
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			if (setContent) {
				// Convert HTML back to markdown with chart directives
				const markdownContent = editor.storage.markdown.getMarkdown();
				setContent(markdownContent);
			}
		},

	});

	useEffect(() => {
		if (editorInstance && content !== undefined) {
			// Convert chart directives to HTML before setting content
			const processedContent = convertDirectivesToHTML(content);
			editorInstance.commands.setContent(processedContent);
		}
	}, [content, editorInstance]);

	const handleAIEditedContent = (newAIContent: string): void => {
		if (editorInstance) {
			// Convert chart directives to HTML before setting content
			const processedContent = convertDirectivesToHTML(newAIContent);
			editorInstance.commands.setContent(processedContent);
			if (setContent) {
				// Convert back to directives for the callback
				const contentWithDirectives = convertHTMLToDirectives(newAIContent);
				setContent(contentWithDirectives);
			}
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
