import React from "react";
import { Flex,  Icon,   Text } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useStore } from "@/utils/store";

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
    <Flex
      align="center"
      justify="center"
      gap="2"
      p="2"
      width="full"
      bg="none"
      _hover={{ bg: "none", color: "brand.dark" }}
      onClick={() => createNewChat()}
      cursor="pointer"
      borderRadius="md"
    >
      <Icon as={FiPlus} />
      <Text noOfLines={{ base: 2, md: 1 }} width="full">
        New Chat
      </Text>
    </Flex>
    // </Flex>
  );
};

export default CreateNewChatButton;
