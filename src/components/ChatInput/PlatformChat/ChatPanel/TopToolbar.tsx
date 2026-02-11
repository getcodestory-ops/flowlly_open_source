import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
	Edit3, 
	Download, 
	Save, 
	Pencil, 
	Eye, 
	FolderPlus, 
	XCircle, 
	Printer,
	MoreHorizontal,
	Copy,
	Paperclip,
	Check,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import LayoutModeToggle from "../components/LayoutModeToggle";

export interface TopToolbarProps {
  canRename: boolean;
  canDownload: boolean;
  canSaveAs: boolean;
  canPrint: boolean;
  /** Whether to show the edit/view mode toggle (only for HTML files) */
  canToggleEditMode?: boolean;
  isEditMode: boolean;
  hasUnsavedInEdit: boolean;
  isDownloading?: boolean;
  /** Whether the current file is already added as chat context */
  isAddedAsContext?: boolean;
  /** Whether the "Add to Context" button should be shown */
  canAddContext?: boolean;
  onRename: () => void;
  onDownload: () => void;
  onSaveAs: () => void;
  onToggleMode: () => void;
  onAddFolder: () => void;
  onCloseAll: () => void;
  onPrint: () => void;
  /** Toggle adding/removing the current file from chat context */
  onToggleContext?: () => void;
}

// Toolbar button with tooltip
const ToolbarButton: React.FC<{
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
	disabled?: boolean;
	variant?: "default" | "primary" | "danger";
	showLabel?: boolean;
}> = ({ icon, label, onClick, disabled, variant = "default", showLabel }) => {
	const variantClasses = {
		default: "hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900",
		primary: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
		danger: "hover:bg-red-50 text-gray-600 hover:text-red-600",
	};

	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						className={cn(
							"h-8 transition-all duration-200",
							showLabel ? "px-3 gap-1.5" : "w-8 p-0",
							variantClasses[variant],
							disabled && "opacity-40 pointer-events-none"
						)}
						disabled={disabled}
						onClick={onClick}
						size={showLabel ? "sm" : "icon"}
						variant="ghost"
					>
						{icon}
						{showLabel && <span className="text-xs font-medium">{label}</span>}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom" sideOffset={5}>
					<p className="text-xs">{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const TopToolbar: React.FC<TopToolbarProps> = ({
	canRename,
	canDownload,
	canSaveAs,
	canPrint,
	canToggleEditMode = false,
	isEditMode,
	hasUnsavedInEdit,
	isDownloading = false,
	isAddedAsContext = false,
	canAddContext = false,
	onRename,
	onDownload,
	onSaveAs,
	onToggleMode,
	onAddFolder,
	onCloseAll,
	onPrint,
	onToggleContext,
}) => {
	return (
		<div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border-l border-gray-200 rounded-tr-lg">
			{/* Layout mode toggle */}
			<LayoutModeToggle />

			{/* Divider */}
			<div className="w-px h-5 bg-gray-300 mx-1" />

			{/* Primary action: Edit/View toggle - only show for HTML files */}
			{canToggleEditMode && (
				<>
					<TooltipProvider delayDuration={300}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									className={cn(
										"h-8 px-2.5 gap-1.5 transition-all duration-200 relative",
										isEditMode
											? "bg-blue-50 text-blue-600 hover:bg-blue-100"
											: "hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900"
									)}
									onClick={onToggleMode}
									size="sm"
									variant="ghost"
								>
									{isEditMode ? (
										<>
											<Eye className="h-4 w-4" />
											<span className="text-xs font-medium">View</span>
										</>
									) : (
										<>
											<Pencil className="h-4 w-4" />
										</>
									)}
									{hasUnsavedInEdit && (
										<div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={5}>
								<p className="text-xs">{isEditMode ? "Switch to view mode" : "Switch to edit mode"}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					{/* Divider */}
					<div className="w-px h-5 bg-gray-300 mx-1" />
				</>
			)}

			{/* Add to Context toggle */}
			{canAddContext && onToggleContext && (
				<TooltipProvider delayDuration={300}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className={cn(
									"h-8 px-2.5 gap-1.5 transition-all duration-200",
									isAddedAsContext
										? "bg-green-50 text-green-600 hover:bg-green-100"
										: "hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900"
								)}
								onClick={onToggleContext}
								size="sm"
								variant="ghost"
							>
								{isAddedAsContext ? (
									<>
										<Check className="h-4 w-4" />
										<span className="text-xs font-medium">Context</span>
									</>
								) : (
									<>
										<Paperclip className="h-4 w-4" />
									</>
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" sideOffset={5}>
							<p className="text-xs">{isAddedAsContext ? "Remove file from chat context" : "Add file as chat context"}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			{canAddContext && <div className="w-px h-5 bg-gray-300 mx-1" />}

			{/* Quick actions */}
			<ToolbarButton
				disabled={!canDownload || isDownloading}
				icon={<Download className={cn("h-4 w-4", isDownloading && "animate-pulse")} />}
				label={isDownloading ? "Downloading..." : "Download"}
				onClick={onDownload}
			/>

			{/* More actions dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900"
						size="icon"
						variant="ghost"
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem 
						className="gap-2 cursor-pointer"
						disabled={!canRename}
						onClick={onRename}
					>
						<Edit3 className="h-4 w-4" />
						<span>Rename</span>
					</DropdownMenuItem>
					<DropdownMenuItem 
						className="gap-2 cursor-pointer"
						disabled={!canSaveAs}
						onClick={onSaveAs}
					>
						<Copy className="h-4 w-4" />
						<span>Save as Copy</span>
					</DropdownMenuItem>
					<DropdownMenuItem 
						className="gap-2 cursor-pointer"
						disabled={!canPrint}
						onClick={onPrint}
					>
						<Printer className="h-4 w-4" />
						<span>Print</span>
					</DropdownMenuItem>
					{canAddContext && onToggleContext && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem 
								className={cn("gap-2 cursor-pointer", isAddedAsContext && "text-green-600 focus:text-green-600")}
								onClick={onToggleContext}
							>
								{isAddedAsContext ? <Check className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
								<span>{isAddedAsContext ? "Remove from Context" : "Add to Context"}</span>
							</DropdownMenuItem>
						</>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem 
						className="gap-2 cursor-pointer"
						onClick={onAddFolder}
					>
						<FolderPlus className="h-4 w-4" />
						<span>Add Files</span>
					</DropdownMenuItem>
					<DropdownMenuItem 
						className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
						onClick={onCloseAll}
					>
						<XCircle className="h-4 w-4" />
						<span>Close All Tabs</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Divider */}
			<div className="w-px h-5 bg-gray-300 mx-1" />

			{/* Add files button */}
			<ToolbarButton
				icon={<FolderPlus className="h-4 w-4" />}
				label="Add Files"
				onClick={onAddFolder}
			/>
		</div>
	);
};

export default TopToolbar;


