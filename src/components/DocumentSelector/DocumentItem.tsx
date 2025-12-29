import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, FolderOutput, Folder, FolderOpen, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { DocumentItemActions } from "./DocumentItemActions";
import { ContextMenuContent } from "./ContextMenuContent";
import { BulkContextMenuContent } from "./BulkContextMenuContent";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { RenameDialog } from "./RenameDialog";
import { FileTypeIcon } from "./FileTypeIcon";
import { DocumentItemProps } from "./types";
import { useToast } from "@/components/ui/use-toast";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DocumentItemComponent: React.FC<DocumentItemProps> = ({
	item,
	itemIndex,
	isSelected,
	selectedCount,
	onToggleSelection,
	onFolderClick,
	onOpenInSidePanel,
	onRename,
	onDelete,
	onSetOutputFolder,
	isOutputFolder,
	onMove,
	onCopy,
	onBulkDelete,
	onBulkMove,
	onBulkAddToChat,
	onBulkCopy,
	onHoverStart,
	onHoverEnd,
	onCreateFolder,
	onCreateFile,
	onUploadFile,
}) => {
	const { toast } = useToast();
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(item.name);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showRenameDialog, setShowRenameDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
	const [isNavigating, setIsNavigating] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const rowRef = useRef<HTMLDivElement>(null);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const isFolder = item.type === "folder";
	// Show bulk menu when multiple items selected and this item is one of them
	const showBulkMenu = isSelected && selectedCount > 1;

	// Debounced hover handlers for prefetch
	const handleMouseEnter = useCallback(() => {
		setIsHovered(true);
		if (isFolder && onHoverStart) {
			hoverTimeoutRef.current = setTimeout(() => {
				onHoverStart();
			}, 150); // 150ms delay to avoid prefetch on quick mouse movements
		}
	}, [isFolder, onHoverStart]);

	const handleMouseLeave = useCallback(() => {
		setIsHovered(false);
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}
		onHoverEnd?.();
	}, [onHoverEnd]);

	// Handle right-click to open context menu at cursor position
	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Get position relative to the row element
		const rect = rowRef.current?.getBoundingClientRect();
		if (rect) {
			setContextMenuPosition({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
		}
		setContextMenuOpen(true);
	};

	// Single click on row: folders navigate, files open
	const handleRowClick = () => {
		if (isFolder && onFolderClick) {
			setIsNavigating(true); // Instant visual feedback
			onFolderClick();
		} else if (!isFolder && onOpenInSidePanel) {
			onOpenInSidePanel();
		}
	};

	// Double click on file name triggers rename
	const handleNameDoubleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isFolder) {
			setIsEditing(true);
			setEditName(item.name);
		}
	};

	const handleInlineRenameSubmit = async () => {
		const trimmedName = editName.trim();
		if (trimmedName && trimmedName !== item.name) {
			setIsRenaming(true);
			try {
				await onRename(trimmedName);
			} finally {
				setIsRenaming(false);
			}
		}
		setIsEditing(false);
	};

	const handleInlineRenameKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleInlineRenameSubmit();
		} else if (e.key === "Escape") {
			setIsEditing(false);
			setEditName(item.name);
		}
	};

	const handleRenameAction = () => {
		if (isFolder) {
			toast({
				title: "Coming Soon",
				description: "Folder renaming will be available in a future update",
				duration: 3000,
			});
		} else {
			setShowRenameDialog(true);
		}
	};

	const handleDeleteAction = () => {
		if (isFolder) {
			toast({
				title: "Coming Soon",
				description: "Folder deletion will be available in a future update",
				duration: 3000,
			});
		} else {
			setShowDeleteDialog(true);
		}
	};

	const handleMoveAction = () => {
		if (onMove) {
			onMove();
		} else {
			toast({
				title: "Coming Soon",
				description: "Moving files will be available in a future update",
				duration: 3000,
			});
		}
	};

	const handleConfirmDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete();
			setShowDeleteDialog(false);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleConfirmRename = async (newName: string) => {
		setIsRenaming(true);
		try {
			await onRename(newName);
			setShowRenameDialog(false);
		} finally {
			setIsRenaming(false);
		}
	};

	return (
		<>
			<div
				ref={rowRef}
				className={clsx(
					"flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg group transition-all duration-75 relative",
					isSelected && !isNavigating && "bg-blue-50 hover:bg-blue-100 ",
					isNavigating && "opacity-50 pointer-events-none bg-gray-100",
				)}
				onClick={handleRowClick}
				onContextMenu={handleContextMenu}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{/* Virtual anchor for right-click context menu */}
				<DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
					<DropdownMenuTrigger asChild>
						<div
							className="absolute w-0 h-0"
							style={{
								left: contextMenuPosition.x,
								top: contextMenuPosition.y,
							}}
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-48">
						{showBulkMenu ? (
							<BulkContextMenuContent
								onAddToChat={() => { onBulkAddToChat?.(); setContextMenuOpen(false); }}
								onCopy={onBulkCopy ? () => { onBulkCopy(); setContextMenuOpen(false); } : undefined}
								onDelete={() => { onBulkDelete?.(); setContextMenuOpen(false); }}
								onMove={() => { onBulkMove?.(); setContextMenuOpen(false); }}
								selectedCount={selectedCount}
							/>
						) : (
							<ContextMenuContent
								isFolder={isFolder}
								isOutputFolder={isOutputFolder}
								onAddToChat={() => { onToggleSelection(); setContextMenuOpen(false); }}
								onCopy={!isFolder && onCopy ? () => { onCopy(); setContextMenuOpen(false); } : undefined}
								onCreateFile={onCreateFile ? () => { onCreateFile(); setContextMenuOpen(false); } : undefined}
								onCreateFolder={onCreateFolder ? () => { onCreateFolder(); setContextMenuOpen(false); } : undefined}
								onDelete={() => { handleDeleteAction(); setContextMenuOpen(false); }}
								onMove={() => { handleMoveAction(); setContextMenuOpen(false); }}
								onRename={() => { handleRenameAction(); setContextMenuOpen(false); }}
								onSetOutputFolder={onSetOutputFolder ? () => { onSetOutputFolder(); setContextMenuOpen(false); } : undefined}
								onUploadFile={onUploadFile ? () => { onUploadFile(); setContextMenuOpen(false); } : undefined}
								onView={!isFolder && onOpenInSidePanel ? () => { onOpenInSidePanel(); setContextMenuOpen(false); } : undefined}
							/>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
				{/* Checkbox - Always visible (Google Drive style) */}
				<div
					className={clsx(
						"flex-shrink-0 relative p-1 -m-1 rounded transition-all duration-150",
						isHovered && !isSelected && "bg-green-50 ring-2 ring-green-200"
					)}
					onClick={(e) => {
						e.stopPropagation();
						// Pass modifier keys for multi-select
						onToggleSelection({
							shiftKey: e.shiftKey,
							ctrlKey: e.ctrlKey,
							metaKey: e.metaKey,
						});
					}}
					title={isSelected ? "Remove from chat context" : "Add to chat context"}
				>
					<Checkbox
						checked={isSelected}
						className={clsx(
							"h-4 w-4 transition-all duration-150",
							isSelected 
								? "border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" 
								: isHovered 
									? "border-green-500 scale-110"
									: "border-gray-300"
						)}
					/>
					{/* Hover hint label - shows on row hover */}
					{isHovered && (
						<span className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded animate-in fade-in duration-150 pointer-events-none shadow-sm border border-green-200 z-10">
							{isSelected ? "Remove" : "+ Context"}
						</span>
					)}
				</div>

				{/* Icon - folder opens on hover */}
				<div className="flex-shrink-0 transition-transform duration-150">
					{isFolder ? (
						<div className={cn(
							"flex items-center justify-center w-5 h-5 rounded",
							isHovered ? "bg-blue-200" : "bg-blue-100"
						)}>
							{isHovered ? (
								<FolderOpen className="h-3.5 w-3.5 text-blue-600" />
							) : (
								<Folder className="h-3.5 w-3.5 text-blue-600" />
							)}
						</div>
					) : (
						<FileTypeIcon extension={item.metadata?.extension} size="sm" />
					)}
				</div>

				{/* Name - with inline edit for files */}
				<div className="flex-1 min-w-0 flex items-center gap-2">
					{isEditing ? (
						<Input
							autoFocus
							className="h-7 text-sm"
							onBlur={handleInlineRenameSubmit}
							onChange={(e) => setEditName(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onKeyDown={handleInlineRenameKeyDown}
							value={editName}
						/>
					) : (
						<>
							<span
								className={clsx(
									"text-sm truncate block transition-all duration-150",
									isHovered && "text-blue-600 underline underline-offset-2"
								)}
								onDoubleClick={handleNameDoubleClick}
								title={isFolder ? `Click to open folder` : `Click to view file`}
							>
								{item.name}
							</span>
							{/* Open indicator on hover */}
							{isHovered && (
								<ExternalLink className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 animate-in fade-in duration-150" />
							)}
						</>
					)}
				</div>

				{/* Quick Actions - Right side */}
				<div className="flex items-center gap-1 flex-shrink-0">
					{/* View - files only, always visible */}
					{!isFolder && onOpenInSidePanel && (
						<Button
							className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
							onClick={(e) => {
								e.stopPropagation();
								onOpenInSidePanel();
							}}
							size="sm"
							title="View document"
							variant="ghost"
						>
							<Eye className="h-4 w-4" />
						</Button>
					)}

					{/* Set Output Folder - folders only */}
					{isFolder && onSetOutputFolder && (
						<Button
							className={clsx(
								"h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50",
								isOutputFolder && "text-blue-600 bg-blue-50",
							)}
							onClick={(e) => {
								e.stopPropagation();
								onSetOutputFolder();
							}}
							size="sm"
							title={isOutputFolder ? "Current output folder" : "Set as output folder"}
							variant="ghost"
						>
							<FolderOutput className="h-4 w-4" />
						</Button>
					)}

					{/* More Actions Menu (three-dot button) */}
					<DocumentItemActions
						isOutputFolder={isOutputFolder}
						item={item}
						onAddToChat={onToggleSelection}
						onDelete={handleDeleteAction}
						onMove={handleMoveAction}
						onRename={handleRenameAction}
						onSetOutputFolder={onSetOutputFolder}
						onView={!isFolder && onOpenInSidePanel ? onOpenInSidePanel : undefined}
					/>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isDeleting={isDeleting}
				itemName={item.name}
				itemType={item.type}
				onConfirm={handleConfirmDelete}
				onOpenChange={setShowDeleteDialog}
				open={showDeleteDialog}
			/>

			{/* Rename Dialog */}
			<RenameDialog
				currentName={item.name}
				isRenaming={isRenaming}
				itemType={item.type}
				onConfirm={handleConfirmRename}
				onOpenChange={setShowRenameDialog}
				open={showRenameDialog}
			/>
		</>
	);
};

// Memoize to prevent unnecessary re-renders when sibling items change
export const DocumentItem = React.memo(DocumentItemComponent);

