import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Target, ArrowUpDown, RefreshCw } from "lucide-react";
import { CardHeader } from "@/components/ui/card";
import clsx from "clsx";
import { FileUploadButton } from "../Folder/FilesTable/FileUploadButton";
import { AddFolderButton } from "../Folder/FilesTable/AddFolderButton";
import { DocumentSelectorHeaderProps, SortField } from "./types";

export const DocumentSelectorHeader: React.FC<DocumentSelectorHeaderProps> = ({
	currentFolderStructure,
	contextFolder,
	isProjectWide,
	searchTerm,
	setSearchTerm,
	navigateBack,
	setAsContextFolder,
	onCreateFolder,
	onScopeChange,
	onRefresh,
	session,
	activeProject,
	currentFolderId,
	sortField,
	sortDirection,
	onSort,
}) => {
	// Build breadcrumb path from current folder structure
	const getBreadcrumbPath = () => {
		const path = [];
		let current = currentFolderStructure;
		while (current) {
			path.unshift(current.folderName);
			current = current.parent;
		}
		return path.length > 1 ? `/${path.slice(1).join("/")}` : "/";
	};

	const SortButton = ({
		field,
		children,
	}: {
		field: SortField;
		children: React.ReactNode;
	}) => (
		<Button
			className="hover:bg-transparent"
			onClick={() => onSort(field)}
			size="sm"
			variant="ghost"
		>
			{children}
			{sortField === field && (
				<ArrowUpDown
					className={`ml-1 h-3 w-3 ${
						sortDirection === "desc" ? "transform rotate-180" : ""
					}`}
				/>
			)}
		</Button>
	);

	return (
		<CardHeader className="flex justify-between items-center">
			<div className="flex items-center gap-2 w-full">
				<Button
					className="flex items-center gap-2"
					disabled={!currentFolderStructure?.parent}
					onClick={navigateBack}
					variant="ghost"
				>
					<ArrowLeft size={16} />
				</Button>
				<div className="text-sm text-gray-500 flex-1 min-w-0">
					<div className="truncate">
						{getBreadcrumbPath()}
					</div>
				</div>
				<Button
					className="flex items-center gap-2"
					onClick={onRefresh}
					size="sm"
					title="Refresh folder contents"
					variant="outline"
				>
					<RefreshCw size={16} />
					Refresh
				</Button>
				<AddFolderButton
					activeProject={activeProject}
					folderId={currentFolderId}
					folderName={currentFolderStructure?.folderName || (isProjectWide ? "Project Root" : "Personal Root")}
					isProjectWide={isProjectWide}
					session={session}
				/>
				<FileUploadButton
					activeProject={activeProject}
					folderId={currentFolderId}
					session={session}
				/>
				<Button
					className={clsx(
						"flex items-center gap-2",
						contextFolder.id === currentFolderStructure?.folderId && "bg-indigo-50 border-indigo-200 text-indigo-700",
					)}
					onClick={setAsContextFolder}
					size="sm"
					title={`Set as active folder for chat context${contextFolder.id === currentFolderStructure?.folderId ? " (currently active)" : ""}`}
					variant="outline"
				>
					<Target size={16} />
					{contextFolder.id === currentFolderStructure?.folderId ? "Active Folder" : "Set Active"}
				</Button>
				<Select
					onValueChange={onScopeChange}
					value={isProjectWide ? "project" : "personal"}
				>
					<SelectTrigger className="w-[100px]">
						<SelectValue placeholder="Select Scope" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="project">Project</SelectItem>
						<SelectItem value="personal">Personal</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="mt-4 w-full flex items-center gap-8">
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600">Sort by:</span>
					<SortButton field="name">Name</SortButton>
					<SortButton field="type">Type</SortButton>
					<SortButton field="created_at">Date</SortButton>
				</div>
				<Input
					className="flex-1"
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search files and folders..."
					value={searchTerm}
				/>
			</div>
		</CardHeader>
	);
}; 