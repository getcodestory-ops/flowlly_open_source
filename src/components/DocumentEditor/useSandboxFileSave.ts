import { updateSandboxFile } from "@/api/folderRoutes";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

export const useSandboxFileSave = (sandboxId?: string, fileName?: string) => {
	const toast = useToast();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { mutate, isPending } = useMutation({
		mutationFn: (contentData: string) => {
			if (!session || !sandboxId || !fileName || !activeProject) {
				return Promise.reject(
					"Session, sandbox ID, file name, or active project not found!",
				);
			}
			return updateSandboxFile({
				session,
				projectId: activeProject.project_id,
				sandboxId,
				fileName,
				updatedContent: contentData,
			});
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Sandbox file saved successfully!",
				status: "success",
				duration: 4000,
				isClosable: true,
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: "Could not save the sandbox file!",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		},
	});

	async function onSubmit(contentData: string) {
		mutate(contentData);
	}

	return {
		onSubmit,
		isPending,
	};
};
