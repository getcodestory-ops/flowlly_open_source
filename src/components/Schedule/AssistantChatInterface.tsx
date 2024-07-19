import React, { useRef, useEffect } from "react";
import {
  Flex,
  Button,
  Icon,
  Text,
  Input,
  GridItem,
  Box,
} from "@chakra-ui/react";
import { useScheduleUpdate } from "@/components/Agent/useAgentFunctions";
import { useStore } from "@/utils/store";
import { BsSend } from "react-icons/bs";
import { IoChatboxEllipses } from "react-icons/io5";
import UpdateTaskForm from "../ChatInput/Forms/UpdateTaskForm";
import AgentMessageInteractiveView from "../AiActions/AgentMessageInteractiveView";

function AssistantChatInterface() {
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
    <>
      <GridItem rowSpan={9} px={"4"} overflow="auto">
        <Box overflowY="auto" width="full" fontSize={"xs"}>
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
                <Flex px="8">
                  {history.message?.role === "Scheduler" && (
                    <Flex flexDirection={"column"}>
                      <Flex textColor={"blue.400"} as="a">
                        <a
                          href={`/action_confirmation?actionType=scheduler&id=${history.id}`}
                        >
                          Link
                        </a>
                      </Flex>
                      <Flex>
                        <UpdateTaskForm data={history} />
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              </Box>
            ))}
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
          <Flex
            justifyContent={"center"}
            bg={"brand.background"}
            p={"2"}
            rounded={"xl"}
          >
            <Input
              size={"sm"}
              border={"white"}
              rounded={"lg"}
              placeholder={"Flowlly help me ..."}
              className="custom-selector"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleChatSubmit();
                }
              }}
            ></Input>

            <Button
              rounded={"full"}
              bg={"white"}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => {
                handleChatSubmit();
              }}
            >
              <Icon as={BsSend} fontSize={"22px"}></Icon>
            </Button>
          </Flex>
        )}
      </GridItem>
    </>
  );
}

export default AssistantChatInterface;
