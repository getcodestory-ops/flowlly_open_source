import React, { useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MousePointer, Loader2, FolderPlus, FilePlus, Upload } from "lucide-react";
import { DocumentItem } from "./DocumentItem";
import { EmptyDocumentDisplay } from "./EmptyDocumentDisplay";
import { DocumentGridProps, SelectedItem, SelectionEvent } from "./types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DocumentGrid: React.FC<DocumentGridProps> = ({
	items,
	selectedItems,
	onToggleSelection,
	onRangeSelection,
	onFolderClick,
	onOpenInSidePanel,
	onRenameFile,
	onDeleteFile,
	onSetOutputFolder,
	contextFolderId,
	isLoading = false,
	onBulkDelete,
	onBulkMove,
	onBulkAddToChat,
	onBulkCopy,
	onCopyFile,
	onPrefetchFolder,
	onCreateFolder,
	onCreateFile,
	onUploadFile,
}) => {
	// Track last selected index for shift-select
	const lastSelectedIndexRef = useRef<number>(-1);
	
	// Context menu state for right-clicking empty space
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

	const isItemSelected = (itemId: string): boolean => {
		return selectedItems.some((selected) => selected.id === itemId);
	};

	// Handle right-click on empty space (not on items)
	const handleGridContextMenu = (e: React.MouseEvent) => {
		// Only trigger if clicking directly on the grid container, not on items
		if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.grid-container')) {
			e.preventDefault();
			setContextMenuPosition({ x: e.clientX, y: e.clientY });
			setContextMenuOpen(true);
		}
	};

	const handleToggleSelection = (item: SelectedItem, index: number, event?: SelectionEvent) => {
		// Handle shift+click for range selection
		if (event?.shiftKey && lastSelectedIndexRef.current !== -1) {
			const startIndex = Math.min(lastSelectedIndexRef.current, index);
			const endIndex = Math.max(lastSelectedIndexRef.current, index);
			onRangeSelection(startIndex, endIndex);
			return;
		}

		// Handle ctrl/cmd+click for additive selection
		// Regular click without modifiers will toggle selection
		onToggleSelection(item, event);
		
		// Update last selected index
		lastSelectedIndexRef.current = index;
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
				<p className="text-sm text-gray-500">Loading files...</p>
				<div className="grid grid-cols-1 gap-2 w-full px-4 opacity-30">
					{[...Array(3)].map((_, i) => (
						<div className="flex items-center gap-3 p-3" key={i}>
							<Skeleton className="h-5 w-5 rounded" />
							<Skeleton className="h-4 flex-1" />
							<Skeleton className="h-8 w-8 rounded" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<EmptyDocumentDisplay 
				onCreateFolder={onCreateFolder}
				onCreateFile={onCreateFile}
				onUploadFile={onUploadFile}
			/>
		);
	}

	return (
		<div className="flex flex-col h-full" onContextMenu={handleGridContextMenu}>
			{/* Context menu for right-clicking empty space */}
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

			<div className="grid grid-cols-1 gap-1 p-2 flex-1 grid-container">
				{items.map((item, index) => (
					<DocumentItem
						isOutputFolder={item.type === "folder" && contextFolderId === item.id}
						isSelected={isItemSelected(item.id)}
						item={item}
						itemIndex={index}
						key={item.id}
						onBulkAddToChat={onBulkAddToChat}
						onBulkCopy={onBulkCopy}
						onBulkDelete={onBulkDelete}
						onBulkMove={onBulkMove}
						onCopy={
							item.type === "file" && onCopyFile
								? () => onCopyFile(item.id, item.name)
								: undefined
						}
						onCreateFile={onCreateFile}
						onCreateFolder={onCreateFolder}
						onDelete={async () => {
							if (item.type === "file") {
								await onDeleteFile(item.id, item.name);
							}
						}}
						onFolderClick={
							item.type === "folder"
								? () => onFolderClick(item.id, item.name)
								: undefined
						}
						onHoverStart={
							item.type === "folder" && onPrefetchFolder
								? () => onPrefetchFolder(item.id)
								: undefined
						}
						onMove={() => {
							// Placeholder - will be implemented later
						}}
						onOpenInSidePanel={
							item.type === "file"
								? () => onOpenInSidePanel(item.id, item.name)
								: undefined
						}
						onRename={async (newName) => {
							if (item.type === "file") {
								await onRenameFile(item.id, newName);
							}
						}}
						onSetOutputFolder={
							item.type === "folder"
								? () => onSetOutputFolder(item.id, item.name)
								: undefined
						}
						onToggleSelection={(event) =>
							handleToggleSelection(
								{ id: item.id, name: item.name, type: item.type },
								index,
								event
							)
						}
						onUploadFile={onUploadFile}
						selectedCount={selectedItems.length}
					/>
				))}
			</div>
			{/* Interaction hints */}
			<div className="flex items-center justify-center gap-4 py-3 px-4 border-t bg-gray-50/50 text-xs text-gray-400">
				<span className="flex items-center gap-1">
					<MousePointer className="w-3 h-3" />
					Click to open
				</span>
				<span className="text-gray-300">|</span>
				<span>Shift+Click for range</span>
				<span className="text-gray-300">|</span>
				<span>Ctrl+Click for multi</span>
			</div>
		</div>
	);
};

