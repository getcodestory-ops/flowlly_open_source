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
import { handleExportTables } from "./utils";

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
        class:
          "prose prose-lg max-w-none focus:outline-none prose-headings:font-bold prose-p:leading-relaxed prose-img:rounded-lg prose-img:shadow-md",
      },
    },
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor } : {editor: Editor}) => {
      if (setContent) setContent(editor.getHTML());
    },
  });

  const handleAIEditedContent = (newAIContent: string) => {
    if (editor) {
      editor.commands.setContent(newAIContent);
      if (setContent) setContent(newAIContent);
      console.log(newAIContent);
    }
  };

  return (
    <Card className="shadow-md border rounded-lg overflow-hidden h-[87vh] flex flex-col">
      {editor && (
        <>
          <Toolbar
            editor={editor}
            saveFunction={saveFunction}
            documentType={documentType}
            onAIEditedContent={handleAIEditedContent}
            documentId={documentId}
          />
          <Separator className="my-0" />
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex gap-2 p-1 bg-background border rounded-md shadow-sm">
              <Button
                size="sm"
                variant={editor.isActive("bold") ? "default" : "secondary"}
                onClick={() => editor.chain().setBold().run()}
              >
                Bold
              </Button>
              <Button
                size="sm"
                variant={editor.isActive("italic") ? "default" : "secondary"}
                onClick={() => editor.chain().setItalic().run()}
              >
                Italic
              </Button>
            </div>
          </BubbleMenu>

          <ScrollArea className="h-[calc(100%-80px)] flex-grow bg-white">
            <div className="px-4 py-6 max-w-5xl mx-auto">
              <EditorContent
                editor={editor}
                className="prose prose-lg max-w-none 
                  prose-headings:mb-4 prose-headings:mt-6 
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:border-b prose-h1:pb-2 prose-h1:border-gray-200
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-gray-800
                  prose-h3:text-xl prose-h3:font-medium prose-h3:text-gray-800
                  prose-p:my-3 prose-p:leading-relaxed prose-p:text-gray-700
                  prose-li:my-1 prose-li:text-gray-700
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:rounded-r-sm
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-code:text-primary prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-md prose-pre:shadow-md
                  prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-hr:border-gray-200 prose-hr:my-6
                  prose-table:border-collapse prose-table:w-full prose-table:my-4
                  prose-th:bg-gray-100 prose-th:text-left prose-th:p-2 prose-th:font-medium prose-th:border prose-th:border-gray-300
                  prose-td:border prose-td:border-gray-300 prose-td:p-2
                  whitespace-pre-wrap transition-all duration-200 ease-in-out"
              />
            </div>
          </ScrollArea>
        </>
      )}
    </Card>
  );
};

export default ContentEditor;
