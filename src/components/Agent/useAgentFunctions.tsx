import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { scheduleAgent, getTaskStatus } from "@/api/schedule_routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentChats } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";
import { isTokenExpired } from "@/utils/isTokenExpired";

export function useScheduleUpdate() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [chatInput, setChatInput] = useState<string>("");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const session = useStore((state) => state.session);
  const selectedContext = useStore((state) => state.selectedContext);
  const activeProject = useStore((state) => state.activeProject);
  const activeChatEntity = useStore((state) => state.activeChatEntity);

  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const getStatusAndUpdateChats = async (
    session: Session | null,
    currentTaskId: string | null
  ) => {
    if (!session || !currentTaskId) return Promise.reject("no session or task");
    queryClient.invalidateQueries({ queryKey: ["agentChats"] });
    const response = await getTaskStatus(session, currentTaskId);
    return response;
  };

  // const { data: taskStatus } = useQuery({
  //   queryKey: ["taskStatus", currentTaskId, session],
  //   queryFn: () => getStatusAndUpdateChats(session, currentTaskId),
  //   refetchInterval: 1000,
  //   enabled: !!session && !!currentTaskId,
  // });

  // useEffect(() => {
  //   if (!taskStatus) return;
  //   if (taskStatus.status === "completed") {
  //     queryClient.invalidateQueries({ queryKey: ["agentChats"] });
  //     toast({
  //       title: "Success",
  //       description: `Task completed successfully!`,
  //       status: "success",
  //       duration: 4000,
  //       isClosable: true,
  //       position: "bottom-right",
  //     });
  //     setCurrentTaskId(null);
  //   }
  // }, [taskStatus]);

  const { mutate, isPending, data } = useMutation({
    mutationFn: scheduleAgent,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agentChats"] });
      setChatInput("");
      setCurrentTaskId(data.agent_response);
    },
  });

  const { data: chats, isLoading } = useQuery({
    queryKey: ["agentChats", session, activeChatEntity?.id],
    queryFn: () => {
      if (!session) {
        toast({
          title: "Error",
          description: "Please refresh the page and try again!",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return Promise.reject("refresh session");
      } else {
        if (isTokenExpired(session)) {
          toast({
            title: "warning",
            description:
              "Your session has expired. Please refresh the page and try again!",
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
          return Promise.reject("refresh session");
        }
      }

      if (!activeChatEntity) {
        toast({
          title: "Warning",
          description: "Select a chat to start!",
          status: "warning",
          duration: 1000,
          isClosable: true,
        });
        return Promise.reject("select a chat");
      }

      return getAgentChats(session, activeChatEntity.id);
    },
    enabled: !!session && !!activeChatEntity?.id,
  });

  const handleChatSubmit = async () => {
    if (!session || !activeProject || !activeChatEntity.id) {
      return;
    }

    mutate({
      session,
      agentTask: chatInput,
      brainId: selectedContext?.id ?? null,
      chatId: activeChatEntity.id,
      projectId: activeProject?.project_id,
    });
  };

  return {
    chats,
    isPending,
    activeProject,
    isOpen,
    onClose,
    handleChatSubmit,
    setChatInput,
    chatInput,
    onOpen,
    currentTaskId,
    session,
  };
}
