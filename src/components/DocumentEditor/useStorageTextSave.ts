import { updateStorageTextDocument } from "@/api/documentRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

export const useStorageTextFileSave = (id?: string | string[]) => {
	const toast = useToast();
	const queryClient = useQueryClient();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

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
			if (!session || typeof id !== "string" || !activeProject)
				return Promise.reject(
					"Session not found or document id is not correct !",
				);
			return updateStorageTextDocument(
				session,
				activeProject?.project_id,
				id,
				contentData,
			);
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: "Could not save the document !",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		},
		onSuccess: (_data, updatedContent) => {
			if (!activeProject || typeof id !== "string") return;

			queryClient.setQueriesData(
				{
					predicate: (query) => {
						const key = query.queryKey as unknown[];
						return (
							key[0] === "resource" &&
							key[1] === activeProject.project_id &&
							key[2] === id &&
							key[3] === "storage"
						);
					},
				},
				(oldData) => applyUpdatedContentToCache(oldData, updatedContent),
			);

			queryClient.invalidateQueries({
				queryKey: ["resource", activeProject.project_id, id, "storage"],
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
