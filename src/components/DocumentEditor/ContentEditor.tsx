import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderLine from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ImageResize from "tiptap-extension-resize-image";
import { Markdown } from "tiptap-markdown";
import { Button } from "../ui/button";
import Toolbar from "./ToolBar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditorBlockProps {
  content: string | any;
  setContent?: (content: string) => void;
  saveFunction?: (contentData: string) => void;
  documentType?: string;
}

const ContentEditor = ({
  content,
  setContent,
  saveFunction,
  documentType = "Minutes of the meeting",
}: EditorBlockProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit as any,
      Markdown,
      UnderLine,
      ImageResize,
      TextAlign,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none ",
      },
    },
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (setContent) setContent(editor.getHTML());
    },
  });

  return (
    <div className=" max-h-[90vh] flex flex-col  ">
      {editor && (
        <>
          <Toolbar
            editor={editor}
            saveFunction={saveFunction}
            documentType={documentType}
          />
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex gap-2 p-1 bg-background border rounded-md shadow-sm">
              <Button
                size="sm"
                variant={editor.isActive("bold") ? "default" : "secondary"}
                onClick={() => editor.chain().focus().toggleMark("bold").run()}
              >
                Bold
              </Button>
              <Button
                size="sm"
                variant={editor.isActive("italic") ? "default" : "secondary"}
                onClick={() =>
                  editor.chain().focus().toggleMark("italic").run()
                }
              >
                Italic
              </Button>
            </div>
          </BubbleMenu>
          <ScrollArea className="h-[75vh]">
            <EditorContent
              editor={editor}
              className="m-4 w-full prose prose-sm sm:prose lg: prose-lg xl:prose-2xl"
            />
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default ContentEditor;
