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
import { useStore } from "@/utils/store";

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

  const { activeChatEntity } = useStore((state) => ({
    activeChatEntity: state.activeChatEntity,
  }));

  //create a method to focus last element of chats array by auto scrolling to the bottom of the chat box
  useEffect(() => {
    if (!lastMessageRef) return;
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <Flex direction={"column"} w={"full"}>
      <Flex
        direction={"column"}
        w={"full"}
        alignItems={"center"}
        overflowY="scroll"
        py={"4"}
        h={"14.5%"}
      >
        {chats &&
          chats.length > 0 &&
          chats?.map((history, index) => (
            <Flex
              key={index}
              bg={"brand.mid"}
              color={"white"}
              mb={"6"}
              w={"80%"}
              p={"6"}
              direction={"column"}
              rounded={"lg"}
            >
              <Text as={"b"} mb={"1"} color={"brand.accent"}>
                {history.sender}
              </Text>
              <Text whiteSpace="pre-wrap">{history.message.content}</Text>
            </Flex>
          ))}
      </Flex>
      <Flex w={"full"}>
        {activeProject && (
          <>
            <Box
              display="flex"
              alignItems="center"
              bg="brand.md"
              p={2}
              borderRadius="md"
            ></Box>
            <Flex
              flexDirection={"column"}
              p="8"
              alignSelf={"center"}
              width="100%"
            >
              <Flex>
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
    </Flex>
  );
}

export default ScheduleChatInterface;
