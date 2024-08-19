import React, { useState } from "react";
import Link from "next/link";
import { FileSearch, Maximize } from "lucide-react";

import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

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

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { uploadFileInFolder } from "@/api/folderRoutes";
import { useToast } from "@/components/ui/use-toast";

import { MediaViewer } from "../Folder/MediaViewer";
import { FileMediaIcon } from "./FileMediaIcon";

import { formatDate } from "@/utils/calculations";

export const FilesContent = ({
  files,
  folderId,
  session,
  activeProject,
}: {
  files: StorageResourceEntity[];
  folderId: string;
  session: any;
  activeProject: any;
}) => {
  const [currentFile, setCurrentFile] = useState<null | StorageResourceEntity>(
    null
  );
  return (
    <div className="grid gap-4 md:gap-8 grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2">
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
          <Table>
            <FilesHeader />
            <TableBody>
              {files.map((file, i) => (
                <FileRow
                  key={i}
                  file={file}
                  email={session.user.email}
                  setCurrentFile={setCurrentFile}
                  currentFile={currentFile}
                />
              ))}
              {files.length === 0 && <EmptyFileRow />}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <FilePreviewCard file={currentFile} />
    </div>
  );
};

const FilePreviewCard = ({ file }: { file: StorageResourceEntity | null }) => {
  return (
    <Card className="sticky top-4 self-start">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Preview</CardTitle>
          <CardDescription>Preview the hovered file</CardDescription>
        </div>
        <Button variant="ghost" className="ml-auto gap-1">
          <Maximize size={16} />
        </Button>
      </CardHeader>
      <CardContent>
        {file && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row w-full">
              <div
                className="font-medium flex-1
                overflow-hidden whitespace-nowrap overflow-ellipsis
              "
              >
                {file.file_name}
              </div>
              <Badge variant="secondary">{file.metadata.extension}</Badge>
            </div>
            <MediaViewer resource={file} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FilesHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="hidden md:table-cell">File Name</TableHead>
        <TableHead className="hidden sm:table-cell">Type</TableHead>
        <TableHead className="hidden md:table-cell">Date</TableHead>
      </TableRow>
    </TableHeader>
  );
};

const FileRow = ({
  file,
  setCurrentFile,
  currentFile,
}: {
  file: any;
  email: string;
  setCurrentFile: (file: any) => void;
  currentFile: any;
}) => {
  return (
    <TableRow
      onMouseEnter={() => setCurrentFile(file)}
      className={`hover:bg-blue-100 cursor-pointer ${
        currentFile?.id === file.id ? "bg-blue-100" : ""
      }`}
    >
      <TableCell>
        <div className="flex flex-row justify-start gap-4">
          <FileMediaIcon fileExt={file.metadata.extension + ""} />
          <div className="font-medium">{file.file_name}</div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant="secondary">{file.metadata.extension}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(file.created_at)}
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

  const handleFileUpload = (e: any) => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) return;

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
          title: "File Uploaded Successfully",
          description: `File  uploaded successfully`,
          duration: 20000,
        });
      }
    );
  };

  return (
    <div className="ml-auto gap-1">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
        //single file at a time
        multiple={false}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        size="sm"
        variant="default"
      >
        + File
      </Button>
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
