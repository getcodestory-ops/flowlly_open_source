import React, { useRef, useEffect } from "react";
import { Box, Flex, Icon, Spinner } from "@chakra-ui/react";
import ContextDisplay from "./ContextDisplay";
import { useStore } from "@/utils/store";
import { IoChatboxEllipses } from "react-icons/io5";

function ChatMessageDisplay() {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const chatMessages = useStore((state) => state.chatMessages);
  const selectedContext = useStore((state) => state.selectedContext);
  const context = useRef(selectedContext);

  useEffect(() => {
    context.current = selectedContext;
  }, [selectedContext]);

  useEffect(() => {
    if (!lastMessageRef) return;
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <Box
      overflowY="auto"
      width="full"
      ref={chatBoxRef}
      mb="8"
      h={{ base: "500px", md: "100%" }}
    >
      {chatMessages.map((message, index) => (
        <Box
          key={`${message?.id}-${message?.message?.slice(0, 5)}`}
          width="full"
          ref={index === chatMessages.length - 1 ? lastMessageRef : null}
        >
          <Flex maxW="full" px="8" py="2" justifyContent="center">
            <Box width="2xl">
              {message.fromUser === "question" && (
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
                  {message.message}
                </Flex>
              )}
              {message.fromUser === "answer" && (
                <Box borderBottom="2px " borderBottomColor={"brand.mid"}>
                  <Box
                    mb="16"
                    color="brand.light"
                    bg="brand.mid"
                    p="8"
                    borderRadius="14px"
                  >
                    {message.message === "loading..." ? (
                      <div>
                        <Spinner size="sm" />
                        Thinking...
                      </div>
                    ) : (
                      <Box fontSize="lg" lineHeight="1.5">
                        {message?.message
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
              {message.fromUser === "context" && (
                <Box>
                  <ContextDisplay
                    documentData={message.message}
                    chatFolder={context.current}
                  />
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
