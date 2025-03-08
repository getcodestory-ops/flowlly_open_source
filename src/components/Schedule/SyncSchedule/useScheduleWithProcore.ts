import { syncScheduleProcore, syncScheduleImpact } from "@/api/projectRoutes";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

export const useScheduleSync = () => {
	const toast = useToast();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { mutate: syncSchedule, isPending } = useMutation({
		mutationFn: () => {
			if (!session || !activeProject)
				return Promise.reject(
					"Session not found or document id is not correct !",
				);
			return syncScheduleProcore(session, activeProject.project_id);
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

	const { mutate: syncImpact } = useMutation({
		mutationFn: (impactDate: string) => {
			if (!session || !activeProject)
				return Promise.reject(
					"Session not found or document id is not correct !",
				);
			return syncScheduleImpact(session, activeProject.project_id, impactDate);
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

	return { syncSchedule, syncImpact };
};
