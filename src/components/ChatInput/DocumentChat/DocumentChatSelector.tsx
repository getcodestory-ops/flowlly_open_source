import React, { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import { Plus, ChevronDown, MessageSquare } from "lucide-react";
import { createDocumentChatEntity } from "@/api/agentRoutes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocumentChatEntities } from "@/api/agentRoutes";
import AddNewDocumentChatEntity from "./AddNewDocumentChatEntity";
import { toast } from "@/components/ui/use-toast";

const DocumentChatSelector = ({ folderId }: { folderId: string }) => {
  const queryClient = useQueryClient();

  const createDefaultChatEntity = useMutation({
    mutationFn: () => {
      if (!session || !activeProject) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No session or active project",
        });
        return Promise.reject("No session or active project");
      }
      return createDocumentChatEntity(session, {
        project_id: activeProject.project_id,
        chat_name: "Default Chat",
        chat_details: "Automatically created default chat",
        folder_id: folderId,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Chat entity created",
      });
      queryClient.invalidateQueries({ queryKey: ["documentChatEntityList"] });
      setActiveChatEntity(data);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error creating chat entity",
      });
    },
  });

  const { activeChatEntity, setActiveChatEntity, activeProject, session } =
    useStore((state) => ({
      activeChatEntity: state.activeChatEntity,
      setActiveChatEntity: state.setActiveChatEntity,
      activeProject: state.activeProject,
      session: state.session,
    }));

  const { data: chatEntities, isLoading: chatsLoading } = useQuery({
    queryKey: ["documentChatEntityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      return getDocumentChatEntities(
        session,
        activeProject.project_id,
        folderId
      );
    },
  });

  useEffect(() => {
    if (chatEntities && chatEntities.length > 0) {
      setActiveChatEntity(chatEntities[0]);
    } else {
      setActiveChatEntity(null);
    }
  }, [chatEntities, setActiveChatEntity]);

  return (
    <div className="flex flex-col text-xs">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-100"
          >
            Saved Chats
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <AddNewDocumentChatEntity folderId={folderId} />
          {/* <div className="flex items-center justify-center gap-2 p-2 w-full hover:text-gray-900 cursor-pointer rounded-md">
              <Plus className="h-4 w-4" />
              <span className="truncate">New Chat</span>
            </div> */}

          <DropdownMenuSeparator />
          <ScrollArea className="h-[60vh]">
            {chatEntities &&
              chatEntities.map((chatEntity, index) => (
                <DropdownMenuItem
                  key={`chat-${chatEntity.id}-index-${index}`}
                  onSelect={() => setActiveChatEntity(chatEntity)}
                  className="focus:bg-gray-100"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span
                        className={
                          chatEntity.id === activeChatEntity?.id
                            ? "font-bold"
                            : ""
                        }
                      >
                        {chatEntity.chat_name}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DocumentChatSelector;
