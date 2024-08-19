import React from "react";
import { Flex } from "@chakra-ui/react";
import Link from "next/link";
import { FileSearch } from "lucide-react";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  fetchFolders,
  fetchFiles,
  createSubFolder,
  uploadFileInFolder,
  GetFolderFileProp,
  GetFolderSubFolderProp,
} from "@/api/folderRoutes";
import { AddNewFolderModal } from "../CreateNewFolderModal/CreateNewFolderModal";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Folder } from "lucide-react";

//store zustang
import { useStore } from "@/utils/store";

import { Search } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Input } from "@/components/ui/input";

import { Progress } from "@/components/ui/progress";

import DocumentViewer from "../Folder/DocumentViewer";

const DocumentModule = () => {
  return (
    <Flex flexDir="column" w="full" height="100%">
      <DocumentViewer />
    </Flex>
  );
};

export default DocumentModule;

export const DocumentFolderModule = () => {
  return (
    <div className="h-full overflow-y-scroll custom-scrollbar p-4 rounded-lg flex items-start">
      <DatabasePageLayout />
    </div>
  );
};

export function DatabasePageLayout() {
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));
  const [rootId, setRootId] = useState<string | null>(null);
  const [isProjectWide, setIsProjectWide] = useState<boolean>(true);
  const [currentFolderStructure, setCurrentFolderStructure] =
    useState<CurrentFolderStructure | null>(null);

  useQuery({
    queryKey: [
      `fetchProjectFolders-${rootId}`,
      activeProject?.project_id,
      session,
      isProjectWide,
    ],
    queryFn: () => {
      if (session && session.access_token && activeProject) {
        return fetchFolders(
          session,
          activeProject.project_id,
          null,
          isProjectWide,
          (data) => {
            const rootFolder = data.find(
              (folder: GetFolderSubFolderProp) => folder.name === "root"
            );
            if (rootFolder) {
              setRootId(rootFolder.id);
              setCurrentFolderStructure({
                folderId: rootFolder.id,
                folderName: isProjectWide
                  ? "Project Database"
                  : "Personal Database",
                depth: 0,
                parent: null,
              });
            }
          }
        );
      }
      return Promise.reject("No session or access token");
    },
    enabled: !!session && !!activeProject,
  });

  if (!session) {
    return <div>on different page session not found</div>;
  }
  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1 p-4 ">
        <div className="flex w-full flex-col">
          <Tabs
            defaultValue="project"
            className="pb-4"
            onValueChange={(value) => {
              setIsProjectWide(value === "project");
            }}
          >
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="project">Project</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          {currentFolderStructure && (
            <DatabaseHeader
              currentFolderStructure={currentFolderStructure}
              setCurrentFolderStructure={setCurrentFolderStructure}
            />
          )}
          {rootId && currentFolderStructure && (
            <div className="flex items-center pl-2">
              <FolderDetails
                session={session}
                activeProject={activeProject}
                currentFolderStructure={currentFolderStructure}
                setCurrentFolderStructure={setCurrentFolderStructure}
                isProjectWide={isProjectWide}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FolderDetailsProp {
  session: any;
  activeProject: any;
  currentFolderStructure: CurrentFolderStructure;
  setCurrentFolderStructure: { (val: CurrentFolderStructure): void };
}

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
    <div className="absolute right-4">
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

const DatabaseHeader = ({
  currentFolderStructure,
  setCurrentFolderStructure,
}: {
  currentFolderStructure: CurrentFolderStructure;
  setCurrentFolderStructure: { (val: CurrentFolderStructure): void };
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbName
            currentFolderStructure={currentFolderStructure}
            setCurrentFolderStructure={setCurrentFolderStructure}
            isCurrent={true}
          />
        </BreadcrumbList>
      </Breadcrumb>
      {/* <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search ..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div> */}
    </header>
  );
};

const BreadcrumbName = ({
  currentFolderStructure,
  setCurrentFolderStructure,
  isCurrent,
}: {
  currentFolderStructure: CurrentFolderStructure;
  setCurrentFolderStructure: { (val: CurrentFolderStructure): void };
  isCurrent: boolean;
}) => {
  return (
    <>
      {currentFolderStructure.parent && (
        <BreadcrumbName
          currentFolderStructure={currentFolderStructure.parent}
          setCurrentFolderStructure={setCurrentFolderStructure}
          isCurrent={false}
        />
      )}

      <BreadcrumbItem
        onClick={() => setCurrentFolderStructure(currentFolderStructure)}
      >
        {isCurrent ? (
          <BreadcrumbPage className="text-[30px]">
            {currentFolderStructure.folderName}
          </BreadcrumbPage>
        ) : (
          <BreadcrumbLink className="text-[30px]" asChild>
            <Link href="#">{currentFolderStructure.folderName}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      <BreadcrumbSeparator />
    </>
  );
};

type CurrentFolderStructure = {
  folderId: string;
  folderName: string;
  depth: number;
  parent: CurrentFolderStructure | null;
};

const FolderDetails: React.FC<
  FolderDetailsProp & { isProjectWide: boolean }
> = ({
  session,
  activeProject,
  currentFolderStructure,
  setCurrentFolderStructure,
  isProjectWide,
}) => {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<any[]>([]);

  const { data: subFolders, isPending: isFolderPending } = useQuery({
    queryKey: [
      `fetchProjectFolders-${currentFolderStructure.folderId}`,
      activeProject?.project_id,
      session,
      currentFolderStructure.folderId,
    ],
    queryFn: () =>
      fetchFolders(
        session,
        activeProject?.project_id,
        currentFolderStructure.folderId,
        isProjectWide
      ),
    enabled: !!session && !!activeProject && !!currentFolderStructure.folderId,
  });

  const { isPending: isFilePending } = useQuery({
    queryKey: [
      `fetchFiles-${currentFolderStructure.folderId}`,
      activeProject?.project_id,
      session,
      currentFolderStructure.folderId,
      isProjectWide,
    ],
    queryFn: () => {
      return fetchFiles(
        session,
        activeProject?.project_id,
        currentFolderStructure.folderId,
        isProjectWide,
        (data: GetFolderFileProp[]) => {
          if (!data || !data.length || !data[0].storage_relations) return;
          const filesData = data[0].storage_relations.map(
            (file) => file.storage_resources
          );
          setFiles(filesData);
        }
      );
    },
    enabled: !!session && !!activeProject && !!currentFolderStructure.folderId,
  });

  if (!currentFolderStructure.folderId || !subFolders) return <></>;
  if (isFilePending || isFolderPending)
    return (
      <div className="w-full p-4 text-[20px] flex flex-col">Loading...</div>
    );
  return (
    <div className="w-full p-4">
      <div className="grid gap-[20px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-6">
        <AddNewFolderModal
          parentFolderName={currentFolderStructure.folderName ?? "Other"}
          onAdd={(name) => {
            if (!activeProject) return;
            createSubFolder(
              session,
              activeProject.project_id,
              name,
              currentFolderStructure.folderId,
              (data: GetFolderSubFolderProp) => {
                queryClient.invalidateQueries({
                  queryKey: [
                    `fetchProjectFolders-${currentFolderStructure.folderId}`,
                  ],
                });
              }
            );
          }}
        >
          <Button variant="outline" className="h-15 text-md">
            + Add Folder
          </Button>
        </AddNewFolderModal>
        {subFolders.map((folder, i) => (
          <CategoryFolder
            key={i}
            categoryName={folder.name}
            onClick={() => {
              setCurrentFolderStructure({
                folderId: folder.id,
                folderName: folder.name,
                depth: currentFolderStructure.depth + 1,
                parent: currentFolderStructure,
              });
            }}
            date={folder.created_at}
            depth={currentFolderStructure.depth}
          />
        ))}
      </div>
      <FilesContent
        files={files}
        folderId={currentFolderStructure.folderId}
        session={session}
        activeProject={activeProject}
      />
    </div>
  );
};

const CategoryFolder = ({
  categoryName,
  onClick,
  date,
  depth,
}: {
  categoryName: string;
  onClick: () => void;
  date: string;
  depth: number;
}) => {
  return (
    <div className="rounded-lg shadow-md hover:shadow-lg transition-shadow w-full hover:cursor-pointer relative">
      {false && (
        <>
          <Card
            className="hover:bg-blue-100  hover:border-blue-500"
            onClick={onClick}
          >
            <CardHeader className="pb-2">
              <CardDescription>{timeAgo(date)}</CardDescription>
              <CardTitle className="max-h-full flex flex-row items-center gap-3">
                <Folder className="w-8" />
                <div className="text-2xl max-h-full overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                  {categoryName}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +25% from last week
              </div>
            </CardContent>
            <CardFooter>
              <Progress value={25} aria-label="25% increase" />
            </CardFooter>
          </Card>
          {/* <div className="absolute top-2 right-1 rounded-full hover:bg-muted p-1">
            <FolderOptions
              folderName={categoryName}
              onDelete={() => console.log("delete")}
            />
          </div> */}
        </>
      )}
      {true && (
        <Card
          className="hover:bg-blue-100  hover:border-blue-500 h-auto p-0"
          onClick={onClick}
        >
          <CardHeader>
            <CardTitle className="max-h-full flex flex-row items-center gap-3 p-0">
              <Folder className="w-4" />
              <div className="text-lg max-h-full overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {categoryName}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

const FilesContent = ({
  files,
  folderId,
  session,
  activeProject,
}: {
  files: any[];
  folderId: string;
  session: any;
  activeProject: any;
}) => {
  return (
    <Card x-chunk="dashboard-05-chunk-3" className="relative">
      <CardHeader>
        <CardTitle>All Files</CardTitle>
        <CardDescription>
          Recent files in the selected category.
        </CardDescription>
        <AddFileInFolderButton
          folderId={folderId}
          session={session}
          activeProject={activeProject}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">File Name</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">AI</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, i) => (
              <FileRow key={i} file={file} email={session.user.email} />
            ))}
            {files.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <div className="flex flex-col items-center justify-center pt-8">
                    <FileSearch className="w-20 h-20 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-500">
                      No files found
                    </p>
                    <p className="text-sm text-gray-400">
                      It looks like there are no files here. Try uploading or
                      checking back later.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const FileRow = ({ file, email }: { file: any; email: string }) => {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{file.file_name}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {email}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {file.metadata.extension}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge className="text-xs" variant="outline">
          Processing
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(file.created_at)}
      </TableCell>
    </TableRow>
  );
};

function formatDate(dateString: string): string {
  // Create a new Date object from the input date string
  const date = new Date(dateString);

  // Define arrays for month and AM/PM strings
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Extract the month, day, year, and time components
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour format to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Format minutes to be always two digits
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  // Construct the formatted date string
  const formattedDate = `${month} ${day}, ${year} ${hours}:${formattedMinutes} ${ampm}`;

  return formattedDate;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 }, // 1 year = 365 * 24 * 60 * 60
    { label: "m", seconds: 2592000 }, // 1 month = 30 * 24 * 60 * 60
    { label: "wk", seconds: 604800 }, // 1 week = 7 * 24 * 60 * 60
    { label: "d", seconds: 86400 }, // 1 day = 24 * 60 * 60
    { label: "h", seconds: 3600 }, // 1 hour = 60 * 60
    { label: "m", seconds: 60 }, // 1 minute = 60
    { label: "s", seconds: 1 }, // 1 second
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `Created ${count}${interval.label} ago`;
    }
  }

  return "Created just now";
}
