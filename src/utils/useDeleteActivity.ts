import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { deleteActivity } from "@/api/activity_routes";
import { useStore } from "@/utils/store";
import { Task } from "gantt-task-react";

export const useDeleteActivity = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const { mutate: mutateDeleteActivity, isPending: deletePending } =
    useMutation({
      mutationFn: deleteActivity,
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

  const handleTaskDelete = (id: string) => {
    if (!activeProject || !session) return;

    const conf = window.confirm("Are you sure to delete the activity ?");
    if (conf) {
      mutateDeleteActivity({
        session,
        projectId: activeProject.project_id,
        activityId: id,
      });
    }
    return conf;
  };

  return handleTaskDelete;
};
