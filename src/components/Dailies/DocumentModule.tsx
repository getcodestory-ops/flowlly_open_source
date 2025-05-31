"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	fetchFolders,
	fetchFiles,
	GetFolderFileProp,
	GetFolderSubFolderProp,
} from "@/api/folderRoutes";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useChatStore } from "@/hooks/useChatStore";
import { clsx } from "clsx";
import { FilesContent } from "../Folder/FilesTable";
import InteractiveChatPanel from "../ChatInput/PlatformChat/InteractiveChatPanel";

export const DocumentFolderModule = () : React.ReactNode => {
	return (
		<div className="h-full p-4 rounded-lg flex items-start">
			<DatabasePageLayout />
		</div>
	);
};

export function DatabasePageLayout() : React.ReactNode {
	const queryClient = useQueryClient();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));
	const { tabs } = useChatStore();
	const hasOpenTabs = tabs.length > 0;
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
							(folder: GetFolderSubFolderProp) => folder.name === "root",
						);
						if (rootFolder) {
							setRootId(rootFolder.id);
							// Only set root folder if no current folder structure exists

							setCurrentFolderStructure({
								folderId: rootFolder.id,
								folderName: isProjectWide
									? "Project Database"
									: "Personal Database",
								depth: 0,
								parent: null,
							});
						}
					},
				);
			}
			return Promise.reject("No session or access token");
		},
		enabled: !!session && !!activeProject,
		refetchOnWindowFocus: false, // Disable automatic refetch on window focus
	});

	if (!session) {
		return <div>on different page session not found</div>;
	}
	return (
		<div className="flex flex-1 h-full">
			<div className={clsx("transition-all duration-500 ease-out", hasOpenTabs ? "w-1/2" : "w-full")}>
				<div className="flex w-full flex-col">
					<Tabs
						className="pb-4"
						defaultValue="project"
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
								activeProject={activeProject}
								currentFolderStructure={currentFolderStructure}
								isProjectWide={isProjectWide}
								session={session}
								setCurrentFolderStructure={setCurrentFolderStructure}
							/>
						</div>
					)}
				</div>
			</div>
			{hasOpenTabs && (
				<div className="transition-all duration-500 ease-out w-1/2 absolute right-2">
					<InteractiveChatPanel />
				</div>
			)}
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
						isCurrent
						setCurrentFolderStructure={setCurrentFolderStructure}
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
					isCurrent={false}
					setCurrentFolderStructure={setCurrentFolderStructure}
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
					<BreadcrumbLink asChild className="text-[30px]">
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
				isProjectWide,
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
						(file) => file.storage_resources,
					);
					setFiles(filesData);
				},
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
			<FilesContent
				activeProject={activeProject}
				files={files}
				folderId={currentFolderStructure.folderId}
				folderName={currentFolderStructure.folderName}
				folders={subFolders || []}
				onFolderClick={(folderId, folderName) => {
					setCurrentFolderStructure({
						folderId,
						folderName,
						depth: currentFolderStructure.depth + 1,
						parent: currentFolderStructure,
					});
				}}
				session={session}
			/>
		</div>
	);
};


