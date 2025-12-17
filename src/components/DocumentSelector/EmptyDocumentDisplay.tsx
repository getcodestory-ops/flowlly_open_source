import React, { useState } from "react";
import { Upload, MousePointer, FolderPlus, FilePlus } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface EmptyDocumentDisplayProps {
	onCreateFolder?: () => void;
	onCreateFile?: () => void;
	onUploadFile?: () => void;
}

export const EmptyDocumentDisplay: React.FC<EmptyDocumentDisplayProps> = ({
	onCreateFolder,
	onCreateFile,
	onUploadFile,
}) => {
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setContextMenuPosition({
			x: e.clientX,
			y: e.clientY,
		});
		setContextMenuOpen(true);
	};

	return (
		<div 
			className="text-center flex flex-col items-center justify-center h-full min-h-[300px] py-12 px-4 relative"
			onContextMenu={handleContextMenu}
		>
			{/* Context menu for right-click */}
			<DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
				<DropdownMenuTrigger asChild>
					<div
						className="fixed w-0 h-0 pointer-events-none"
						style={{
							left: contextMenuPosition.x,
							top: contextMenuPosition.y,
						}}
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-48">
					{onCreateFolder && (
						<DropdownMenuItem onClick={() => { onCreateFolder(); setContextMenuOpen(false); }}>
							<FolderPlus className="mr-2 h-4 w-4" />
							New folder
						</DropdownMenuItem>
					)}
					{onCreateFile && (
						<DropdownMenuItem onClick={() => { onCreateFile(); setContextMenuOpen(false); }}>
							<FilePlus className="mr-2 h-4 w-4" />
							New file
						</DropdownMenuItem>
					)}
					{onUploadFile && (
						<DropdownMenuItem onClick={() => { onUploadFile(); setContextMenuOpen(false); }}>
							<Upload className="mr-2 h-4 w-4" />
							Upload file
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<div className="flex flex-col items-center justify-center">
				<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
					<Upload className="w-8 h-8 text-gray-400" />
				</div>
				<p className="text-lg font-medium text-gray-600 mb-2">No files yet</p>
				<p className="text-sm text-gray-400 max-w-xs mb-6">
					Drag and drop files here, or right-click to create files and folders.
				</p>
				<div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-full">
					<MousePointer className="w-3 h-3" />
					<span>Right-click for options</span>
				</div>
			</div>
		</div>
	);
};
