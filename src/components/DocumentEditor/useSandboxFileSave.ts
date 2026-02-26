import { updateSandboxFile } from "@/api/folderRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

export const useSandboxFileSave = (sandboxId?: string, fileName?: string) => {
	const toast = useToast();
	const queryClient = useQueryClient();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));
	const isHtmlFile = /\.(html?|xhtml)$/i.test(fileName || "");

	const applyUpdatedContentToCache = (oldData: any, updatedContent: string) => {
		if (!oldData) return oldData;
		if (typeof oldData === "string") return updatedContent;
		if (oldData?.metadata) {
			return {
				...oldData,
				metadata: {
					...oldData.metadata,
					content: updatedContent,
				},
			};
		}
		return oldData;
	};

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
		onSuccess: (_data, updatedContent) => {
			if (activeProject && sandboxId && fileName) {
				if (!isHtmlFile) {
					queryClient.setQueriesData(
						{
							predicate: (query) => {
								const key = query.queryKey as unknown[];
								return (
									key[0] === "resource" &&
									key[1] === activeProject.project_id &&
									key[2] === sandboxId &&
									key[3] === "sandbox" &&
									key[4] === fileName
								);
							},
						},
						(oldData) => applyUpdatedContentToCache(oldData, updatedContent),
					);
				}

				if (!isHtmlFile) {
					queryClient.invalidateQueries({
						queryKey: ["resource", activeProject.project_id, sandboxId, "sandbox", fileName],
					});
				}
			}

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
