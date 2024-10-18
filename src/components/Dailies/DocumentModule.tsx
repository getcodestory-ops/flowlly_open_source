"use client";

import React from "react";
import Link from "next/link";
import { FileSearch } from "lucide-react";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

//components
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  GetFolderFileProp,
  GetFolderSubFolderProp,
} from "@/api/folderRoutes";
import { AddNewFolderModal } from "../CreateNewFolderModal/CreateNewFolderModal";
import { useQuery } from "@tanstack/react-query";
import { Folder } from "lucide-react";

//store zustang
import { useStore } from "@/utils/store";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Progress } from "@/components/ui/progress";

import { FilesContent } from "../Folder/FilesTable";

export const DocumentFolderModule = () => {
  return (
    <div className="h-full container  p-4 rounded-lg flex items-start">
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
              isProjectWide,
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
    </div>
  );
};

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
