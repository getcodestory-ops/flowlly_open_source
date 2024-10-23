import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { getTaskStatus } from "@/api/schedule_routes";
import { talkToAgent } from "@/api/agentRoutes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentChats } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";
import { isTokenExpired } from "@/utils/isTokenExpired";
import { createChatEntity } from "@/api/agentRoutes";

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

  const createChatEntityMutation = useMutation({
    mutationFn: () => {
      if (!session || !activeProject) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No session or active project",
        });
        return Promise.reject("No session or active project");
      }
      return createChatEntity(session, {
        project_id: activeProject.project_id,
        chat_name: "New Chat",
        chat_details: "Automated chat",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create chat entity",
        variant: "destructive",
      });
      return Promise.reject("Failed to create chat entity");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chat entity created",
      });
      queryClient.invalidateQueries({ queryKey: ["chatEntityList"] });
      useStore.setState({ activeChatEntity: data });
    },
  });

  const { mutate, isPending, data } = useMutation({
    mutationFn: talkToAgent,
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
    if (!session || !activeProject) {
      toast({
        title: "Error",
        description: "No session or active project",
        variant: "destructive",
      });
      return;
    }

    if (!activeChatEntity?.id) {
      // Create a new chat entity before submitting the chat
      await createChatEntityMutation.mutateAsync();
    }

    // Ensure we have an active chat entity after potential creation
    const currentActiveChatEntity = useStore.getState().activeChatEntity;

    if (!currentActiveChatEntity?.id) {
      toast({
        title: "Error",
        description: "Failed to create or retrieve chat entity",
        variant: "destructive",
      });
      return;
    }

    mutate({
      session,
      agentTask: chatInput,
      brainId: selectedContext?.id ?? null,
      chatId: currentActiveChatEntity.id,
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
