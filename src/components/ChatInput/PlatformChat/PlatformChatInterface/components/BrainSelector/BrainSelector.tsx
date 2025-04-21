import React from "react";
import { DialogContent } from "@/components/ui/dialog";
import FolderSelector from "@/components/ProjectEvent/FolderSelector";

interface BrainSelectorProps {
  selectedFolderId: string | null;
  onFolderSelect: (newFolderId: string | null, folderName: string) => void;
}

export const BrainSelector: React.FC<BrainSelectorProps> = ({
	selectedFolderId,
	onFolderSelect,
}) => {
	return (
		<DialogContent className="sm:max-w-[600px]">
			<div className="py-4">
				<FolderSelector
					onFolderSelect={onFolderSelect}
					selectedFolderId={selectedFolderId}
				/>
			</div>
		</DialogContent>
	);
};

export default BrainSelector; 