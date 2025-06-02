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
import { FilePlus, FileText } from "lucide-react";

interface FileUploadButtonProps {
  folderId: string;
  session: any;
  activeProject: any;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
	folderId,
	session,
	activeProject,
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

	return (
		<div className="ml-auto flex gap-2">
			<input
				accept=".bmp,.csv,.doc,.docx,.eml,.epub,.heic,.html,.jpeg,.png,.md,.msg,.odt,.org,.p7s,.pdf,.png,.ppt,.pptx,.rst,.rtf,.tiff,.txt,.tsv,.xls,.xlsx,.xml,.tif,.mp3"
				multiple
				onChange={handleFileUpload}
				ref={fileInputRef}
				style={{ display: "none" }}
				type="file"
			/>
			<Button
				className="gap-2"
				onClick={() => fileInputRef.current?.click()}
				size="sm"
				variant="outline"
			>
				<FilePlus size={16} />
				Upload Files
			</Button>
			<Popover>
				<PopoverTrigger asChild>
					<Button className="gap-2"
						size="sm"
						variant="outline"
					>
						<FileText size={16} />
						Text File
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80">
					<div className="flex flex-col gap-4">
						<Input
							onChange={(e) => setTextFileName(e.target.value)}
							placeholder="Enter file name"
							type="text"
							value={textFileName}
						/>
						<Button onClick={handleCreateTextFile}>Create Document</Button>
					</div>
				</PopoverContent>
			</Popover>
			{/* File Upload Progress Modal */}
			{showUploadProgress && uploadingFiles.length > 0 && (
				<FileUploadProgress
					files={uploadingFiles}
					onClose={closeUploadProgress}
				/>
			)}
		</div>
	);
}; 