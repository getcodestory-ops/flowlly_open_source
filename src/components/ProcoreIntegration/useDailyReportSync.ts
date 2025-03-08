import { syncDocumentProcore } from "@/api/documentRoutes";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

export const useSyncProcore = (id?: string | string[]) => {
	const toast = useToast();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { mutate: syncProcore, isPending } = useMutation({
		mutationFn: () => {
			if (!session || typeof id !== "string" || !activeProject)
				return Promise.reject(
					"Session not found or document id is not correct !",
				);
			return syncDocumentProcore(session, activeProject.project_id, id);
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Document Processed successfully !",
				status: "success",
				duration: 4000,
				isClosable: true,
				position: "bottom-right",
			});
		},
	});

	return { syncProcore };
};
