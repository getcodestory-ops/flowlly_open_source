import React from "react";
import { Button } from "@/components/ui/button";
import { Edit3, Download, Save, Pencil, FileText, Folder, X, Printer, Monitor } from "lucide-react";

export interface TopToolbarProps {
  canRename: boolean;
  canDownload: boolean;
  canSaveAs: boolean;
  canPrint: boolean;
  isEditMode: boolean;
  hasUnsavedInEdit: boolean;
  onRename: () => void;
  onDownload: () => void;
  onSaveAs: () => void;
  onToggleMode: () => void;
  onAddFolder: () => void;
  onOpenComputer: () => void;
  onCloseAll: () => void;
  onPrint: () => void;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
	canRename,
	canDownload,
	canSaveAs,
	canPrint,
	isEditMode,
	hasUnsavedInEdit,
	onRename,
	onDownload,
	onSaveAs,
	onToggleMode,
	onAddFolder,
	onOpenComputer,
	onCloseAll,
	onPrint,
}) => {
	return (
		<div className="flex items-center gap-1 px-3 bg-gray-100 border-l border-gray-200 rounded-tr-lg">
			<div className="flex items-center gap-1">
				<Button
					className="h-8 w-8 p-0"
					disabled={!canRename}
					onClick={onRename}
					size="icon"
					title={canRename ? "Rename file" : "Rename not available"}
					variant="ghost"
				>
					<Edit3 className="h-4 w-4" />
				</Button>
				<Button
					className="h-8 w-8 p-0"
					disabled={!canDownload}
					onClick={onDownload}
					size="icon"
					title={canDownload ? "Download file" : "Download not available"}
					variant="ghost"
				>
					<Download className="h-4 w-4" />
				</Button>
				<Button
					className="h-8 w-8 p-0"
					disabled={!canSaveAs}
					onClick={onSaveAs}
					size="icon"
					title={canSaveAs ? "Save as copy" : "Save not available"}
					variant="ghost"
				>
					<Save className="h-4 w-4" />
				</Button>
				<Button
					className={`gap-1 px-2 h-8 transition-all duration-200 relative ${
						isEditMode
							? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
							: "hover:bg-gray-100 border border-transparent"
					} ${!canRename ? "opacity-50" : ""}`}
					disabled={!canRename}
					onClick={onToggleMode}
					size="sm"
					title={isEditMode ? "Switch to view mode" : "Switch to edit mode"}
					variant="ghost"
				>
					{!isEditMode ? (
						<>
							<Pencil className="h-4 w-4" />
							<span className="text-xs font-medium">Edit</span>
						</>
					) : (
						<>
							<FileText className="h-4 w-4" />
							<span className="text-xs font-medium">View</span>
						</>
					)}
					{hasUnsavedInEdit && (
						<div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
					)}
				</Button>
				<Button
					className="h-8 w-8 p-0"
					disabled={!canPrint}
					onClick={onPrint}
					size="icon"
					title={canPrint ? "Print" : "Print not available"}
					variant="ghost"
				>
					<Printer className="h-4 w-4" />
				</Button>
			</div>
			{/* Universal actions */}
			<Button
				className="h-8 w-8 p-0"
				onClick={onAddFolder}
				size="icon"
				title="Add Files and Folders"
				variant="ghost"
			>
				<Folder className="h-4 w-4" />
			</Button>
			<Button
				className="h-8 w-8 p-0"
				onClick={onOpenComputer}
				size="icon"
				title="Open Virtual Computer"
				variant="ghost"
			>
				<Monitor className="h-4 w-4" />
			</Button>
			<Button
				className="h-8 w-8 p-0"
				onClick={onCloseAll}
				size="icon"
				title="Close All Tabs"
				variant="ghost"
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default TopToolbar;


