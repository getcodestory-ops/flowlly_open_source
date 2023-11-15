import React, { useRef, useEffect } from "react";
import {
  Flex,
  Button,
  Box,
  Icon,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import ContextSelection from "@/components/ChatInput/ContextSelection";
import ScheduleAssistant from "@/components/Schedule/ScheduleAssistant";
import { FiPlus } from "react-icons/fi";
import AddNewActivityModal from "@/components/Schedule/AddNewActivityModal";
import CSVUploader from "./CSVUpload/CSVUploader";
import { useScheduleUpdate } from "@/components/Agent/useAgentFunctions";

function ScheduleChatInterface() {
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const {
    chats,
    isPending,
    taskStatus,
    activeProject,
    handleChatSubmit,
    setChatInput,
    chatInput,
    isOpen,
    onClose,
    onOpen,
  } = useScheduleUpdate();

  //create a method to focus last element of chats array by auto scrolling to the bottom of the chat box
  useEffect(() => {
    if (!lastMessageRef) return;
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <Flex
      flex="1"
      mx={16}
      justifyContent={"end"}
      direction="column"
      bg="brand2.light"
      color="white"
      maxH={{ base: "80%", md: "100%" }}
      overscrollBehaviorY={"contain"}
    >
      <VStack
        alignSelf={"center"}
        align="start"
        spacing={4}
        overflowY={"scroll"}
        overscrollBehaviorY={"contain"}
        p="8"
        maxW="4xl"
        maxH={"70vh"}
      >
        {chats &&
          chats.length > 0 &&
          chats?.map((history, index) => (
            <Box
              key={index}
              p={4}
              color="white"
              fontSize={"lg"}
              lineHeight="1.5"
              bg="brand.mid"
              borderRadius="14px"
              whiteSpace="pre-line"
              ref={index === chats.length - 1 ? lastMessageRef : null}
            >
              <Text color="brand.accent">{`${history.sender}`}</Text>
              {history.message.content && (
                <Box fontSize="lg" lineHeight="1.5">
                  {history.message.content
                    ?.split("/n")
                    .map((line: string, i: number) => (
                      <Box key={i} mb="2" whiteSpace="pre-line">
                        {line}
                      </Box>
                    ))}
                </Box>
              )}
              {history.message.function_call && (
                <Text fontSize="lg" whiteSpace="pre-line">
                  Function: {history.message.function_call.name} <br />
                  Arguments: {history.message.function_call.arguments}
                </Text>
              )}
            </Box>
          ))}
      </VStack>
      {isPending ||
        (taskStatus && taskStatus.status === "pending" && <Spinner />)}
      {!activeProject && (
        <Flex height="full" justify={"center"} align={"center"}>
          Select a project to start
        </Flex>
      )}
      {activeProject && (
        <>
          <Box
            display="flex"
            alignItems="center"
            bg="brand.md"
            p={2}
            borderRadius="md"
          >
            {/* <AddNewActivityModal isOpen={isOpen} onClose={onClose} /> */}
          </Box>
          <Flex
            flexDirection={"column"}
            p="8"
            alignSelf={"center"}
            width="100%"
          >
            <Flex>
              {/* <Button
                leftIcon={<Icon as={FiPlus} />}
                color="brand.dark"
                variant="outline"
                borderColor="brand.dark"
                maxWidth="xs"
                _hover={{ bg: "gray.600", color: "white" }}
                onClick={onOpen}
                fontSize="xs"
              >
                Add Activity
              </Button>
              <CSVUploader /> */}
              <ContextSelection />
            </Flex>
            <ScheduleAssistant
              handleChatSubmit={handleChatSubmit}
              setChatInput={setChatInput}
              chatInput={chatInput}
            />
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default ScheduleChatInterface;
