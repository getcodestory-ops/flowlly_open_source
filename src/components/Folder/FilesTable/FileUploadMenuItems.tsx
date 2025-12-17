import React from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FileText, Upload } from "lucide-react";

interface FileUploadMenuItemsProps {
  folderId: string;
  session: any;
  activeProject: any;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textFileName: string;
  setTextFileName: (name: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateTextFile: (fileName?: string) => void;
}

export const FileUploadMenuItems: React.FC<FileUploadMenuItemsProps> = ({
	folderId,
	session,
	activeProject,
	fileInputRef,
	textFileName,
	setTextFileName,
	handleFileUpload,
	handleCreateTextFile,
}) => {
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

	// Text file popover content
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
					if (e.key === "Enter" && textFileName.trim()) {
						handleCreateTextFile(textFileName.trim());
					}
				}}
				placeholder="Enter file name"
				type="text"
				value={textFileName}
			/>
			<Button 
				disabled={!textFileName.trim()}
				onClick={() => handleCreateTextFile(textFileName.trim())}
				size="sm"
			>
				Create File
			</Button>
			</div>
		</PopoverContent>
	);

	// No upload progress modal here - it's handled at the parent level

	return (
		<>
			{fileInput}
			{/* New Text File - Dropdown menu item with popover */}
			<Popover>
				<PopoverTrigger asChild>
					<DropdownMenuItem className="h-8 px-3 text-xs hover:bg-gray-100" onSelect={(e) => e.preventDefault()}>
						<FileText className="mr-2" size={14} />
						New text file
					</DropdownMenuItem>
				</PopoverTrigger>
				{textFilePopoverContent}
			</Popover>
			{/* Upload Files - Simple dropdown menu item */}
			<DropdownMenuItem 
				className="h-8 px-3 text-xs hover:bg-gray-100"
				onClick={() => {
					fileInputRef.current?.click();
				}}
				onSelect={(e) => e.preventDefault()}
			>
				<Upload className="mr-2" size={14} />
				Upload file
			</DropdownMenuItem>
		</>
	);
};
