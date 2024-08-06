import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderLine from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ImageResize from "tiptap-extension-resize-image";
import { Markdown } from "tiptap-markdown";
import { Button, Flex } from "@chakra-ui/react";
import Toolbar from "./ToolBar";

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
    <Flex
      w="full"
      maxH="70vh"
      flexDir="column"
      overflowY="auto"
      sx={{
        h1: {
          fontSize: "4xl",
          fontWeight: "bold",
        },
        h2: {
          fontSize: "3xl",
          marginTop: "1rem",
          marginBottom: "1rem",
        },
        h3: {
          fontSize: "2xl",

          marginTop: "1.5rem",
        },
        h4: {
          fontSize: "xl",
        },
        h5: {
          fontSize: "lg",
        },
        h6: {
          fontSize: "md",
        },
        p: {
          fontSize: "sm",
          fontWeight: "normal",
          margin: "0.5rem 0",
        },
        li: {
          fontSize: "sm",
          fontWeight: "normal",
          marginLeft: "2rem",
        },
      }}
    >
      {editor && (
        <>
          <Toolbar
            editor={editor}
            saveFunction={saveFunction}
            documentType={documentType}
          />
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <Flex gap="2">
              <Button
                size="sm"
                onClick={() => editor.chain().focus().toggleMark("bold").run()}
                colorScheme={editor.isActive("bold") ? "blue" : "gray"}
              >
                Bold
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  editor.chain().focus().toggleMark("italic").run()
                }
                colorScheme={editor.isActive("italic") ? "blue" : "gray"}
              >
                Italic
              </Button>
            </Flex>
          </BubbleMenu>
          <EditorContent editor={editor} className="m-4 " />
        </>
      )}
    </Flex>
  );
};

export default ContentEditor;
