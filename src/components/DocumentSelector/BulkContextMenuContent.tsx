import React from "react";
import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Trash2,
	FolderInput,
	MessageSquarePlus,
	Files,
	Copy,
} from "lucide-react";

interface BulkContextMenuContentProps {
	selectedCount: number;
	onAddToChat: () => void;
	onMove: () => void;
	onCopy?: () => void;
	onDelete: () => void;
}

export const BulkContextMenuContent: React.FC<BulkContextMenuContentProps> = ({
	selectedCount,
	onAddToChat,
	onMove,
	onCopy,
	onDelete,
}) => {
	return (
		<>
			{/* Header showing count */}
			<div className="px-2 py-1.5 text-xs font-medium text-gray-500 flex items-center gap-2">
				<Files className="h-3 w-3" />
				{selectedCount} items selected
			</div>
			
			<DropdownMenuSeparator />

			{/* Add all to Chat */}
			<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddToChat(); }}>
				<MessageSquarePlus className="mr-2 h-4 w-4" />
				Add all to Chat
			</DropdownMenuItem>

			{/* Copy all */}
			{onCopy && (
				<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(); }}>
					<Copy className="mr-2 h-4 w-4" />
					Copy {selectedCount} files to...
				</DropdownMenuItem>
			)}

			{/* Move all */}
			<DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(); }}>
				<FolderInput className="mr-2 h-4 w-4" />
				Move {selectedCount} items...
			</DropdownMenuItem>

			<DropdownMenuSeparator />

			{/* Delete all */}
			<DropdownMenuItem
				className="text-red-600 focus:text-red-600"
				onClick={(e) => { e.stopPropagation(); onDelete(); }}
			>
				<Trash2 className="mr-2 h-4 w-4" />
				Delete {selectedCount} items
			</DropdownMenuItem>
		</>
	);
};
