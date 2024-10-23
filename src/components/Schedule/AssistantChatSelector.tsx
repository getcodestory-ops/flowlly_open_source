import React, { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import { Plus, ChevronDown, MessageSquare } from "lucide-react";
import AddNewChatEntity from "./AddNewChatEntity";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const AssistantChatSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const { activeChatEntity, setActiveChatEntity, chatEntities } = useStore(
    (state) => ({
      activeChatEntity: state.activeChatEntity,
      setActiveChatEntity: state.setActiveChatEntity,
      chatEntities: state.chatEntities,
    })
  );

  //if activeChatEntity not among chatEntities, set it to the first chatEntity
  useEffect(() => {
    if (activeChatEntity && !chatEntities.includes(activeChatEntity)) {
      setActiveChatEntity(chatEntities[0]);
    }
  }, [chatEntities, activeChatEntity, setActiveChatEntity]);

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
          <AddNewChatEntity />
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

export default AssistantChatSelector;
