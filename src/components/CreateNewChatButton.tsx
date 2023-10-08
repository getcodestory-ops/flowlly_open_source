import React from "react";
import { Box, Button, Icon, useToast, Heading } from "@chakra-ui/react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { useStore } from "@/utils/store";
import { createNewChatSession } from "@/api/chatRoutes";
import { Chat } from "@/types/chat";

const CreateNewChatButton = () => {
  // const toast = useToast();
  // const sessionToken = useStore((state) => state.session);
  const setChatSession = useStore((state) => state.setChatSession);
  const setChatHistory = useStore((state) => state.setChatHistory);
  // const setChatSessions = useStore((state) => state.setChatSessions);
  // const chatSessions = useStore((state) => state.chatSessions);

  const createNewChat = () => {
    setChatSession(null);
    setChatHistory([]);
    // const newChatSession: Chat = await createNewChatSession(
    //   sessionToken!,
    //   "New chat"
    // );

    // setChatSession(newChatSession);
    // toast({
    //   title: "New chat created successfully !",
    //   status: "success",
    //   duration: 2000,
    //   isClosable: true,
    //   position: "top-right",
    // });
    // const updatedChats: Chat[] = [newChatSession, ...chatSessions];
    // setChatSessions(updatedChats);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      bg="brand.md"
      p={2}
      width="full"
      borderRadius="md"
    >
      <Button
        leftIcon={<Icon as={FiPlus} />}
        color="white"
        width="full"
        variant="outline"
        borderColor="white"
        _hover={{ bg: "gray.600" }}
        onClick={() => createNewChat()}
      >
        New Conversation
      </Button>
    </Box>
  );
};

export default CreateNewChatButton;
