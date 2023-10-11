import React, { useRef, useEffect, useState } from "react";
import { Box, Flex, Icon, Spinner } from "@chakra-ui/react";
import ContextDisplay from "./ContextDisplay";
import { useStore } from "@/utils/store";
import { IoChatboxEllipses } from "react-icons/io5";
import { ChatHistory } from "@/types/chat";

function ChatMessageDisplay() {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatMessages = useStore((state) => state.chatMessages);
  const chatSessions = useStore((state) => state.chatSessions);
  const chatSession = useStore((state) => state.chatSession);
  const selectedContext = useStore((state) => state.selectedContext);
  const context = useRef(selectedContext);
  const [activeChatMessages, setActiveChatMessages] = useState<
    ChatHistory[] | null
  >(null);

  useEffect(() => {
    context.current = selectedContext;
  }, [selectedContext]);

  useEffect(() => {
    if (!lastMessageRef) return;
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const chatHistory = chatSessions.filter(
      (session) => session.chat_id === chatSession?.chat_id
    )[0];
    setActiveChatMessages(chatHistory?.chat_history ?? null);
  }, [chatSession, chatSessions]);

  return (
    <Box
      overflowY="auto"
      width="full"
      ref={chatBoxRef}
      mb="8"
      h={{ base: "500px", md: "100%" }}
    >
      {activeChatMessages &&
        activeChatMessages?.map((message, index) => (
          <Box
            key={`${message?.body.message_id}-${index}`}
            width="full"
            ref={
              index === activeChatMessages.length - 1 ? lastMessageRef : null
            }
          >
            <Flex
              maxW="full"
              px="8"
              py="2"
              justifyContent="center"
              color="white"
            >
              <Box width="2xl">
                {message.body?.user_message && (
                  <Flex
                    color="white"
                    fontWeight={"bold"}
                    bg="brand.dark"
                    p="4"
                    rounded="md"
                    mt="16"
                    alignItems={"center"}
                  >
                    <Icon
                      as={IoChatboxEllipses}
                      mr="2"
                      boxSize={"6"}
                      color={"brand.accent"}
                    />
                    {message.body.user_message}
                  </Flex>
                )}
                {message.body?.context && (
                  <Box>
                    <ContextDisplay
                      documentData={message.body.context}
                      chatFolder={context.current}
                    />
                  </Box>
                )}
                {message.body?.assistant && (
                  <Box borderBottom="2px " borderBottomColor={"brand.mid"}>
                    <Box
                      mb="16"
                      color="brand.light"
                      bg="brand.mid"
                      p="8"
                      borderRadius="14px"
                    >
                      {message.body.assistant === "loading..." ? (
                        <div>
                          <Spinner size="sm" />
                          Thinking...
                        </div>
                      ) : (
                        <Box fontSize="lg" lineHeight="1.5">
                          {message?.body.assistant
                            ?.split("/n")
                            .map((line: string, i: number) => (
                              <Box key={i} mb="2" whiteSpace="pre-line">
                                {line}
                              </Box>
                            ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        ))}
    </Box>
  );
}

export default ChatMessageDisplay;
