import { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderLine from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ImageResize from "tiptap-extension-resize-image";
import { Markdown } from "tiptap-markdown";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Toolbar from "./ToolBar";
import { HoverExtension } from "./extensions/HoverExtension";
import { DiffStyleExtension } from "./extensions/DiffStyleExtension";
import ReactChartDisplayExtension from "./extensions/ReactChartDisplayExtension";
import { useEditorStore } from "@/hooks/useEditorStore";
import Image from "@tiptap/extension-image";
interface EditorBlockProps {
  content: string | any;
  setContent?: (_: string) => void;
  saveFunction?: (_: string) => void;
  documentType?: string;
  documentId?: string;
}
// TODO
const ContentEditor = ({
	content,
	setContent,
	saveFunction,
	documentType = "Minutes of the meeting",
	documentId,
}: EditorBlockProps): React.ReactNode => {
	const { setEditor, editor } = useEditorStore();
	
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
			
			ReactChartDisplayExtension,
		],
		editorProps: {
			attributes: {
				class: "focus:outline-none",
			},
		},
		content: content || "",
		immediatelyRender: false,
		onUpdate: ({ editor }: { editor: Editor }) => {
			if (setContent) setContent(editor?.storage.markdown.getMarkdown());
			setEditor(editor);
		},
		onCreate: ({ editor }: { editor: Editor }) => {
			setEditor(editor);
		},
		onDestroy: () => {
			setEditor(null);
		},
		onSelectionUpdate: ({ editor }: { editor: Editor }) => {
			setEditor(editor);
		},
		onTransaction: ({ editor }: { editor: Editor }) => {
			setEditor(editor);
		},
		onFocus: ({ editor }: { editor: Editor }) => {
			setEditor(editor);
		},
		onBlur: ({ editor }: { editor: Editor }) => {
			setEditor(editor);
		},
		onContentError: ({ editor }: { editor: Editor }) => {
			setEditor(editor);
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

	return editorInstance && (
		<>
			<Toolbar
				documentId={documentId}
				documentType={documentType}
				onAIEditedContent={handleAIEditedContent}
				saveFunction={saveFunction}
			/>
			<div className="flex-grow bg-gray-50 overflow-auto rounded-b-lg border-none w-full" style={{ maxHeight: "calc(100% - 52px)" }}>
				<div className="px-10 py-6 w-[768px] mx-auto bg-white my-0 border-l border-r border-gray-200">
					<EditorContent
						className="
									text-sm font-arial leading-normal
									prose-hr:my-4
									prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:ml-[-10px] prose-h1:mb-6
									prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-7 prose-h2:ml-[-8px] prose-h2:mb-5
									prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:ml-[-6px] prose-h3:mb-4
									prose-h4:text-lg prose-h4:font-bold prose-h4:mt-5 prose-h4:ml-[-4px] prose-h4:mb-3
									prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-900 prose-li:text-sm prose-li:ml-5 prose-li:mb-2 prose-li:mt-4
									prose-p:leading-normal prose-p:text-gray-900 
									prose-strong:text-gray-900 prose-strong:font-semibold
									prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
									prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
									prose-table:border-collapse prose-table:w-full prose-table:text-xs prose-table:p-2 prose-table:ml-4 prose-table:mb-8 prose-table:mt-4
									prose-th:bg-gray-50 prose-th:text-left prose-th:font-medium prose-th:border prose-th:border-gray-200 prose-th:font-bold prose-th:p-2
									prose-td:border prose-td:border-gray-200 prose-td:p-2 
								"
						editor={editorInstance}
					/>
				</div>
			</div>
		</>
	);
};
export default ContentEditor;
