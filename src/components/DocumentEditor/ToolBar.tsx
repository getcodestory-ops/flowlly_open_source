import React, { useCallback, useEffect, useState } from "react";
import {
  HStack,
  IconButton,
  Tooltip,
  Select,
  Divider,
  Text,
  Box,
  Spinner,
} from "@chakra-ui/react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaCode,
  FaUndo,
  FaRedo,
} from "react-icons/fa";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";
import { FaFileDownload } from "react-icons/fa";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import useDebounce from "@/utils/useDebounce";
import EmailModal from "../AiActions/EmailModal";
import { useStore } from "@/utils/store";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ToolbarProps {
  editor: any;
  documentType: string;
  saveFunction?: (contentData: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  saveFunction,
  documentType,
}) => {
  const [saveStatus, setSaveStatus] = useState("Saved");
  const sessionToken = useStore((state) => state.session);

  const deBounceSave = useDebounce(() => {
    setSaveStatus("Saving");

    if (saveFunction && editor) saveFunction(editor.getHTML());

    setTimeout(() => setSaveStatus("Saved"), 1000); // Show "Saved" for 1 second
  }, 10000);

  useEffect(() => {
    if (editor) {
      editor.on("update", deBounceSave);
    }
    return () => {
      if (editor) {
        editor.off("update", deBounceSave);
      }
    };
  }, [editor, deBounceSave]);

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

  if (!editor) {
    return null;
  }
  return (
    <Box position="sticky" top={0} zIndex={10} bg="gray.400" borderRadius="lg">
      <HStack spacing={1} overflowX="auto" px={2} borderRadius="md">
        <Select
          size="sm"
          w="auto"
          color="blue.500"
          borderRadius="lg"
          outline="none"
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : "p"
          }
          onChange={(e) => {
            const value = e.target.value;
            if (value === "p") {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: parseInt(value.charAt(1)) })
                .run();
            }
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </Select>

        <Divider orientation="vertical" />

        <Tooltip label="Bold">
          <IconButton
            aria-label="Bold"
            icon={<FaBold />}
            onClick={() => editor.chain().focus().toggleMark("bold").run()}
            isActive={editor.isActive("bold")}
            variant={editor.isActive("bold") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>

        <Tooltip label="Italic">
          <IconButton
            aria-label="Italic"
            icon={<FaItalic />}
            onClick={() => editor.chain().focus().toggleMark("italic").run()}
            isActive={editor.isActive("italic")}
            variant={editor.isActive("italic") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>

        <Tooltip label="Underline">
          <IconButton
            aria-label="Underline"
            icon={<FaUnderline />}
            onClick={() => editor.chain().focus().toggleMark("underline").run()}
            isActive={editor.isActive("underline")}
            variant={editor.isActive("underline") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>

        <Divider orientation="vertical" />

        <Tooltip label="Bullet List">
          <IconButton
            aria-label="Bullet List"
            icon={<FaListUl />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            variant={editor.isActive("bulletList") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>

        <Tooltip label="Numbered List">
          <IconButton
            aria-label="Numbered List"
            icon={<FaListOl />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            variant={editor.isActive("orderedList") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>

        {/* <Tooltip label="Blockquote">
          <IconButton
            aria-label="Blockquote"
            icon={<FaQuoteRight />}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            variant={editor.isActive("blockquote") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip> */}

        <Tooltip label="Code Block">
          <IconButton
            aria-label="Code Block"
            icon={<FaCode />}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            variant={editor.isActive("codeBlock") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>

        <Divider orientation="vertical" />
        {/* 
        <Tooltip label="Insert Link">
          <IconButton
            aria-label="Insert Link"
            icon={<FaLink />}
            onClick={() => {
              const url = window.prompt("Enter the URL");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive("link")}
            variant={editor.isActive("link") ? "solid" : "ghost"}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip> */}

        {/* <Tooltip label="Insert Image">
          <IconButton
            aria-label="Insert Image"
            icon={<FaImage />}
            onClick={() => {
              const url = window.prompt("Enter the image URL");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip> */}

        <Divider orientation="vertical" />

        <Tooltip label="Undo">
          <IconButton
            aria-label="Undo"
            icon={<FaUndo />}
            onClick={() => editor.chain().focus().undo().run()}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>

        <Tooltip label="Redo">
          <IconButton
            aria-label="Redo"
            icon={<FaRedo />}
            onClick={() => editor.chain().focus().redo().run()}
            colorScheme="blue"
            size="sm"
          />
        </Tooltip>
        <Tooltip label="Export to PDF">
          <IconButton
            aria-label="Export to PDF"
            icon={<FaFileDownload />}
            onClick={exportPdf}
            size="sm"
            colorScheme="blue"
          />
        </Tooltip>
        {sessionToken && (
          <EmailModal
            editor={editor}
            sessionToken={sessionToken}
            subject={documentType}
          />
        )}
        <Divider orientation="vertical" />

        <Text
          fontSize="sm"
          color={saveStatus === "Saving" ? "blue.500" : "green.500"}
        >
          {saveStatus?.toLowerCase() === "saved" ? (
            saveStatus
          ) : (
            <Spinner size="sm" />
          )}
        </Text>
      </HStack>
    </Box>
  );
};

export default Toolbar;
