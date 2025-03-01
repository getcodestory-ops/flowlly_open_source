import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createPlatformChatEntity } from "@/api/agentRoutes";
import { PenBoxIcon } from "lucide-react";
import { AgentChatEntity } from "@/types/agentChats";

function AddNewPlatformChatEntity({
  folderId,
  relationType,
  onComplete,
}: {
  folderId: string;
  relationType?: string;
  onComplete?: () => void;
}) {
  const {
    session,
    activeProject,
    setActiveChatEntity,
    setLocalChats,
    appendChatEntity,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setActiveChatEntity: state.setActiveChatEntity,
    setLocalChats: state.setLocalChats,
    appendChatEntity: state.appendChatEntity,
  }));
  const { toast } = useToast();

  const [chatName, setChatName] = useState("");
  const [chatDescription, setChatDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
        chat_name: chatName,
        chat_details: chatDescription,
        relation_id: folderId,
        relation_type: relationType || "folder",
      });
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (newChatEntity) => {
      toast({
        title: "Success",
        description: "Chat entity created",
      });

      // Instead of invalidating the query, directly update the store and query cache
      appendChatEntity(newChatEntity);

      // Also update the query cache directly
      const queryKey = ["documentChatEntityList", session, activeProject];
      const currentEntities =
        queryClient.getQueryData<AgentChatEntity[]>(queryKey) || [];
      queryClient.setQueryData(queryKey, [...currentEntities, newChatEntity]);

      // Clear input fields after success
      setChatName("");
      setChatDescription("");
    },
  });

  return (
    // <Popover>
    //   <PopoverTrigger>
    <Button
      size="sm"
      className="justify-center gap-2"
      onClick={() => {
        setActiveChatEntity(null);
        // Clear local chats when starting a new chat
        setLocalChats([]);
        if (onComplete) {
          onComplete();
        }
      }}
    >
      <PenBoxIcon className="w-4 h-4 " />
      New Chat
    </Button>
  );
}

export default AddNewPlatformChatEntity;
