import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { archiveActivity } from "@/api/activity_routes";
import { useStore } from "@/utils/store";
import { Task } from "gantt-task-react";

export const useArchiveActivity = () => {
	const toast = useToast();
	const queryClient = useQueryClient();

	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { mutate: mutateArchivectivity, isPending: deletePending } =
    useMutation({
    	mutationFn: archiveActivity,
    	onSuccess: (data) => {
    		toast({
    			title: "Success",
    			description: data.message,
    			status: "success",
    			duration: 4000,
    			isClosable: true,
    			position: "bottom-right",
    		});
    		queryClient.invalidateQueries({ queryKey: ["activityList"] });
    	},
    });

	const handleActivityArchive = (id: string) => {
		if (!activeProject || !session) return;

		mutateArchivectivity({
			session,
			projectId: activeProject.project_id,
			activityId: id,
		});
		return;
	};

	return handleActivityArchive;
};
