"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import { useDocumentStore, CurrentFolderStructure } from "@/hooks/useDocumentStore";
import { clsx } from "clsx";
import { FilesContent } from "../Folder/FilesTable";
import InteractiveChatPanel from "../ChatInput/PlatformChat/InteractiveChatPanel";
import { StorageResourceEntity } from "@/types/document";

export const DocumentFolderModule = () : React.ReactNode => {
	return (
		<div className="h-full p-4 rounded-lg flex items-start">
			<DatabasePageLayout />
		</div>
	);
};

export function DatabasePageLayout() : React.ReactNode {
	const queryClient = useQueryClient();
	const { activeProject, session } = useStore();
	const { 
		rootId, 
		setRootId, 
		isProjectWide, 
		setProjectContext,
		currentFolderStructure,
		setCurrentFolderStructure,
	} = useDocumentStore();
	const { tabs } = useChatStore();
	const hasOpenTabs = tabs.filter((t) => t.type !== "chat").length > 0;
	const [panelWidth, setPanelWidth] = useState(50); // Percentage width for the main content
	const [isDragging, setIsDragging] = useState(false);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		
		const container = document.querySelector(".resizable-container") as HTMLElement;
		if (!container) return;
		
		const containerRect = container.getBoundingClientRect();
		const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
		
		// Constrain the width between 20% and 80%
		const constrainedWidth = Math.min(Math.max(newWidth, 20), 80);
		setPanelWidth(constrainedWidth);
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		} else {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isDragging]);

	// Set project context when activeProject changes
	useEffect(() => {
		if (activeProject?.project_id) {
			setProjectContext(activeProject.project_id, isProjectWide);
		}
	}, [activeProject?.project_id, isProjectWide, setProjectContext]);

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
							setRootId(rootFolder.id, rootFolder.name);
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

	if (!hasOpenTabs) {
		return (
			<div className="flex flex-1 h-full">
				<div className="w-full">
					<div className="flex w-full flex-col">
						<Tabs
							className="pb-4"
							defaultValue="project"
							onValueChange={(value) => {
								const newIsProjectWide = value === "project";
								if (activeProject?.project_id) {
									setProjectContext(activeProject.project_id, newIsProjectWide);
								}
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
			</div>
		);
	}

	return (
		<div className="flex flex-1 h-full resizable-container">
			<div 
				className={clsx(
					"flex-shrink-0",
					!isDragging && "transition-all duration-200 ease-in-out",
				)}
				style={{ width: `${panelWidth}%` }}
			>
				<div className="flex w-full flex-col">
					<Tabs
						className="pb-4"
						defaultValue="project"
						onValueChange={(value) => {
							const newIsProjectWide = value === "project";
							if (activeProject?.project_id) {
								setProjectContext(activeProject.project_id, newIsProjectWide);
							}
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
			<div
				className={clsx(
					"w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex-shrink-0",
					!isDragging && "transition-colors duration-200",
					isDragging && "bg-blue-500",
				)}
				onMouseDown={handleMouseDown}
			>
				<div className="w-full h-full flex items-center justify-center">
					<div className="w-0.5 h-8 bg-gray-400 rounded-full opacity-60" />
				</div>
			</div>
			<div 
				className={clsx(
					"flex-shrink-0",
					!isDragging && "transition-all duration-200 ease-in-out",
				)}
				style={{ width: `${100 - panelWidth}%` }}
			>
				<InteractiveChatPanel />
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
						isCurrent
						setCurrentFolderStructure={setCurrentFolderStructure}
					/>
				</BreadcrumbList>
			</Breadcrumb>
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
	
	// Use document store for caching and state management
	const {
		getSubFoldersForFolder,
		getFilesForFolder,
		setSubFolders,
		setFiles,
		loadingFolders,
		loadingFiles,
		setFolderLoading,
		setFilesLoading,
		isFolderLoaded,
		navigateToFolder,
		rootId,
		getScopedFolderKey,
	} = useDocumentStore();

	const cacheFolderKey = getScopedFolderKey(currentFolderStructure.folderId);
	const apiFolderId = currentFolderStructure.folderId === "root"
		? rootId
		: currentFolderStructure.folderId;

	// Get cached data
	const cachedSubFolders = getSubFoldersForFolder(currentFolderStructure.folderId);
	const cachedFiles = getFilesForFolder(currentFolderStructure.folderId);
	const isFolderDataLoaded = isFolderLoaded(currentFolderStructure.folderId);
	const isFolderPending = loadingFolders.has(cacheFolderKey);
	const isFilePending = loadingFiles.has(cacheFolderKey);

	// Fetch subfolders
	const { data: subFolders } = useQuery({
		queryKey: [
			`fetchProjectFolders-${currentFolderStructure.folderId}`,
			activeProject?.project_id,
			session,
			currentFolderStructure.folderId,
		],
		queryFn: async() => {
			setFolderLoading(currentFolderStructure.folderId, true);
			try {
				const data = await fetchFolders(
					session,
					activeProject?.project_id,
					apiFolderId ?? null,
					isProjectWide,
				);
				setSubFolders(currentFolderStructure.folderId, data);
				return data;
			} finally {
				setFolderLoading(currentFolderStructure.folderId, false);
			}
		},
		enabled: !!session && !!activeProject && (!!apiFolderId || currentFolderStructure.folderId === "root") && !cachedSubFolders,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch files
	useQuery({
		queryKey: [
			`fetchFiles-${currentFolderStructure.folderId}`,
			activeProject?.project_id,
			session,
			currentFolderStructure.folderId,
			isProjectWide,
		],
		queryFn: async() => {
			setFilesLoading(currentFolderStructure.folderId, true);
			try {
				const data = await fetchFiles(
					session,
					activeProject?.project_id,
					apiFolderId ?? null,
					isProjectWide,
					(data: GetFolderFileProp[]) => {
						if (!data || !data.length || !data[0].storage_relations) return;
						const filesData = data[0].storage_relations
							.map((file) => file.storage_resources)
							.filter((file): file is StorageResourceEntity => file !== undefined);
						setFiles(currentFolderStructure.folderId, filesData);
					},
				);
				return data;
			} finally {
				setFilesLoading(currentFolderStructure.folderId, false);
			}
		},
		enabled: !!session && !!activeProject && (!!apiFolderId || currentFolderStructure.folderId === "root") && !cachedFiles,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Use cached data if available, otherwise use query data
	const displaySubFolders = cachedSubFolders || subFolders || [];
	const displayFiles = cachedFiles || [];

	if (!currentFolderStructure.folderId) return <></>;
	if (isFilePending || isFolderPending)
		return (
			<div className="w-full p-4 text-[20px] flex flex-col">Loading...</div>
		);
		
	return (
		<div className="w-full p-4">
			<FilesContent
				activeProject={activeProject}
				files={displayFiles}
				folderId={currentFolderStructure.folderId}
				folderName={currentFolderStructure.folderName}
				folders={displaySubFolders}
				isProjectWide={isProjectWide}
				onFolderClick={(folderId, folderName) => {
					if (folderId === "root" || folderName === "root") return;
					navigateToFolder(folderId, folderName);
				}}
				session={session}
			/>
		</div>
	);
};


