import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { StorageResourceEntity } from "@/types/document";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PlatformChatComponent from "../../ChatInput/PlatformChat/PlatformChatComponent";
import ChatButton from "../../ChatButton";

// Import our new components and hooks
import {
	FilesTableHeader,
	FileRow,
	FolderRow,
	FileUploadButton,
	EmptyFilesDisplay,
	useFilesTable,
	FilesTableProps,
	AddFolderButton,
} from "./index";

export const FilesTable: React.FC<FilesTableProps> = ({
	files,
	folders,
	folderId,
	folderName,
	session,
	activeProject,
	onFolderClick,
}) => {
	const [currentFile, setCurrentFile] = useState<null | StorageResourceEntity>(null);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const chatRef = useRef<HTMLDivElement>(null);

	// Use our custom hook for table logic
	const {
		currentPage,
		sortField,
		sortDirection,
		searchTerm,
		currentItems,
		totalPages,
		indexOfFirstFile,
		indexOfLastFile,
		totalItems,
		setCurrentPage,
		setSearchTerm,
		handleSort,
	} = useFilesTable(files, folders, 10);

	return (
		<div className="relative">
			<Card className="xl:col-span-3">
				<CardHeader className="flex flex-row items-center">
					<div className="grid gap-2">
						<CardTitle>Files & Folders</CardTitle>
						<CardDescription>Contents of {folderName}</CardDescription>
					</div>
					<div className="ml-auto flex gap-2">
						<AddFolderButton
							activeProject={activeProject}
							folderId={folderId}
							folderName={folderName}
							isProjectWide
							session={session}
						/>
						<FileUploadButton
							activeProject={activeProject}
							folderId={folderId}
							session={session}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							className="max-w-sm"
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search files..."
							value={searchTerm}
						/>
					</div>
					<Table>
						<FilesTableHeader
							onSort={handleSort}
							sortDirection={sortDirection}
							sortField={sortField}
						/>
						<TableBody>
							{currentItems.map((item, i) =>
								item.type === "folder" ? (
									<FolderRow
										folder={item}
										key={`folder-${i}`}
										onFolderClick={onFolderClick}
										setCurrentFile={setCurrentFile}
									/>
								) : (
									<FileRow
										activeProject={activeProject}
										currentFile={currentFile}
										folderId={folderId}
										key={`file-${i}`}
										resource={item as unknown as StorageResourceEntity}
										session={session}
										setCurrentFile={setCurrentFile}
									/>
								),
							)}
							{currentItems.length === 0 && <EmptyFilesDisplay />}
						</TableBody>
					</Table>
					<div className="flex justify-between items-center mt-4">
						<div className="text-sm text-gray-500">
              Showing {indexOfFirstFile + 1}-
							{Math.min(indexOfLastFile, totalItems)} of{" "}
							{totalItems} items
						</div>
						<div className="flex gap-2">
							<Button
								disabled={currentPage === 1}
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								size="sm"
								variant="outline"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								disabled={currentPage === totalPages}
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								size="sm"
								variant="outline"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
			<ChatButton
				isOpen={isChatOpen}
				onClick={() => setIsChatOpen(!isChatOpen)}
				openText={`Chat about ${folderName}`}
				title={
					isChatOpen
						? "Close chat assistant"
						: `Chat with Flowlly AI about ${folderName}`
				}
			/>
			{/* Chat component*/}
			{(isChatOpen || isClosing) && (
				<div
					className={`fixed bottom-2 right-4 w-[calc(100vw-200px)] z-30 bg-white border border-gray-200 rounded-lg  overflow-hidden transition-opacity duration-300 ${
						isClosing ? "opacity-0" : "opacity-100"
					}`}
					ref={chatRef}
				>
					<PlatformChatComponent
						chatTarget="folder"
						folderId={folderId}
					/>
					<div className="fixed p-2 z-50 top-3 ">
						<Button
							onClick={() => {
								setIsClosing(true);
								setTimeout(() => {
									setIsChatOpen(false);
									setIsClosing(false);
								}, 300);
							}}
							size="icon"
							variant="outline"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

// Export with the same name as before for compatibility
export const FilesContent = FilesTable; 