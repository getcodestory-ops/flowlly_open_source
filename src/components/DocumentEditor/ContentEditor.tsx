import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Flex, Button } from "@chakra-ui/react";
import { useEffect, useCallback } from "react";
import htmlToPdfmake from "html-to-pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { FaFileDownload } from "react-icons/fa";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface EditorBlockProps {
  content: string;
  setContent: (content: string) => void;
}

const ContentEditor = ({ content, setContent }: EditorBlockProps) => {
  const editor = useEditor({
    extensions: [StarterKit as any, Markdown],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const exportPdf = useCallback(() => {
    if (editor) {
      const htmlContent = editor.getHTML();
      const pdfContent = htmlToPdfmake(htmlContent);

      const documentDefinition: TDocumentDefinitions = {
        content: pdfContent,
      };

      pdfMake.createPdf(documentDefinition).download("minutes.pdf");
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      setContent(editor.getHTML());
    }
  }, [content, editor]);

  return (
    <Flex
      w="full"
      p="2"
      sx={{
        h1: {
          fontSize: "4xl",
          fontWeight: "bold",
        },
        h2: {
          fontSize: "3xl",
          marginLeft: "0.25rem",
          marginTop: "2rem",
        },
        h3: {
          fontSize: "2xl",
          marginLeft: "0.75rem",
          marginTop: "1.5rem",
        },
        h4: {
          fontSize: "xl",
          marginLeft: "0.75rem",
        },
        h5: {
          fontSize: "lg",
          marginLeft: "1rem",
        },
        h6: {
          fontSize: "md",
          marginLeft: "1.25rem",
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
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <Button
              size="sm"
              onClick={() => editor.chain().focus().toggleMark("bold").run()}
              colorScheme={editor.isActive("bold") ? "blue" : "gray"}
            >
              Bold
            </Button>
            <Button
              size="sm"
              onClick={() => editor.chain().focus().toggleMark("italic").run()}
              colorScheme={editor.isActive("italic") ? "blue" : "gray"}
            >
              Italic
            </Button>
            {/* Add more buttons for other formatting options as needed */}
          </BubbleMenu>
          <Flex flexDir="column">
            <Flex justifyContent={"flex-end"}>
              <Button
                leftIcon={<FaFileDownload />}
                onClick={exportPdf}
                size="sm"
                colorScheme="green"
              >
                Export to PDF
              </Button>
            </Flex>

            <EditorContent editor={editor} />
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default ContentEditor;
