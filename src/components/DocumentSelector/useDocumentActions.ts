import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { deleteFile } from "@/api/folderRoutes";
import { updateDocumentName } from "@/api/documentRoutes";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { UseDocumentActionsReturn } from "./types";

interface UseDocumentActionsProps {
  session: any;
  activeProject: any;
  currentFolderId: string | null;
  isProjectWide: boolean;
}

export const useDocumentActions = ({
	session,
	activeProject,
	currentFolderId,
	isProjectWide,
}: UseDocumentActionsProps): UseDocumentActionsReturn => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { removeFile, updateFile } = useDocumentStore();
	const [isRenaming, setIsRenaming] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Delete file mutation
	const deleteMutation = useMutation({
		mutationFn: deleteFile,
		onSuccess: (_, variables) => {
			const folderId = currentFolderId || "root";
			removeFile(folderId, variables.fileId);
			queryClient.invalidateQueries({
				queryKey: ["files", session?.access_token, activeProject?.project_id, currentFolderId, isProjectWide],
			});
		},
	});

	// Rename file
	const renameFile = async (fileId: string, newName: string): Promise<boolean> => {
		if (!session) {
			toast({
				title: "Error",
				description: "Session not available",
				variant: "destructive",
			});
			return false;
		}

		setIsRenaming(true);
		try {
			const response = await updateDocumentName(session, fileId, newName);
			if (response) {
				// Update local store immediately for instant UI feedback
				const folderId = currentFolderId || "root";
				updateFile(folderId, fileId, { file_name: newName });
				
				toast({
					title: "File renamed",
					description: `File renamed to "${newName}"`,
					duration: 3000,
				});
				return true;
			} else {
				toast({
					title: "Error",
					description: "Failed to rename file",
					variant: "destructive",
				});
				return false;
			}
		} catch (error) {
			console.error("Error renaming file:", error);
			toast({
				title: "Error",
				description: "Failed to rename file",
				variant: "destructive",
			});
			return false;
		} finally {
			setIsRenaming(false);
		}
	};

	// Delete file
	const handleDeleteFile = async (fileId: string): Promise<boolean> => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "Session or project not available",
				variant: "destructive",
			});
			return false;
		}

		setIsDeleting(true);
		try {
			await deleteMutation.mutateAsync({
				session,
				projectId: activeProject.project_id,
				fileId,
			});
			toast({
				title: "File deleted",
				description: "File has been deleted successfully",
				duration: 3000,
			});
			return true;
		} catch (error) {
			console.error("Error deleting file:", error);
			toast({
				title: "Error",
				description: "Failed to delete file",
				variant: "destructive",
			});
			return false;
		} finally {
			setIsDeleting(false);
		}
	};

	// Placeholder: Rename folder
	const renameFolder = (_folderId: string, _newName: string): void => {
		toast({
			title: "Coming Soon",
			description: "Folder renaming will be available in a future update",
			duration: 3000,
		});
	};

	// Placeholder: Delete folder
	const deleteFolder = (_folderId: string): void => {
		toast({
			title: "Coming Soon",
			description: "Folder deletion will be available in a future update",
			duration: 3000,
		});
	};

	// Placeholder: Move item to different folder
	const moveItem = (_itemId: string, _targetFolderId: string): void => {
		toast({
			title: "Coming Soon",
			description: "Moving files and folders will be available in a future update",
			duration: 3000,
		});
	};

	return {
		renameFile,
		deleteFile: handleDeleteFile,
		renameFolder,
		deleteFolder,
		moveItem,
		isRenaming,
		isDeleting,
	};
};

