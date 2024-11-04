import React, { useEffect, useRef, useState } from "react";
import {
  FileSearch,
  Maximize,
  Trash,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowUpDown,
} from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { StorageResourceEntity } from "@/types/document";
//components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MediaDialogContent } from "./MediaViewer/MediaDialogContent";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { uploadFileInFolder, createDocumentInFolder } from "@/api/folderRoutes";
import { useToast } from "@/components/ui/use-toast";

import { MediaViewer } from "../Folder/MediaViewer";
import { FileMediaIcon } from "./FileMediaIcon";
import { deleteFile } from "@/api/folderRoutes";
import { formatDate } from "@/utils/calculations";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

type SortField = "file_name" | "extension" | "created_at";
type SortDirection = "asc" | "desc";

export const FilesContent = ({
  files,
  folderId,
  folderName,
  session,
  activeProject,
}: {
  files: StorageResourceEntity[];
  folderId: string;
  folderName: string;
  session: any;
  activeProject: any;
}) => {
  const [currentFile, setCurrentFile] = useState<null | StorageResourceEntity>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 10; // Adjust this number as needed
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  const sortedAndFilteredFiles = files
    .filter(
      (file) =>
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.metadata.extension.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "file_name") {
        return sortDirection === "asc"
          ? a.file_name.localeCompare(b.file_name)
          : b.file_name.localeCompare(a.file_name);
      }
      if (sortField === "extension") {
        return sortDirection === "asc"
          ? a.metadata.extension.localeCompare(b.metadata.extension)
          : b.metadata.extension.localeCompare(a.metadata.extension);
      }
      return sortDirection === "asc"
        ? new Date(a.created_at || "").getTime() -
            new Date(b.created_at || "").getTime()
        : new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime();
    });

  const currentFiles = sortedAndFilteredFiles.slice(
    indexOfFirstFile,
    indexOfLastFile
  );
  const totalPages = Math.ceil(sortedAndFilteredFiles.length / filesPerPage);

  const chatRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       chatRef.current &&
  //       !chatRef.current.contains(event.target as Node) &&
  //       isChatOpen &&
  //       !isClosing
  //     ) {
  //       setIsClosing(true);
  //       setTimeout(() => {
  //         setIsChatOpen(false);
  //         setIsClosing(false);
  //       }, 300); // Match this with the CSS transition duration
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [isChatOpen, isClosing]);

  return (
    <div className="relative">
      <div className="grid gap-4 md:gap-8 grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>All Files</CardTitle>
              <CardDescription>
                Recent files in the selected category.
              </CardDescription>
            </div>
            <AddFileInFolderButton
              folderId={folderId}
              session={session}
              activeProject={activeProject}
            />
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Table>
              <FilesHeader
                sortField={sortField}
                sortDirection={sortDirection}
                setSortField={setSortField}
                setSortDirection={setSortDirection}
              />
              <TableBody>
                {currentFiles.map((file, i) => (
                  <FileRow
                    key={i}
                    resource={file}
                    email={session.user.email}
                    setCurrentFile={setCurrentFile}
                    currentFile={currentFile}
                    session={session}
                    activeProject={activeProject}
                    folderId={folderId}
                  />
                ))}
                {files.length === 0 && <EmptyFileRow />}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstFile + 1}-
                {Math.min(indexOfLastFile, files.length)} of {files.length}{" "}
                files
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <FilePreviewCard resource={currentFile} /> */}
      </div>

      {/* Floating chat button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-auto h-auto p-2 flex items-center gap-2"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <div className="bg-primary text-primary-foreground rounded-full p-2">
          <MessageCircle size={24} />
        </div>
        <span className="pr-2">Look for answers in {folderName}</span>
      </Button>

      {/* Chat component */}
      {(isChatOpen || isClosing) && (
        <div
          ref={chatRef}
          className={`fixed bottom-20 right-4 w-[calc(100vw-200px)] z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          <PlatformChatComponent
            folderId={folderId}
            folderName={folderName}
            chatTarget="folder"
          />
        </div>
      )}
    </div>
  );
};

const FilePreviewCard = ({
  resource,
}: {
  resource: StorageResourceEntity | null;
}) => {
  return (
    <Card className="sticky top-4 self-start">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Preview</CardTitle>
          <CardDescription>Preview the hovered file</CardDescription>
        </div>
        {resource && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="ml-auto gap-1">
                <Maximize size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-6xl flex flex-col items-center justify-center"
              aria-describedby="file viewer"
            >
              <MediaDialogContent resource={resource} />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {resource && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row w-full">
              <div
                className="font-medium flex-1
                overflow-hidden whitespace-nowrap overflow-ellipsis
              "
              >
                {resource.file_name}
              </div>
              <Badge variant="secondary">{resource.metadata.extension}</Badge>
            </div>

            <MediaViewer resource={resource} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FilesHeader = ({
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
}: {
  sortField: SortField;
  sortDirection: SortDirection;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
}) => {
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="hover:bg-transparent"
    >
      {children}
      {sortField === field && (
        <ArrowUpDown
          className={`ml-2 h-4 w-4 ${
            sortDirection === "desc" ? "transform rotate-180" : ""
          }`}
        />
      )}
    </Button>
  );

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="hidden md:table-cell">
          <SortButton field="file_name">File Name</SortButton>
        </TableHead>
        <TableHead className="hidden sm:table-cell">
          <SortButton field="extension">Type</SortButton>
        </TableHead>
        <TableHead className="hidden md:table-cell">
          <SortButton field="created_at">Date</SortButton>
        </TableHead>
        <TableHead className="hidden md:table-cell">Trash</TableHead>
      </TableRow>
    </TableHeader>
  );
};

const FileRow = ({
  resource,
  setCurrentFile,
  currentFile,
  session,
  activeProject,
  folderId,
}: {
  resource: any;
  email: string;
  setCurrentFile: (resource: any) => void;
  currentFile: any;
  session: any;
  activeProject: any;
  folderId: string;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate } = useMutation({
    mutationFn: deleteFile,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`fetchFiles-${folderId}`],
      });
      toast({
        title: "File Deleted Successfully",
        description: `File ${resource.file_name} deleted successfully`,
        duration: 20000,
      });
      setShowDeleteDialog(false);
    },
  });

  const handleDelete = () => {
    mutate({
      session,
      projectId: activeProject.project_id,
      fileId: resource.id,
    });
  };

  return (
    <TableRow
      onMouseEnter={() => setCurrentFile(resource)}
      className={`hover:bg-blue-100  ${
        currentFile?.id === resource.id ? "bg-blue-100" : ""
      }`}
    >
      <Dialog>
        <DialogTrigger asChild>
          <TableCell className="cursor-pointer">
            <div className="flex flex-row justify-start gap-4">
              <FileMediaIcon fileExt={resource.metadata.extension + ""} />
              <div className="font-medium">{resource.file_name}</div>
            </div>
          </TableCell>
        </DialogTrigger>
        <DialogContent
          className="max-w-6xl flex flex-col items-center justify-center"
          aria-describedby="file viewer"
        >
          <MediaDialogContent resource={resource} />
        </DialogContent>
      </Dialog>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="secondary">{resource.metadata.extension}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(resource.created_at)}
      </TableCell>
      <TableCell className="cursor-pointer hidden md:table-cell">
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Trash size={16} />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {resource.file_name}? This
                  action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};

const AddFileInFolderButton = ({
  folderId,
  session,
  activeProject,
}: {
  folderId: string | null;
  session: any;
  activeProject: any;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textFileName, setTextFileName] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await uploadFileInFolder(
          session,
          activeProject.project_id,
          file,
          folderId
        );
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        toast({
          title: "File Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    queryClient.invalidateQueries({
      queryKey: [`fetchFiles-${folderId}`],
    });
    toast({
      title: "Files Uploaded Successfully",
      description: `${files.length} file(s) uploaded successfully`,
      duration: 5000,
    });
  };

  const handleCreateTextFile = () => {
    if (!textFileName) return;

    // Create a new text file with the given name
    const file = new File([""], textFileName + ".txt", { type: "text/plain" });

    uploadFileInFolder(
      session,
      activeProject.project_id,
      file,
      folderId,
      (data) => {
        queryClient.invalidateQueries({
          queryKey: [`fetchFiles-${folderId}`],
        });
        toast({
          title: "Text File Created Successfully",
          description: `Text file "${textFileName}.txt" created successfully`,
          duration: 20000,
        });
        setTextFileName("");
      }
    );
  };

  return (
    <div className="ml-auto flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
        accept=".bmp,.csv,.doc,.docx,.eml,.epub,.heic,.html,.jpeg,.png,.md,.msg,.odt,.org,.p7s,.pdf,.png,.ppt,.pptx,.rst,.rtf,.tiff,.txt,.tsv,.xls,.xlsx,.xml"
        multiple={true}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        size="sm"
        variant="default"
      >
        + Upload Files
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="default">
            + Text File
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Enter file name"
              value={textFileName}
              onChange={(e) => setTextFileName(e.target.value)}
            />
            <Button onClick={handleCreateTextFile}>Create Document</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const EmptyFileRow = () => {
  return (
    <TableRow>
      <TableCell colSpan={4} className="text-center">
        <EmptyFilesDisplay />
      </TableCell>
    </TableRow>
  );
};

const EmptyFilesDisplay = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <FileSearch className="w-20 h-20 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-500">No files found</p>
      <p className="text-sm text-gray-400">
        It looks like there are no files here. Try uploading or checking back
        later.
      </p>
    </div>
  );
};
