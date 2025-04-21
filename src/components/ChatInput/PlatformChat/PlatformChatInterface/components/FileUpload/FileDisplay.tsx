import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File, X } from "lucide-react";
import { FileUploadStatus } from "../../types";

interface FileDisplayProps {
  uploadingFiles: FileUploadStatus[];
  onRemoveFile: (index: number) => void;
}

export const FileDisplay: React.FC<FileDisplayProps> = ({ uploadingFiles, onRemoveFile }) => {
	const successfulFiles = uploadingFiles.filter((file) => file.status === "success");

	if (successfulFiles.length === 0) return null;

	return (
		<div className="px-4 pb-3">
			<div className="flex flex-wrap gap-2 mt-2">
				{successfulFiles.map((file, index) => {
					const originalIndex = uploadingFiles.findIndex(
						(f) => f.file.name === file.file.name && f.status === "success",
					);
          
					return (
						<Badge
							className="py-1.5 px-3 bg-indigo-50/70 text-indigo-600 hover:bg-indigo-50 border border-indigo-100/50 rounded-lg"
							key={index}
							variant="secondary"
						>
							<File className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
							<span className="truncate max-w-[150px]">{file.file.name}</span>
							<Button
								className="h-5 w-5 p-0 ml-1.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700"
								onClick={() => onRemoveFile(originalIndex)}
								size="sm"
								variant="ghost"
							>
								<X className="h-3 w-3" />
							</Button>
						</Badge>
					);
				})}
			</div>
		</div>
	);
};

export default FileDisplay; 