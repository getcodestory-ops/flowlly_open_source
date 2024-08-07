import React, { useCallback, useEffect, useState } from "react";
import { Text, Spinner } from "@chakra-ui/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex items-center justify-between  bg-gray-900 text-white   rounded-lg top-0 sticky z-10 ">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white  mx-auto rounded-lg">
        <Select
          onValueChange={(value) => {
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select heading level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="p">Paragraph</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          onClick={() => editor.chain().focus().toggleMark("bold").run()}
          variant={"ghost"}
        >
          <FaBold />
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleMark("italic").run()}
        >
          <FaItalic />
        </Button>

        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleMark("underline").run()}
        >
          <FaUnderline />
        </Button>

        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FaListUl />
        </Button>

        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FaListOl />
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <FaCode />
        </Button>
        <Separator orientation="vertical" />
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <FaUndo />
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <FaRedo />
        </Button>
        <Separator orientation="vertical" />
        <Button variant={"ghost"} onClick={exportPdf}>
          <FaFileDownload />
        </Button>

        {sessionToken && (
          <EmailModal
            editor={editor}
            sessionToken={sessionToken}
            subject={documentType}
          />
        )}
        <Separator orientation="vertical" />

        <Text fontSize="sm" color={saveStatus === "Saving" ? "white" : "white"}>
          {saveStatus?.toLowerCase() === "saved" ? (
            saveStatus
          ) : (
            <Spinner size="sm" />
          )}
        </Text>
      </div>
    </div>
  );
};

export default Toolbar;
