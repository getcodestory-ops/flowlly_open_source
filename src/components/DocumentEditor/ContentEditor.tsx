import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
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
import { diffChars } from "diff";

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
      Markdown,
      UnderLine,
      ImageResize,
      TextAlign,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      HoverExtension,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none prose-headings:font-semibold prose-p:leading-relaxed",
      },
    },
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (setContent) setContent(editor.getHTML());
    },
  });

  function computeDiff(oldText: string, newText: string): string {
    const diff = diffChars(oldText, newText);
    return diff
      .map((part) => {
        if (part.added) {
          return `<span style="background-color: #d4faca">${part.value}</span>`;
        } else if (part.removed) {
          return `<span style="text-decoration: line-through; color: red">${part.value}</span>`;
        } else {
          return part.value;
        }
      })
      .join("");
  }

  const handleAIEditedContent = (newAIContent: string) => {
    if (editor) {
      const oldContent = editor.getHTML();
      const diffContent = computeDiff(oldContent, newAIContent);
      editor.commands.setContent(diffContent);
      if (setContent) setContent(diffContent);
    }
  };

  return (
    <div className="max-h-[90vh] flex flex-col ">
      {editor && (
        <>
          <Toolbar
            editor={editor}
            saveFunction={saveFunction}
            documentType={documentType}
            onAIEditedContent={handleAIEditedContent}
            documentId={documentId}
          />
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
          <ScrollArea className="h-[75vh] ">
            <EditorContent
              editor={editor}
              className="m-2 w-full prose prose-sm max-w-none 
                prose-headings:mb-3 prose-headings:mt-2 
                prose-p:my-2 prose-p:leading-relaxed
                prose-li:my-0.5 
                prose-headings:text-gray-800
                prose-p:text-gray-700
                prose-strong:text-gray-800
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-code:text-gray-900 prose-code:bg-gray-100
                [&>*]:max-w-4xl [&>*]:mx-auto p-4"
            />
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default ContentEditor;
