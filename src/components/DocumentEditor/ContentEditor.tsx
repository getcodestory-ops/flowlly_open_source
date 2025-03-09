import { useEditor, EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderLine from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ImageResize from "tiptap-extension-resize-image";
import { Markdown } from "tiptap-markdown";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "../ui/button";
import Toolbar from "./ToolBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HoverExtension } from "./extensions/HoverExtension";
import { DiffStyleExtension } from "./extensions/DiffStyleExtension";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EditorBlockProps {
  content: string | any;
  setContent?: (content: string) => void;
  saveFunction?: (contentData: string) => void;
  documentType?: string;
  documentId?: string;
}

const ContentEditor = ({
	content,
	setContent,
	saveFunction,
	documentType = "Minutes of the meeting",
	documentId,
}: EditorBlockProps) => {
	const editor = useEditor({
		extensions: [
      StarterKit as any,
      Markdown.configure({
      	html: true,
      }),
      UnderLine,
      ImageResize,
      TextAlign.configure({
      	types: ["heading", "paragraph"],
      }),
      Table.configure({
      	resizable: true,
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
				// "prose prose-lg max-w-none focus:outline-none prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-lg prose-img:shadow-md",
			},
		},
		content: content,
		immediatelyRender: false,
		onUpdate: ({ editor }: { editor: Editor }) => {
			if (setContent) setContent(editor?.storage.markdown.getMarkdown());
		},
	});

	const handleAIEditedContent = (newAIContent: string) => {
		if (editor) {
			editor.commands.setContent(newAIContent);
			if (setContent) setContent(newAIContent);
			//console.log(newAIContent);
		}
	};

	return (
		<Card className="shadow-md border rounded-lg overflow-hidden h-[87vh] flex flex-col">
			{editor && (
				<>
					<Toolbar
						documentId={documentId}
						documentType={documentType}
						editor={editor}
						onAIEditedContent={handleAIEditedContent}
						saveFunction={saveFunction}
					/>
					<Separator className="my-0" />
					<BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
						<div className="flex gap-2 p-1 bg-background border rounded-md shadow-sm">
							<Button
								onClick={() => editor.chain().setBold()
									.run()}
								size="sm"
								variant={editor.isActive("bold") ? "default" : "secondary"}
							>
                			Bold
							</Button>
							<Button
								onClick={() => editor.chain().setItalic()
									.run()}
								size="sm"
								variant={editor.isActive("italic") ? "default" : "secondary"}
							>
                			Italic
							</Button>
						</div>
					</BubbleMenu>
					<ScrollArea className="h-[calc(100%-80px)] flex-grow bg-gray-50">
						<div className="px-10 py-6 w-[768px] mx-auto bg-white my-0 border-[1px] border-gray-200">
							<EditorContent
								className="
                  text-sm font-arial leading-normal
                  prose-hr:my-4
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:ml-[-10px] prose-h1:mb-6
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-7 prose-h2:ml-[-8px] prose-h2:mb-5
                  prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:ml-[-6px] prose-h3:mb-4
                  prose-h4:text-lg prose-h4:font-bold prose-h4:mt-5 prose-h4:ml-[-4px] prose-h4:mb-3
                  prose-li:list-decimal prose-li:text-gray-900 prose-li:text-sm prose-li:ml-5 prose-li:mb-2 prose-li:mt-4
                  prose-p:leading-normal prose-p:text-gray-900 
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-table:border-collapse prose-table:w-full prose-table:text-xs prose-table:p-2 prose-table:ml-4 prose-table:mb-8 prose-table:mt-4
                  prose-th:bg-gray-50 prose-th:text-left prose-th:font-medium prose-th:border prose-th:border-gray-200 prose-th:font-bold prose-th:p-2
                  prose-td:border prose-td:border-gray-200 prose-td:p-2 
                 "
								editor={editor}
							/>
						</div>
					</ScrollArea>
				</>
			)}
		</Card>
	);
};
export default ContentEditor;
