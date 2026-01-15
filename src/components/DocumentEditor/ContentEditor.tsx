import { useEffect, useCallback, useState } from "react";
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
import { CompoundDiffExtension } from "./extensions/CompoundDiffExtension";
import { StyleParser } from "./extensions/StyleParser";
import { ClassPreservationExtension } from "./extensions/ClassPreservationExtension";
import { DivExtension } from "./extensions/DivExtension";
import { SpanExtension } from "./extensions/SpanExtension";
import ResizeImage from "tiptap-extension-resize-image";
import EditorProvider from "./EditorProvider";
import { type PageSizeType, DEFAULT_PAGE_SIZE, type ZoomLevel, DEFAULT_ZOOM } from "./extensions/PageSizeConfig";
import ReactChartDisplayExtension from "./extensions/ReactChartDisplayExtension";
import CommentsPanel from "./CommentsPanel";
import EditorBubbleMenu from "./BubbleMenu";
import { useStore } from "@/utils/store";
import { useEditorStore } from "@/hooks/useEditorStore";
import "./editor-styles.css";

interface EditorBlockProps {
  content: string | unknown;
  setContent?: (_: string) => void;
  saveFunction?: (_: string) => void;
  documentType?: string;
  documentId?: string;
  documentName?: string;
  projectAccessId?: string;
  showDiffButtons?: boolean;
  showComments?: boolean;
  onCommentsChange?: (threads: unknown[]) => void;
}

const ContentEditor = ({
	content,
	setContent,
	saveFunction,
	documentType = "Minutes of the meeting",
	documentId,
	documentName,
	projectAccessId,
	showComments = false,
	onCommentsChange,
}: EditorBlockProps): React.ReactNode => {
	const { session } = useStore();
	const userEmail = session?.user?.email || "Anonymous";
	const [pageSize, setPageSize] = useState<PageSizeType>(DEFAULT_PAGE_SIZE);
	const [zoom, setZoom] = useState<ZoomLevel>(DEFAULT_ZOOM);

	const {
		threads,
		isCommentsVisible,
		setCurrentDocument,
		setCommentsVisible,
		createThread: storeCreateThread,
	} = useEditorStore();

	// Helper function to check if document should use Markdown
	const shouldUseMarkdown = (docName?: string): boolean => {
		return docName?.toLowerCase().endsWith(".md") || docName?.toLowerCase().endsWith(".template") || false;
	};


	useEffect(() => {
		setCurrentDocument(documentId || null, projectAccessId);
	}, [documentId, projectAccessId, setCurrentDocument]);


	useEffect(() => {
		setCommentsVisible(showComments);
	}, [showComments, setCommentsVisible]);

	const editorInstance = useEditor({
		extensions: [
			StarterKit.configure({
			}),
			DivExtension,
			SpanExtension,
			// Conditionally include Markdown extension only for .md files
			...(shouldUseMarkdown(documentName) ? [
				Markdown.configure({
					html: true,
					transformPastedText: false,
					transformCopiedText: false,
				}),
			] : []),
			ClassPreservationExtension,
			StyleParser,
			TextStyle,
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
			ResizeImage.configure({
				allowBase64: true,
				inline: true,
			}),
			TableRow,
			TableHeader,
			TableCell,
			HoverExtension,
			CompoundDiffExtension.configure({
				HTMLAttributes: {},
			}),
			ReactChartDisplayExtension,
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
				const htmlContent = editor.getHTML();
				setContent(htmlContent);
			}
		},
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


	const createThreadFromToolbar = useCallback(async(commentText: string) => {
		if (!editorInstance) return;
		await storeCreateThread(editorInstance, commentText, userEmail, false);
		if (onCommentsChange) {
			onCommentsChange(threads);
		}
	}, [editorInstance, storeCreateThread, userEmail, onCommentsChange, threads]);


	const handleShowComments = useCallback(() => {
		setCommentsVisible(true);
	}, [setCommentsVisible]);

	return editorInstance && (
		<div className="flex h-full w-full relative min-h-[80vh]">
			<div className="flex-1 overflow-hidden flex flex-col">
				<Toolbar
					documentId={documentId}
					documentName={documentName}
					documentType={documentType}
					editor={editorInstance}
					onAIEditedContent={handleAIEditedContent}
					onPageSizeChange={setPageSize}
					onShowComments={handleShowComments}
					onZoomChange={setZoom}
					pageSize={pageSize}
					saveFunction={saveFunction}
					showComments={isCommentsVisible}
					zoom={zoom}
				/>

				{isCommentsVisible && (
					<CommentsPanel
						onCommentsChange={onCommentsChange}
					/>
				)}

				{/* Editor with optional paged view */}
				<EditorProvider editor={editorInstance} pageSize={pageSize} zoom={zoom} />
				<EditorBubbleMenu 
					editor={editorInstance} 
					onCreateComment={createThreadFromToolbar} 
				/>
			</div>
		</div>
	);
};

export default ContentEditor;
