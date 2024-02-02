import React from "react";
import { Flex, Button, Icon, useToast, Heading, Text } from "@chakra-ui/react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { useStore } from "@/utils/store";
import { createNewChatSession } from "@/api/chatRoutes";
import { Chat } from "@/types/chat";

const CreateNewChatButton = () => {
  const setChatSession = useStore((state) => state.setChatSession);
  const setChatHistory = useStore((state) => state.setChatHistory);

  const createNewChat = () => {
    setChatSession(null);
    setChatHistory([]);
  };

  return (
    // <Flex
    //   display="flex"
    //   alignItems="center"
    //   p={2}
    //   width="full"
    //   borderRadius="md"
    // >
    <Button
      leftIcon={<Icon as={FiPlus} />}
      color="brand.dark"
      width="full"
      // variant="outline"
      // borderColor="white"
      _hover={{ bg: "none", color: "brand.dark" }}
      onClick={() => createNewChat()}
      // bg="brand.light"
      bg={"none"}
    >
      <Text
        noOfLines={{ base: 2, md: 1 }} // 2 lines on small screens, 1 line on medium and larger screens
        width="full"
        onClick={() => createNewChat()}
      >
        New Chat
      </Text>
    </Button>
    // </Flex>
  );
};

export default CreateNewChatButton;
