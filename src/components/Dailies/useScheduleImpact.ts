import { useToast } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import {
  getScheduleRevisions,
  updateActivityRevision,
  rejectRevision,
} from "@/api/schedule_routes";

import { Revision } from "@/types/activities";

export const useScheduleImpact = (impactDate: string) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const { data: scheduleRevision, isLoading } = useQuery({
    queryKey: ["scheduleRevision", activeProject, impactDate],
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
      return getScheduleRevisions(
        session,
        activeProject.project_id,
        impactDate
      );
    },
    enabled: !!session?.access_token,
  });

  const mutation = useMutation({
    mutationFn: (revision: { id: string; revision: Revision }) => {
      if (!session?.access_token || !activeProject) {
        return Promise.reject("No active project or session");
      }
      return updateActivityRevision(
        session,
        activeProject.project_id,
        revision
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleRevision"] });
      toast({
        title: "Success",
        description: "Revision Updated",
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

  const rejectImpact = useMutation({
    mutationFn: (revisionId: string) => {
      if (!session?.access_token || !activeProject) {
        return Promise.reject("No active project or session");
      }
      return rejectRevision(session, activeProject.project_id, revisionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleRevision"] });
      toast({
        title: "Success",
        description: "Revision Updated",
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

  const updateActivity = (revision: { id: string; revision: Revision }) => {
    mutation.mutate(revision);
  };
  const rejectActivityRevision = (revisionId: string) => {
    rejectImpact.mutate(revisionId);
  };

  return {
    scheduleRevision,
    updateActivity,
    rejectActivityRevision,
  };
};
