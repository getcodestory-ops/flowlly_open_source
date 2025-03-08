import { updateStorageTextDocument } from "@/api/documentRoutes";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

export const useStorageTextFileSave = (id?: string | string[]) => {
	const toast = useToast();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

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
	});

	async function onSubmit(contentData: string) {
		mutate(contentData);
	}

	return {
		onSubmit,
		isPending,
	};
};
