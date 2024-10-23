import React, { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import { Plus, ChevronDown, MessageSquare } from "lucide-react";
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
import { getPlatformChatEntities } from "@/api/agentRoutes";
import AddNewPlatformChatEntity from "./AddNewPlatformChatEntity";
import { toast } from "@/components/ui/use-toast";

const PlatformChatSelector = ({
  folderId,
  chatTarget,
}: {
  folderId: string;
  chatTarget?: string;
}) => {
  const queryClient = useQueryClient();

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
      return getPlatformChatEntities(
        session,
        activeProject.project_id,
        folderId,
        chatTarget
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
          <AddNewPlatformChatEntity folderId={folderId} />

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

export default PlatformChatSelector;
