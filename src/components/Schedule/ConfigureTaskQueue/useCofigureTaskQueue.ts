import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import {
  getTaskQueue,
  addModifyTaskQueue,
  deleteTaskQueue,
} from "@/api/taskQueue";
import { getMembers } from "@/api/membersRoutes";
import { AddTaskQueue } from "@/types/taskQueue";

export const useConfigureTaskQueue = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const defaultQueueItem: AddTaskQueue = {
    task_name: "",
    task_args: {
      project_id: activeProject?.project_id ?? "",
      project_name: activeProject?.name ?? "",
      task_owner_ids: [],
    },
    task_function: "generate_daily_briefing",
    run_config: {
      day: [],
      start: new Date().toISOString().split("T")[0],
      end: "",
      time: [],
      time_zone: "America/Toronto",
    },
    active: true,
  };

  const [editQueueItem, setEditQueueItem] =
    useState<AddTaskQueue>(defaultQueueItem);

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["memberList", session, activeProject],
    queryFn: async () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }

      return getMembers(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  const { data: taskQueue, isLoading } = useQuery({
    queryKey: ["taskQueue", activeProject],
    queryFn: () => {
      if (!session?.access_token || !activeProject) {
        toast({
          title: "Error",
          description: "No active project or session",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return Promise.reject("No active project or session");
      }
      return getTaskQueue(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  const mutation = useMutation({
    mutationFn: (queueItem: AddTaskQueue) => {
      if (!session?.access_token || !activeProject) {
        return Promise.reject("No active project or session");
      }
      return addModifyTaskQueue(session, activeProject.project_id, queueItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskQueue"] });
      toast({
        title: "Success",
        description: "Task Queue Updated",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const { mutate: deleteTaskQueueItem } = useMutation({
    mutationFn: (id: string) => {
      if (!session?.access_token || !activeProject) {
        return Promise.reject("No active project or session");
      }
      return deleteTaskQueue(session, activeProject.project_id, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskQueue"] });
      toast({
        title: "Success",
        description: "Task Queue Updated",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const saveTaskQueue = () => {
    console.log;
    mutation.mutate(editQueueItem);
  };

  return {
    taskQueue,
    members,
    defaultQueueItem,
    editQueueItem,
    setEditQueueItem,
    saveTaskQueue,
    deleteTaskQueueItem,
  };
};
