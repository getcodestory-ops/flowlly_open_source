import { useEffect, useState, useCallback, useRef } from "react";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { FontSize } from "@tiptap/extension-font-size";
import { Markdown } from "tiptap-markdown"; 
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import Toolbar from "./ToolBar";
import { HoverExtension } from "./extensions/HoverExtension";
import { DiffStyleExtension } from "./extensions/DiffStyleExtension";
import { StyleParser } from "./extensions/StyleParser";
import Image from "@tiptap/extension-image";
import EditorProvider from "./EditorProvider";
import ReactChartDisplayExtension from "./extensions/ReactChartDisplayExtension";
import CommentsPanel from "./CommentsPanel";
import EditorBubbleMenu from "./BubbleMenu";
import { useStore } from "@/utils/store";
import { useEditorStore } from "@/hooks/useEditorStore";

interface EditorBlockProps {
  content: string | any;
  setContent?: (_: string) => void;
  saveFunction?: (_: string) => void;
  documentType?: string;
  documentId?: string;
  documentName?: string;
  showDiffButtons?: boolean;
  showComments?: boolean;
  onCommentsChange?: (threads: any[]) => void;
}

const ContentEditor = ({
	content,
	setContent,
	saveFunction,
	documentType = "Minutes of the meeting",
	documentId,
	documentName,
	showDiffButtons = true,
	showComments = false,
	onCommentsChange,
}: EditorBlockProps): React.ReactNode => {
	// Get user info from main store
	const { session } = useStore();
	const userEmail = session?.user?.email || "Anonymous";

	// Get minimal state from editor store (most logic now in CommentsPanel)
	const {
		threads,
		isCommentsVisible,
		setCurrentDocument,
		setCommentsVisible,
		createThread: storeCreateThread,
	} = useEditorStore();

	// Set current document when documentId changes
	useEffect(() => {
		setCurrentDocument(documentId || null);
	}, [documentId, setCurrentDocument]);

	// Initialize comments visibility based on prop
	useEffect(() => {
		setCommentsVisible(showComments);
	}, [showComments, setCommentsVisible]);

	const editorInstance = useEditor({
		extensions: [
			Markdown.configure({
				html: true,
				// Preserve HTML attributes including inline styles
				transformPastedText: false,
				transformCopiedText: false,
			}),
			StarterKit.configure({
				// Underline is now included in StarterKit by default in v3
			}),
			// StyleParser must come first to properly parse combined style attributes
			StyleParser,
			TextStyle, // Preserves class names and inline styles
			Color.configure({
				types: ["textStyle"],
			}),
			FontFamily.configure({
				types: ["textStyle"],
			}),
			FontSize.configure({
				types: ["textStyle"],
			}),
			Underline,
			Highlight.configure({
				multicolor: true,
			}),
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
			// Removed CommentsKit - managing comments manually with Highlight extension
		],
		editorProps: {
			attributes: {
				class: "focus:outline-none",
			},
		},
		content: content || "",
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			if (setContent) {
				// Always use HTML mode since markdown extension is temporarily disabled
				const htmlContent = editor.getHTML();
				setContent(htmlContent);
			}
		},
		// Additional parsing rules to preserve more HTML attributes
		parseOptions: {
			preserveWhitespace: "full",
		},

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


	const createThreadFromToolbar = useCallback((commentText: string) => {
		if (!editorInstance) return;
		storeCreateThread(editorInstance, commentText, userEmail, false);
		if (onCommentsChange) {
			onCommentsChange(threads);
		}
	}, [editorInstance, storeCreateThread, userEmail, onCommentsChange, threads]);


	const handleShowComments = useCallback(() => {
		setCommentsVisible(true);
	}, [setCommentsVisible]);

	// Note: Removed onEditorReady - all thread management is now internal

	return editorInstance && (
		<div className="flex h-full w-full" style={{ minHeight: "500px" }}>
			<div className="flex-1 overflow-hidden">
				<Toolbar
					documentId={documentId}
					documentName={documentName}
					documentType={documentType}
					editor={editorInstance}
					onAIEditedContent={handleAIEditedContent}
					onShowComments={handleShowComments}
					saveFunction={saveFunction}
					showComments={isCommentsVisible}
				/>
				<EditorProvider editor={editorInstance} />
				<EditorBubbleMenu 
					editor={editorInstance} 
					onCreateComment={createThreadFromToolbar} 
				/>
			</div>
			{isCommentsVisible && (
			
				<CommentsPanel
					onCommentsChange={onCommentsChange}
				/>
			)}
		</div>
	);
};

export default ContentEditor;
