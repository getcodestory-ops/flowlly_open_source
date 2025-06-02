import React from "react";
import { Folder } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/calculations";
import { ExplorerItem } from "./types";
import { StorageResourceEntity } from "@/types/document";

interface FolderRowProps {
	folder: ExplorerItem;
	onFolderClick: (folderId: string, folderName: string) => void;
	setCurrentFile: (resource: StorageResourceEntity | null) => void;
}

export const FolderRow: React.FC<FolderRowProps> = ({
	folder,
	onFolderClick,
	setCurrentFile,
}) => {
	return (
		<TableRow
			className="hover:bg-blue-100 cursor-pointer"
			onClick={() => onFolderClick(folder.id, folder.name)}
			onMouseEnter={() => setCurrentFile(null)}
		>
			<TableCell>
				<div className="flex flex-row justify-start gap-4">
					<Folder className="h-4 w-4" />
					<div className="font-medium">{folder.name}</div>
				</div>
			</TableCell>
			<TableCell className="hidden sm:table-cell">
				<Badge variant="secondary">Folder</Badge>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{formatDate(folder.created_at)}
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{/* Add folder actions if needed */}
			</TableCell>
		</TableRow>
	);
}; 