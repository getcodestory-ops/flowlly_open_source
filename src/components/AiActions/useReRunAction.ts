import { useMutation } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { reRunTask } from "@/api/taskQueue";
import { useToast } from "@/components/ui/use-toast";

export function useReRunAction(taskId: string) {
	const { toast } = useToast();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { mutate } = useMutation({
		mutationFn: reRunTask,
		onSuccess: () => {
			//console.log("Task re-run successfully");
			toast({
				title: "Success",
				description:
          "Task is being re run now, please check results in few seconds !",
				duration: 9000,
			});
		},
		onError: (error) => {
			//console.log("Error re-running task", error);
		},
	});

	const reRun = (taskFunction: string) => {
		if (!session || !activeProject) return;

		mutate({
			session,
			taskId,
			taskFunction,
			projectId: activeProject.project_id,
		});
	};

	return { reRun };
}
