import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { createSubFolder } from "@/api/folderRoutes";
import { AddNewFolderModal } from "../../CreateNewFolderModal/CreateNewFolderModal";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { FolderPlus } from "lucide-react";

interface AddFolderButtonProps {
	activeProject: any;
	folderId: string;
	session: any;
	folderName?: string;
	isProjectWide?: boolean;
}

export const AddFolderButton: React.FC<AddFolderButtonProps> = ({
	activeProject,
	folderId,
	session,
	folderName,
	isProjectWide = true,
}) => {
	const queryClient = useQueryClient();
	const { addFolder } = useDocumentStore();

	const handleAddFolder = (name: string) => {
		if (!activeProject) return;
		
		createSubFolder(
			session,
			activeProject.project_id,
			name,
			folderId,
			isProjectWide,
			(data) => {
				addFolder(folderId, data);
			},
		);
	};

	return (
		<AddNewFolderModal
			onAdd={handleAddFolder}
			parentFolderName={folderName ?? "Other"}
		>
			<Button className="gap-2"
				size="sm"
				variant="outline"
			>
				<FolderPlus size={16} />
				Add Folder
			</Button>
		</AddNewFolderModal>
	);
}; 