import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDocumentStore } from "./useDocumentStore";
import { 
	uploadFileInFolder, 
	createSubFolder, 
	createDocumentInFolder,
	deleteFile 
} from "@/api/folderRoutes";
import { useToast } from "@/components/ui/use-toast";
import { type Session } from "@supabase/supabase-js";
import { GetFolderSubFolderProp } from "@/api/folderRoutes";

interface UseDocumentOperationsProps {
	session: Session | null;
	activeProjectId: string;
	isProjectWide: boolean;
}

export const useDocumentOperations = ({ 
	session, 
	activeProjectId, 
	isProjectWide, 
}: UseDocumentOperationsProps) => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const { 
		addFile, 
		removeFile, 
		addFolder, 
		removeFolder, 
		invalidateFolder,
		currentFolderStructure, 
	} = useDocumentStore();

	// Upload file mutation
	const uploadFileMutation = useMutation({
		mutationFn: async({ 
			file, 
			folderId, 
			onProgress, 
		}: { 
			file: File; 
			folderId: string; 
			onProgress?: (progress: number) => void;
		}) => {
			if (!session) throw new Error("No session");
			return uploadFileInFolder(session, activeProjectId, file, folderId, undefined, onProgress);
		},
		onSuccess: (data, variables) => {
			// Extract file data from response and add to store
			if (data?.storage_relations?.[0]?.storage_resources) {
				const fileData = data.storage_relations[0].storage_resources;
				addFile(variables.folderId, fileData);
			}
			
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: [`fetchFiles-${variables.folderId}`],
			});
			
			toast({
				title: "File uploaded successfully",
				description: `${variables.file.name} has been uploaded.`,
			});
		},
		onError: (error) => {
			toast({
				title: "Upload failed",
				description: "Failed to upload file. Please try again.",
				variant: "destructive",
			});
		},
	});

	// Create folder mutation
	const createFolderMutation = useMutation({
		mutationFn: async({ 
			folderName, 
			parentId, 
		}: { 
			folderName: string; 
			parentId: string; 
		}) => {
			if (!session) throw new Error("No session");
			return createSubFolder(session, activeProjectId, folderName, parentId, isProjectWide);
		},
		onSuccess: (data, variables) => {
			// Add folder to store
			if (data) {
				const folderData: GetFolderSubFolderProp = {
					id: data.id,
					name: data.name,
					created_at: data.created_at,
					parent_id: data.parent_id,
					type_of: data.type_of,
					storage_relations: [],
				};
				addFolder(variables.parentId, folderData);
			}
			
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: [`fetchProjectFolders-${variables.parentId}`],
			});
			
			toast({
				title: "Folder created successfully",
				description: `"${variables.folderName}" folder has been created.`,
			});
		},
		onError: (error) => {
			toast({
				title: "Failed to create folder",
				description: "Please try again.",
				variant: "destructive",
			});
		},
	});

	// Create text document mutation
	const createDocumentMutation = useMutation({
		mutationFn: async({ 
			fileName, 
			folderId, 
		}: { 
			fileName: string; 
			folderId: string; 
		}) => {
			if (!session) throw new Error("No session");
			return createDocumentInFolder(session, activeProjectId, fileName, folderId);
		},
		onSuccess: (data, variables) => {
			// Extract file data from response and add to store
			if (data?.storage_relations?.[0]?.storage_resources) {
				const fileData = data.storage_relations[0].storage_resources;
				addFile(variables.folderId, fileData);
			}
			
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: [`fetchFiles-${variables.folderId}`],
			});
			
			toast({
				title: "Document created successfully",
				description: `"${variables.fileName}" has been created.`,
			});
		},
		onError: (error) => {
			toast({
				title: "Failed to create document",
				description: "Please try again.",
				variant: "destructive",
			});
		},
	});

	// Delete file mutation
	const deleteFileMutation = useMutation({
		mutationFn: async({ 
			fileId, 
			folderId, 
		}: { 
			fileId: string; 
			folderId: string; 
		}) => {
			if (!session) throw new Error("No session");
			return deleteFile({ session, projectId: activeProjectId, fileId });
		},
		onSuccess: (data, variables) => {
			// Remove file from store
			removeFile(variables.folderId, variables.fileId);
			
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: [`fetchFiles-${variables.folderId}`],
			});
			
			toast({
				title: "File deleted successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Failed to delete file",
				description: "Please try again.",
				variant: "destructive",
			});
		},
	});

	// Utility function to refresh current folder
	const refreshCurrentFolder = () => {
		if (currentFolderStructure) {
			invalidateFolder(currentFolderStructure.folderId);
			
			// Invalidate queries to trigger refetch
			queryClient.invalidateQueries({
				queryKey: [`fetchProjectFolders-${currentFolderStructure.folderId}`],
			});
			queryClient.invalidateQueries({
				queryKey: [`fetchFiles-${currentFolderStructure.folderId}`],
			});
		}
	};

	// Method to add file to store when async processing completes
	const addProcessedFile = (folderId: string, fileData: any) => {
		addFile(folderId, fileData);
		
		// Also invalidate queries to ensure consistency
		queryClient.invalidateQueries({
			queryKey: [`fetchFiles-${folderId}`],
		});
	};

	return {
		uploadFile: uploadFileMutation.mutate,
		createFolder: createFolderMutation.mutate,
		createDocument: createDocumentMutation.mutate,
		deleteFile: deleteFileMutation.mutate,
		refreshCurrentFolder,
		addProcessedFile,
		isUploading: uploadFileMutation.isPending,
		isCreatingFolder: createFolderMutation.isPending,
		isCreatingDocument: createDocumentMutation.isPending,
		isDeletingFile: deleteFileMutation.isPending,
	};
}; 