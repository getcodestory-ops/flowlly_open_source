import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Box,
  Icon,
  useToast,
  Input,
  Heading,
  Stack,
  Collapse,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { Session } from "@supabase/supabase-js";
import {
  getChatSessions,
  deleteChatSession,
  updateChatSessionName,
} from "@/api/chatRoutes";
import CreateNewChatButton from "@/components/CreateNewChatButton";
import { FiEdit, FiTrash, FiCheck, FiX } from "react-icons/fi";
import { BsChatLeftDots } from "react-icons/bs";
import { MdBorderColor } from "react-icons/md";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const SearchMemory = () => {
  const toast = useToast();
  const {
    session,
    chatSession,
    setChatSession,
    setChatSessions,
    chatSessions,
  } = useStore((state) => ({
    session: state.session,
    chatSession: state.chatSession,
    setChatSession: state.setChatSession,
    setChatSessions: state.setChatSessions,
    chatSessions: state.chatSessions,
  }));

  const [refreshChatList, setRefreshChatList] = useState<Boolean>(false);
  const [editChatSessionId, setEditChatSessionId] = useState<string>("");
  const [newChatSessionName, setNewChatSessionName] = useState<string>("");
  const [show, setShow] = useState(false);
  const isLargerThanLg = useBreakpointValue({ base: false, lg: false });

  const deleteChat = async (chatId: string) => {
    if (!session) return;
    const response = await deleteChatSession(session, chatId);
    setChatSession(null);
    setChatSessions(chatSessions.filter((chats) => chats.chat_id !== chatId));
    toast({
      title: response.message,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  useEffect(() => {
    if (!session || chatSessions.length > 0) return;
    const fetchchat = async () => {
      try {
        const chats = await getChatSessions(session);
        setChatSessions(chats);
        setChatSession(chats[0]);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchchat();
  }, [session]);

  useEffect(() => {
    if (isLargerThanLg !== undefined) {
      setShow(isLargerThanLg);
    }
  }, [isLargerThanLg]);

  const editChatSessionMetadata = async (chatId: string) => {
    setEditChatSessionId("");
    const updateChat = await updateChatSessionName(
      session!,
      chatId,
      newChatSessionName
    );
    setChatSessions([
      updateChat,
      ...chatSessions.filter((chats) => chats.chat_id !== chatId),
    ]);
    toast({
      title: `Successfully updated  ${updateChat.chat_name}`,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  return (
    <Flex
      flexDirection={"column"}
      borderColor={"gray.200"}
      position={"absolute"}
      mx="32"
      top="28"
      zIndex={"overlay"}
      fontSize={"xs"}
    >
      <Button
        onClick={() => setShow((state) => !state)}
        size="xs"
        w="16"
        variant="outline"
        background="white"
        rightIcon={show ? <FaChevronUp /> : <FaChevronDown />}
      >
        chats
      </Button>
      <Collapse in={show} animateOpacity>
        <Flex
          direction="column"
          width="full"
          p="4"
          bg={"brand.light"}
          overflow={"auto"}
          borderRadius={"md"}
          boxShadow={"lg"}
        >
          <Flex marginBottom="4">
            <Heading as="h6" size="sm" color="brand.dark">
              Conversations
            </Heading>
          </Flex>
          <Flex>
            <CreateNewChatButton />
          </Flex>
          <Flex direction="column" w="full">
            {chatSessions.length > 0 &&
              chatSessions.map((chats, index) => (
                <Flex
                  key={`chat-${chats.chat_id}-index-${index}`}
                  direction={{ base: "column", lg: "row" }}
                  w="full"
                >
                  {editChatSessionId !== chats?.chat_id && (
                    <Stack
                      // Stack direction changes based on screen size
                      rounded={
                        chatSession?.chat_id === chats.chat_id ? "md" : ""
                      }
                      bg={
                        chatSession?.chat_id === chats.chat_id
                          ? "brand.dark"
                          : ""
                      }
                      alignItems={"start"}
                      key={`chat-${chats.chat_id}-index-${index}`}
                      color={
                        chatSession?.chat_id === chats.chat_id
                          ? "white"
                          : "brand.dark"
                      }
                      p={2}
                      m={2}
                      cursor={"pointer"}
                      onClick={() => setChatSession(chats)}
                      _hover={{
                        bg: "white",
                        color: "brand.dark",
                        borderRadius: "md",
                      }}
                      w="full"
                    >
                      <Flex
                        justifyContent={"space-around"}
                        alignItems={"center"}
                      >
                        <Icon as={BsChatLeftDots}></Icon>
                        <Flex ml={4}>{chats.chat_name}</Flex>

                        {chats.chat_id === chatSession?.chat_id && (
                          <Flex justifyContent={"end"}>
                            <Button
                              color="white"
                              variant="ghost"
                              size={"sm"}
                              onClick={() => {
                                setNewChatSessionName(chatSession?.chat_name);
                                setEditChatSessionId(chatSession?.chat_id);
                              }}
                              _hover={{ bg: "gray.600" }}
                            >
                              <Icon as={FiEdit} />
                            </Button>
                            <Button
                              color="white"
                              variant="ghost"
                              size={"sm"}
                              onClick={() => deleteChat(chatSession?.chat_id)}
                              _hover={{ bg: "gray.600" }}
                            >
                              <Icon as={FiTrash} />
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    </Stack>
                  )}
                  {editChatSessionId === chats?.chat_id && (
                    <Flex
                      key={`edit-${chats.chat_id}`}
                      color="white"
                      justifyContent={"space-between"}
                      borderRadius="md"
                      boxShadow={
                        chats.chat_id === chatSession?.chat_id
                          ? "0px 0px 1px 1px white"
                          : "none"
                      }
                      cursor={"pointer"}
                      onClick={() => setChatSession(chats)}
                      _hover={{
                        boxShadow: "0px 0px 8px 1px white",
                      }}
                    >
                      <Input
                        placeholder={chats.chat_name}
                        value={newChatSessionName!}
                        onChange={(e) => setNewChatSessionName(e.target.value)}
                      />

                      {chats.chat_id === chatSession?.chat_id && (
                        <Flex justifyContent={"end"}>
                          <Button
                            color="brand.dark"
                            variant="ghost"
                            size={"sm"}
                            onClick={() => {
                              editChatSessionMetadata(chatSession?.chat_id);
                            }}
                            _hover={{ bg: "gray.600" }}
                          >
                            <Icon as={FiCheck} />
                          </Button>
                          <Button
                            color="brand.dark"
                            variant="ghost"
                            size={"sm"}
                            onClick={() => setEditChatSessionId("")}
                            _hover={{ bg: "gray.600" }}
                          >
                            <Icon as={FiX} />
                          </Button>
                        </Flex>
                      )}
                    </Flex>
                  )}
                </Flex>
              ))}
          </Flex>
        </Flex>
      </Collapse>
    </Flex>
  );
};

export default SearchMemory;
