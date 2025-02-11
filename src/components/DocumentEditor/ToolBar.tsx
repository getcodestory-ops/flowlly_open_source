import React, { useCallback, useEffect, useState } from "react";

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
  FaTable,
  FaSpinner,
  FaImage,
  FaMagic,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageForEditor } from "@/api/folderRoutes";
import { useToast } from "@/components/ui/use-toast";
import PlatformChatComponent from "@/components/ChatInput/PlatformChat/PlatformChatComponent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

(pdfMake as any).vfs = pdfFonts.vfs;

interface ToolbarProps {
  editor: any;
  documentType: string;
  saveFunction?: (contentData: string) => void;
  onAIEditedContent?: (content: string) => void;
  documentId?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  saveFunction,
  documentType,
  onAIEditedContent,
  documentId,
}) => {
  const [saveStatus, setSaveStatus] = useState("Saved");
  const sessionToken = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isAIPopoverOpen, setIsAIPopoverOpen] = useState(false);
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

  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const [imageUrl, setImageUrl] = useState("");

  const handleImageUpload = async (file: File) => {
    if (!sessionToken) {
      toast({
        title: "Error",
        description: "You must be logged in to upload images.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    if (!activeProject?.project_id) {
      toast({
        title: "Error",
        description: "No active project found.",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await uploadImageForEditor({
        session: sessionToken,
        projectId: activeProject?.project_id,
        file,
      });
      editor.chain().focus().setImage({ src: result.url }).run();
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">
              <FaTable className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Insert Table</h4>
                <p className="text-sm text-muted-foreground">
                  Set the number of rows and columns for your table.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="rows">Rows</Label>
                  <Input
                    id="rows"
                    type="number"
                    className="col-span-2 h-8"
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="columns">Columns</Label>
                  <Input
                    id="columns"
                    type="number"
                    className="col-span-2 h-8"
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .insertTable({
                      rows: tableRows,
                      cols: tableCols,
                      withHeaderRow: true,
                    })
                    .run();
                }}
              >
                Insert Table
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
        {documentId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">
                <FaMagic className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] sm:h-[100vh] flex flex-col">
              <div className="flex-1 ">
                <PlatformChatComponent
                  folderId={documentId}
                  folderName={"Document Editor"}
                  chatTarget="editor"
                  onContentUpdate={(newContent: string) => {
                    if (onAIEditedContent) onAIEditedContent(newContent);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" disabled={isUploading}>
              {isUploading ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaImage className="h-4 w-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Insert Image</h4>
                <p className="text-sm text-muted-foreground">
                  Upload an image or enter a URL.
                </p>
              </div>
              <div className="grid gap-2">
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                />
                <div className="- or -" />
                <Input
                  id="imageUrl"
                  type="text"
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  if (imageUrl) {
                    editor.chain().focus().setImage({ src: imageUrl }).run();
                    setImageUrl("");
                  }
                }}
              >
                Insert Image from URL
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {sessionToken && (
          <EmailModal
            editor={editor}
            sessionToken={sessionToken}
            subject={documentType}
          />
        )}
        <Separator orientation="vertical" />

        <div className="font-sm text-white">
          {saveStatus?.toLowerCase() === "saved" ? (
            saveStatus
          ) : (
            <FaSpinner className="h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
