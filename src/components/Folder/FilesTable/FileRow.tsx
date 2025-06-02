import React, { useState } from "react";
import { Trash } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StorageResourceEntity } from "@/types/document";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { FileMediaIcon } from "../FileMediaIcon";
import { deleteFile } from "@/api/folderRoutes";
import { formatDate } from "@/utils/calculations";
import { Tooltipped } from "../../Common/Tooltiped";
import { useChatStore } from "@/hooks/useChatStore";
import { useDocumentStore } from "@/hooks/useDocumentStore";

interface FileRowProps {
  resource: StorageResourceEntity;
  setCurrentFile: (resource: StorageResourceEntity | null) => void;
  currentFile: StorageResourceEntity | null;
  session: any;
  activeProject: any;
  folderId: string;
}

export const FileRow: React.FC<FileRowProps> = ({
	resource,
	setCurrentFile,
	currentFile,
	session,
	activeProject,
	folderId,
}) => {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const { setSidePanel } = useChatStore();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const { removeFile } = useDocumentStore();

	const { mutate } = useMutation({
		mutationFn: deleteFile,
		onError: (error) => {
			console.error(error);
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: [`fetchFiles-${folderId}`],
			});
			toast({
				title: "File Deleted Successfully",
				description: `File ${resource.file_name} deleted successfully`,
				duration: 20000,
			});
			setShowDeleteDialog(false);
			removeFile(folderId, resource.id);
		},
	});

	const handleDelete = () => {
		mutate({
			session,
			projectId: activeProject.project_id,
			fileId: resource.id,
		});
	};

	return (
		<TableRow
			className={`hover:bg-blue-100  ${
				currentFile?.id === resource.id ? "bg-blue-100" : ""
			}`}
			onClick={(e) => {
				e.stopPropagation();
				setSidePanel({
					isOpen: true,
					type: "sources",
					resourceId: resource.id,
					filename: `${resource.file_name}${resource.metadata.extension ? "." + resource.metadata.extension : ""}`,
				});
			}}
			onMouseEnter={() => setCurrentFile(resource)}
			onMouseLeave={() => setCurrentFile(null)}
		>
			<TableCell className="cursor-pointer">
				<div className="flex flex-row justify-start gap-4">
					<FileMediaIcon fileExt={resource.metadata?.extension ?? ""} />
					<div className="font-medium">{resource.file_name}</div>
				</div>
			</TableCell>
			<TableCell className="hidden sm:table-cell">
				<Badge variant="secondary">{resource.metadata?.extension ?? "unknown"}</Badge>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				{formatDate(resource.created_at ?? "")}
			</TableCell>
			<TableCell
				className="cursor-pointer hidden md:table-cell"
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				<Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
					<DialogTrigger asChild>
						<Tooltipped tooltip={`Delete ${resource.file_name}`}>
							<Trash
								className="text-red-400"
								onClick={(e) => {
									e.stopPropagation();
									setShowDeleteDialog(true);
								}}
								size={16}
							/>
						</Tooltipped>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<div className="grid gap-4">
							<div className="flex flex-col gap-2">
								<h3 className="text-lg font-semibold">Confirm Deletion</h3>
								<p className="text-sm text-gray-500">
                  Are you sure you want to delete {resource.file_name}? This
                  action cannot be undone.
								</p>
							</div>
							<div className="flex justify-end gap-3">
								<Button
									onClick={() => setShowDeleteDialog(false)}
									variant="outline"
								>
                  Cancel
								</Button>
								<Button onClick={handleDelete} variant="destructive">
                  Delete
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</TableCell>
		</TableRow>
	);
}; 