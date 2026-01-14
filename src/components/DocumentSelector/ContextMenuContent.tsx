import React from "react";
import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Pencil,
	Trash2,
	FolderInput,
	MessageSquarePlus,
	Eye,
	FolderOutput,
	Copy,
	FolderPlus,
	FilePlus,
	Upload,
} from "lucide-react";

interface ContextMenuContentProps {
	isFolder: boolean;
	onRename: () => void;
	onDelete: () => void;
	onMove: () => void;
	onCopy?: () => void;
	onAddToChat: () => void;
	onView?: () => void;
	onSetOutputFolder?: () => void;
	isOutputFolder?: boolean;
	// Folder operations
	onCreateFolder?: () => void;
	onCreateFile?: () => void;
	onUploadFile?: () => void;
}

export const ContextMenuContent: React.FC<ContextMenuContentProps> = ({
	isFolder,
	onRename,
	onDelete,
	onMove,
	onCopy,
	onAddToChat,
	onView,
	onSetOutputFolder,
	isOutputFolder,
	onCreateFolder,
	onCreateFile,
	onUploadFile,
}) => {
	return (
		<>
			{/* Create/Upload Operations - shown at top */}
			{(onCreateFolder || onCreateFile || onUploadFile) && (
				<>
					{onCreateFolder && (
						<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateFolder(); }}>
							<FolderPlus className="mr-2 h-4 w-4" />
							New folder
						</DropdownMenuItem>
					)}
					{onCreateFile && (
						<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateFile(); }}>
							<FilePlus className="mr-2 h-4 w-4" />
							New file
						</DropdownMenuItem>
					)}
					{onUploadFile && (
						<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUploadFile(); }}>
							<Upload className="mr-2 h-4 w-4" />
							Upload file
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator />
				</>
			)}

			{/* Add to Chat */}
			<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddToChat(); }}>
				<MessageSquarePlus className="mr-2 h-4 w-4" />
				Add to Chat
			</DropdownMenuItem>

			{/* View - only for files */}
			{!isFolder && onView && (
				<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
					<Eye className="mr-2 h-4 w-4" />
					View
				</DropdownMenuItem>
			)}

			{/* Set as Output Folder - only for folders */}
			{isFolder && onSetOutputFolder && (
				<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetOutputFolder(); }}>
					<FolderOutput className="mr-2 h-4 w-4" />
					{isOutputFolder ? "Output Folder" : "Set as Output"}
				</DropdownMenuItem>
			)}

			<DropdownMenuSeparator />

			{/* Rename */}
			<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
				<Pencil className="mr-2 h-4 w-4" />
				Rename
				{isFolder && <span className="ml-auto text-xs text-gray-400">Soon</span>}
			</DropdownMenuItem>

			{/* Copy - files only */}
			{!isFolder && onCopy && (
				<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(); }}>
					<Copy className="mr-2 h-4 w-4" />
					Copy to...
				</DropdownMenuItem>
			)}

			{/* Move */}
			<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(); }}>
				<FolderInput className="mr-2 h-4 w-4" />
				Move to...
				{isFolder && <span className="ml-auto text-xs text-gray-400">Soon</span>}
			</DropdownMenuItem>

			<DropdownMenuSeparator />

			{/* Delete */}
			<DropdownMenuItem
				className="text-red-600 focus:text-red-600"
				onClick={(e) => { e.stopPropagation(); onDelete(); }}
			>
				<Trash2 className="mr-2 h-4 w-4" />
				Delete
				{isFolder && <span className="ml-auto text-xs text-gray-400">Soon</span>}
			</DropdownMenuItem>
		</>
	);
};
