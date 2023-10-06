import React, { useEffect, useState } from "react";
import { Button, Flex, Box, Icon, useToast, Input } from "@chakra-ui/react";
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

const AssistantPane = () => {
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
    <Flex direction="column" height="100vh" bg="brand.mid" width="full" p="4">
      <Flex>
        <CreateNewChatButton />
      </Flex>
      <Box marginY="4" borderBottom={"1px solid white"}>
        {/* <Heading as="h2" size="md" color="white">
          Conversations
        </Heading> */}
      </Box>
      {chatSessions.length > 0 &&
        chatSessions.map((chats) => (
          <>
            {editChatSessionId !== chats?.chat_id && (
              <Flex
                key={chats.chat_id}
                color="white"
                justifyContent={"space-between"}
                borderRadius="md"
                boxShadow={
                  chats.chat_id === chatSession?.chat_id
                    ? "0px 0px 1px 1px white"
                    : "none"
                }
                p={2}
                m={2}
                cursor={"pointer"}
                onClick={() => setChatSession(chats)}
                _hover={{
                  boxShadow: "0px 0px 8px 1px white",
                }}
              >
                <Flex justifyContent={"space-around"}>
                  <Icon as={BsChatLeftDots}></Icon>

                  <Flex ml={4}>{chats.chat_name}</Flex>
                </Flex>

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
                p={2}
                m={2}
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
                      color="white"
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
                      color="white"
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
          </>
        ))}
    </Flex>
  );
};

export default AssistantPane;
