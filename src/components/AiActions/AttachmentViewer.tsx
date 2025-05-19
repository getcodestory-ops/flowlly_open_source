import React from "react";
import { File, FileImage, FileText, FileArchive, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/hooks/useChatStore";

interface Attachment {
    resource_id: string;
    resource_name: string;
    extension?: string;
}

interface AttachmentViewerProps {
    files: Attachment[];
    onFileClick?: (file: Attachment) => void;
}

// Function to get appropriate file icon based on extension
const getFileIcon = (extension: string) => {
	const ext = extension.toLowerCase();
	if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"].includes(ext)) {
		return <FileImage className="h-4 w-4 mr-1" />;
	} else if (["doc", "docx", "txt", "rtf", "pdf", ".doc", ".docx", ".txt", ".rtf", ".pdf"].includes(ext)) {
		return <FileText className="h-4 w-4 mr-1" />;
	} else if (["xls", "xlsx", "csv", ".xls", ".xlsx", ".csv"].includes(ext)) {
		return <FileSpreadsheet className="h-4 w-4 mr-1" />;
	} else if (["zip", "rar", "7z", "tar", "gz", ".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) {
		return <FileArchive className="h-4 w-4 mr-1" />;
	} else {
		return <File className="h-4 w-4 mr-1" />;
	}
};

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ files, onFileClick }) => {
	const { setSidePanel, setCollapsed } = useChatStore();

	const handleFileClick = (file: Attachment) => {
		if (onFileClick) {
			onFileClick(file);
		} else {
			setSidePanel({
				isOpen: true,
				type: "sources",
				resourceId: file.resource_id,
				filename: file.resource_name,
			});
			setCollapsed(true);
		}
	};

	if (!files || files.length === 0) return null;

	return (
		<div className="mt-2 mb-2">
			<div className="text-xs text-gray-500 mb-1">Attachments:</div>
			<div className="flex flex-wrap gap-2">
				{files.map((file, index) => (
					<Badge
						className="py-1 px-2 flex items-center cursor-pointer"
						key={index}
						onClick={() => handleFileClick(file)}
						variant="secondary"
					>
						{getFileIcon(file.extension || "")}
						<span className="truncate max-w-[150px]">
							{file.resource_name || file.resource_id}
						</span>
					</Badge>
				))}
			</div>
		</div>
	);
};

export default AttachmentViewer; 