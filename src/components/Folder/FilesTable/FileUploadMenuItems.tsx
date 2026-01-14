import React from "react";
import {
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FileText, Upload } from "lucide-react";

interface FileUploadMenuItemsProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewFileClick: () => void;
}

export const FileUploadMenuItems: React.FC<FileUploadMenuItemsProps> = ({
	fileInputRef,
	handleFileUpload,
	onNewFileClick,
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

	return (
		<>
			{fileInput}
			{/* New Text File - Dropdown menu item that triggers dialog in parent */}
			<DropdownMenuItem 
				className="h-8 px-3 text-xs hover:bg-gray-100"
				onClick={onNewFileClick}
			>
				<FileText className="mr-2" size={14} />
				New file
			</DropdownMenuItem>
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
