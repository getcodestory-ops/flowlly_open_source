import React from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useFileUpload } from "./useFileUpload";
import { FileUploadProgress } from "./FileUploadProgress";
import { FilePlus, FileText, Upload } from "lucide-react";
import clsx from "clsx";

interface FileUploadButtonProps {
  folderId: string;
  session: any;
  activeProject: any;
  showInToolbar?: boolean;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
	folderId,
	session,
	activeProject,
	showInToolbar = false,
}) => {
	const {
		textFileName,
		uploadingFiles,
		showUploadProgress,
		fileInputRef,
		setTextFileName,
		handleFileUpload,
		handleCreateTextFile,
		closeUploadProgress,
	} = useFileUpload(folderId, session, activeProject);

	// Shared file input - always rendered
	const fileInput = (
		<input
			accept="text/plain,.bmp,.csv,.doc,.docx,.eml,.epub,.heic,.html,.jpeg,.png,.md,.msg,.odt,.org,.p7s,.pdf,.png,.ppt,.pptx,.rst,.rtf,.tiff,.txt,.tsv,.xls,.xlsx,.xml,.mp4,mp4,.tif,.mp3,.json,.xml,.jsonl,.jsonl.gz,.jsonl.bz2,.jsonl.zip,.jsonl.tar,.jsonl.tar.gz,.jsonl.tar.bz2,.jsonl.tar.zip,.jsonl.tar.tar.gz,.jsonl.tar.tar.bz2,.jsonl.tar.tar.zip,.wav,wav"
			multiple
			onChange={handleFileUpload}
			ref={fileInputRef}
			style={{ display: "none" }}
			type="file"
		/>
	);

	// Shared text file popover content
	const textFilePopoverContent = (
		<PopoverContent className="w-80">
			<div className="flex flex-col gap-3">
				<div className="space-y-2">
					<h4 className="font-medium">Create Text File</h4>
					<p className="text-sm text-muted-foreground">
						Enter a name for your new text file
					</p>
				</div>
				<Input
					onChange={(e) => setTextFileName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleCreateTextFile();
						}
					}}
					placeholder="Enter file name"
					type="text"
					value={textFileName}
				/>
				<Button 
					disabled={!textFileName.trim()}
					onClick={handleCreateTextFile}
					size="sm"
				>
					Create File
				</Button>
			</div>
		</PopoverContent>
	);

	// File upload progress modal
	const uploadProgressModal = showUploadProgress && uploadingFiles.length > 0 && (
		<FileUploadProgress
			files={uploadingFiles}
			onClose={closeUploadProgress}
		/>
	);

	return (
		<>
			{fileInput}
			<div className={clsx("flex  gap-1", showInToolbar ? "flex-col items-start " : "flex-row items-center ")}>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							className="h-8 px-3 text-xs hover:bg-gray-100"
							size="sm"
							title="Create text file"
							variant="ghost"
						>
							<FileText className="mr-1" size={14} />
								New text file
						</Button>
					</PopoverTrigger>
					{textFilePopoverContent}
				</Popover>
				<Button
					className="h-8 px-3 text-xs hover:bg-gray-100"
					onClick={() => {
						fileInputRef.current?.click();
					}}
					size="sm"
					title="Upload files"
					variant="ghost"
				>
					<Upload className="mr-1" size={14} />
						Upload
				</Button>
			</div>
			{uploadProgressModal}
		</>
	);
}; 