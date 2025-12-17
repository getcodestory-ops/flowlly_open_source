import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { ContextMenuContent } from "./ContextMenuContent";
import { DocumentItemActionsProps } from "./types";

export const DocumentItemActions: React.FC<DocumentItemActionsProps> = ({
	item,
	onRename,
	onDelete,
	onMove,
	onAddToChat,
	onView,
	onSetOutputFolder,
	isOutputFolder,
}) => {
	const isFolder = item.type === "folder";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => e.stopPropagation()}
					size="sm"
					variant="ghost"
				>
					<MoreVertical className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<ContextMenuContent
					isFolder={isFolder}
					isOutputFolder={isOutputFolder}
					onAddToChat={onAddToChat}
					onDelete={onDelete}
					onMove={onMove}
					onRename={onRename}
					onSetOutputFolder={onSetOutputFolder}
					onView={onView}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

