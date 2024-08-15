import React, { useRef, useEffect, useLayoutEffect } from "react";
import { Flex, Icon, Text, GridItem, Box } from "@chakra-ui/react";
import { useScheduleUpdate } from "@/components/Agent/useAgentFunctions";

import { IoChatboxEllipses } from "react-icons/io5";
import UpdateTaskForm from "../ChatInput/Forms/UpdateTaskForm";
import AgentMessageInteractiveView from "../AiActions/AgentMessageInteractiveView";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Mic, Paperclip } from "lucide-react";
import StreamComponent from "@/components/StreamResponse/StreamAgentChat";

function AssistantChatInterface() {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    activeProject,
    handleChatSubmit,
    setChatInput,
    chatInput,
    currentTaskId,
    session,
  } = useScheduleUpdate();

  // const { activeChatEntity } = useStore((state) => ({
  //   activeChatEntity: state.activeChatEntity,
  // }));

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chats]);

  return (
    <>
      <GridItem rowSpan={9} px={"4"} overflow="auto">
        <Box
          ref={chatContainerRef}
          overflowY="auto"
          width="full"
          fontSize={"xs"}
          maxHeight="calc(100vh - 200px)"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "gray",
              borderRadius: "24px",
            },
          }}
        >
          {chats &&
            chats.length > 0 &&
            chats?.map((history, index) => (
              <Box key={index} width="full">
                <Flex maxW="full" px="8" py="2" color="white">
                  <Flex
                    color="brand.dark"
                    fontWeight={"bold"}
                    bg="brand.background"
                    flexDirection={"column"}
                    p="4"
                    rounded="md"
                    mt="16"
                  >
                    <Flex>
                      <Icon
                        as={IoChatboxEllipses}
                        mr="2"
                        boxSize={"6"}
                        color={"brand.accent"}
                      />
                      <Text as={"b"} mb={"1"}>
                        {history.sender}
                      </Text>
                    </Flex>
                    {history.message.content && (
                      <AgentMessageInteractiveView message={history.message} />
                    )}
                  </Flex>
                </Flex>
              </Box>
            ))}
          {currentTaskId && session && (
            <StreamComponent
              key={currentTaskId}
              streamingKey={currentTaskId}
              authToken={session.access_token}
            />
          )}
        </Box>
      </GridItem>
      <GridItem
        rowSpan={1}
        px={"4"}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        py={"2"}
      >
        {activeProject && (
          <div
            className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
            x-chunk="dashboard-03-chunk-1"
          >
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              onChange={(e) => setChatInput(e.target.value)}
              value={chatInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleChatSubmit();
                }
              }}
            />
            <div className="flex items-center p-3 pt-0">
              <Button
                type="submit"
                size="sm"
                className="ml-auto gap-1.5"
                onClick={() => {
                  handleChatSubmit();
                }}
              >
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </GridItem>
    </>
  );
}

export default AssistantChatInterface;
