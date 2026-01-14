import React, { useRef, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
	ArrowLeft, 
	RefreshCw, 
	FolderPlus, 
	Search,
	SortAsc,
	SortDesc,
	Building2,
	User,
	Menu,
	ChevronDown
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AddNewFolderModal } from "../CreateNewFolderModal/CreateNewFolderModal";
import { createSubFolder } from "@/api/folderRoutes";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { FileUploadButton } from "../Folder/FilesTable/FileUploadButton";
import { FileUploadMenuItems } from "../Folder/FilesTable/FileUploadMenuItems";
import { useFileUpload } from "../Folder/FilesTable/useFileUpload";
import { FileUploadProgress } from "../Folder/FilesTable/FileUploadProgress";
import clsx from "clsx";
import { DocumentSelectorHeaderProps, SortField } from "./types";

export const DocumentSelectorHeader: React.FC<DocumentSelectorHeaderProps> = ({
	currentFolderStructure,
	isProjectWide,
	searchTerm,
	setSearchTerm,
	navigateBack,
	onScopeChange,
	onRefresh,
	session,
	activeProject,
	currentFolderId,
	sortField,
	sortDirection,
	onSort,
}) => {
	const toolbarRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();
	const { addFolder } = useDocumentStore();
	const [containerWidth, setContainerWidth] = useState(1200);
	const [isCreateFileDialogOpen, setIsCreateFileDialogOpen] = useState(false);
	
	// File upload state management - lifted to this level so it persists when dropdown closes
	const {
		textFileName,
		uploadingFiles,
		showUploadProgress,
		fileInputRef,
		setTextFileName,
		handleFileUpload,
		handleCreateTextFile,
		closeUploadProgress,
	} = useFileUpload(currentFolderId, session, activeProject, isProjectWide);

	const handleCreateFile = () => {
		if (textFileName.trim()) {
			handleCreateTextFile(textFileName.trim());
			setIsCreateFileDialogOpen(false);
			setTextFileName("");
		}
	};

	const COLLAPSE_BREAKPOINT = 750; // Start collapsing at this container width (more conservative)
	const FULL_COLLAPSE_BREAKPOINT = 500; // Collapse everything except essentials

	useEffect(() => {
		if (!toolbarRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContainerWidth(entry.contentRect.width);
			}
		});

		resizeObserver.observe(toolbarRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	// Clear search term when folder changes
	useEffect(() => {
		setSearchTerm("");
	}, [currentFolderId, setSearchTerm]);

	// Build breadcrumb path from current folder structure
	const getBreadcrumbPath = (): string => {
		const path = [];
		let current = currentFolderStructure;
		while (current) {
			path.unshift(current.folderName);
			current = current.parent;
		}
		return path.length > 1 ? `/${path.slice(1).join("/")}` : "/";
	};

	const handleAddFolder = (name: string): void => {
		if (!activeProject) return;
		
		createSubFolder(
			session,
			activeProject.project_id,
			name,
			currentFolderId,
			isProjectWide,
			(data) => {
				addFolder(currentFolderId, data);
				queryClient.setQueryData(
					["folders", session?.access_token, activeProject?.project_id, currentFolderId, isProjectWide],
					(oldData: any) => {
						if (!oldData) return [data];
						return [...oldData, data];
					},
				);
			},
		);
	};

	// Determine what to show based on container width
	const shouldCollapseFileOps = containerWidth < COLLAPSE_BREAKPOINT;
	const shouldCollapseViewOps = containerWidth < FULL_COLLAPSE_BREAKPOINT;

	return (
		<div className="border-b bg-white">
			<div className="flex items-center gap-1 px-4 py-2 min-h-[48px]" ref={toolbarRef}>
				{/* Navigation Group - Always visible */}
				<div className="flex items-center gap-1">
					<Button
						className="h-8 w-8 p-0 hover:bg-gray-100"
						disabled={!currentFolderStructure?.parent}
						onClick={navigateBack}
						size="sm"
						title="Back"
						variant="ghost"
					>
						<ArrowLeft size={14} />
					</Button>
				</div>
				<div className="flex-1 min-w-0 px-3">
					<div className="text-sm text-gray-700 truncate font-medium">
						{getBreadcrumbPath()}
					</div>
				</div>
				{/* Menu Button - Shows when items are collapsed */}
				{(shouldCollapseFileOps || shouldCollapseViewOps) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-8 px-3 text-xs hover:bg-gray-100"
								size="sm"
								title="Menu"
								variant="ghost"
							>
								<Menu className="mr-1" size={14} />
								Menu
								<ChevronDown className="ml-1" size={12} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{/* File Operations in Menu */}
							{shouldCollapseFileOps && (
								<>
									<AddNewFolderModal
										onAdd={handleAddFolder}
										parentFolderName={currentFolderStructure?.folderName || (isProjectWide ? "Project Root" : "Personal Root")}
									>
										<DropdownMenuItem className="h-8 px-3 text-xs hover:bg-gray-100 " onSelect={(e) => e.preventDefault()}>
											<FolderPlus className="mr-1" size={14} />
											New folder
										</DropdownMenuItem>
									</AddNewFolderModal>
									<FileUploadMenuItems
										fileInputRef={fileInputRef}
										handleFileUpload={handleFileUpload}
										onNewFileClick={() => setIsCreateFileDialogOpen(true)}
									/>
									{shouldCollapseViewOps && <DropdownMenuSeparator />}
								</>
							)}
							{shouldCollapseViewOps && (
								<>
									<DropdownMenuItem onClick={onRefresh}>
										<RefreshCw className="mr-2" size={14} />
										Refresh
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => onScopeChange(isProjectWide ? "personal" : "project")}>
										{isProjectWide ? (
											<>
												<User className="mr-2" size={14} />
												Switch to Personal
											</>
										) : (
											<>
												<Building2 className="mr-2" size={14} />
												Switch to Project
											</>
										)}
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
				{!shouldCollapseFileOps && (
					<>
						<div className="flex items-center gap-1">
							<AddNewFolderModal
								onAdd={handleAddFolder}
								parentFolderName={currentFolderStructure?.folderName || (isProjectWide ? "Project Root" : "Personal Root")}
							>
								<Button
									className="h-8 px-3 text-xs hover:bg-gray-100"
									size="sm"
									title="New folder"
									variant="ghost"
								>
									<FolderPlus className="mr-1" size={14} />
									New folder
								</Button>
							</AddNewFolderModal>
							<FileUploadButton
								activeProject={activeProject}
								folderId={currentFolderId}
								session={session}
							/>
						</div>
						<Separator className="h-6 mx-1" orientation="vertical" />
					</>
				)}
				{!shouldCollapseViewOps && (
					<>
						<div className="flex items-center gap-1">
							<Button
								className="h-8 w-8 p-0 hover:bg-gray-100"
								onClick={onRefresh}
								size="sm"
								title="Refresh"
								variant="ghost"
							>
								<RefreshCw size={14} />
							</Button>
							<div className="flex items-center border rounded-md">
								<Button
									className={clsx(
										"h-8 px-3 text-xs rounded-r-none border-0",
										isProjectWide 
											? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
											: "bg-transparent hover:bg-gray-100",
									)}
									onClick={() => onScopeChange("project")}
									size="sm"
									title="Show project-wide files and folders"
									variant="ghost"
								>
									<Building2 className="mr-1" size={12} />
									Project
								</Button>
								<Button
									className={clsx(
										"h-8 px-3 text-xs rounded-l-none border-0 border-l",
										!isProjectWide 
											? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
											: "bg-transparent hover:bg-gray-100",
									)}
									onClick={() => onScopeChange("personal")}
									size="sm"
									title="Show your personal files and folders"
									variant="ghost"
								>
									<User className="mr-1" size={12} />
									Personal
								</Button>
							</div>
						</div>
						<Separator className="h-6 mx-1" orientation="vertical" />
					</>
				)}
				<div className={clsx(
					"flex items-center gap-2",
					shouldCollapseViewOps ? "min-w-[120px]" : "min-w-[180px]",
				)}
				>
					<div className="relative flex-1">
						<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
						<Input
							className="h-8 pl-7 text-xs"
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search files..."
							value={searchTerm}
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-4 px-4 py-1 bg-gray-50/50 border-t">
				<span className="text-xs text-gray-600 font-medium">Sort:</span>
				<div className="flex items-center gap-1">
					{[
						{ field: "name" as SortField, label: "Name" },
						{ field: "type" as SortField, label: "Type" },
						{ field: "created_at" as SortField, label: "Date" },
					].map(({ field, label }) => (
						<Button
							className={clsx(
								"h-6 px-2 text-xs hover:bg-gray-100",
								sortField === field && "bg-gray-100 text-gray-900 font-medium",
							)}
							key={field}
							onClick={() => onSort(field)}
							size="sm"
							variant="ghost"
						>
							{label}
							{sortField === field && (
								sortDirection === "asc" ? 
									<SortAsc className="ml-1" size={12} /> : 
									<SortDesc className="ml-1" size={12} />
							)}
						</Button>
					))}
				</div>
			</div>
			{/* File upload progress modal - rendered at header level so it persists */}
			{showUploadProgress && uploadingFiles.length > 0 && (
				<FileUploadProgress
					files={uploadingFiles}
					onClose={closeUploadProgress}
				/>
			)}

			{/* Create File Dialog - rendered outside dropdown to avoid focus issues */}
			<Dialog open={isCreateFileDialogOpen} onOpenChange={setIsCreateFileDialogOpen}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Create File</DialogTitle>
						<DialogDescription>
							Enter name - file.docx
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-3">
						<Input
							onChange={(e) => setTextFileName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && textFileName.trim()) {
									handleCreateFile();
								}
							}}
							placeholder="Enter file name"
							type="text"
							value={textFileName}
							autoFocus
						/>
						<Button 
							disabled={!textFileName.trim()}
							onClick={handleCreateFile}
							size="sm"
						>
							Create File
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}; 