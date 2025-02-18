import { useState } from "react";
import { useStore } from "@/utils/store";
import { getTaskStatus } from "@/api/schedule_routes";
import { talkToAgent } from "@/api/agentRoutes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentChats } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";
import { isTokenExpired } from "@/utils/isTokenExpired";
import { useToast } from "@/components/ui/use-toast";
import { createPlatformChatEntity } from "@/api/agentRoutes";

export function usePlatformChat(folderId: string, chatTarget: string) {
  const { toast } = useToast();
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

  const { mutate, isPending, data } = useMutation({
    mutationFn: talkToAgent,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agentChats"] });
      setChatInput("");
      setCurrentTaskId(data.agent_response);
    },
  });

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
      return createPlatformChatEntity(session, {
        project_id: activeProject.project_id,
        chat_name: "Flowlly Automated",
        chat_details:
          chatInput ||
          (chatTarget === "schedule"
            ? "Automated chat for schedule interaction"
            : "Automated chat for document interaction"),
        relation_id: folderId,
        relation_type: chatTarget,
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create chat entity",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "New chat entity created",
      });
      queryClient.invalidateQueries({ queryKey: ["documentChatEntityList"] });
      // Set the newly created chat entity as active
      useStore.setState({ activeChatEntity: data });
    },
  });

  const { data: chats, isLoading } = useQuery({
    queryKey: ["agentChats", session, activeChatEntity?.id],
    queryFn: () => {
      if (!session) {
        toast({
          title: "Error",
          description: "Please refresh the page and try again!",
          variant: "destructive",
        });
        return Promise.reject("refresh session");
      } else {
        if (isTokenExpired(session)) {
          toast({
            title: "Warning",
            description:
              "Your session has expired. Please refresh the page and try again!",
            variant: "destructive",
          });
          return Promise.reject("refresh session");
        }
      }

      if (!activeChatEntity) {
        toast({
          title: "Warning",
          description: "Select a chat to start!",
          variant: "destructive",
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
      brainId: folderId ?? null,
      chatId: currentActiveChatEntity.id,
      projectId: activeProject?.project_id,
      responseType: chatTarget ?? "folder",
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
    createChatEntityMutation,
  };
}
