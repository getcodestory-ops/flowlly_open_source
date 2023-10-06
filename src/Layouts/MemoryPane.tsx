import {
  Box,
  Button,
  Heading,
  List,
  ListItem,
  Icon,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

type Conversation = {
  id: number;
  title: string;
  message: {
    id: number;
    message: any;
    fromUser: boolean;
  }[];
};

interface Props {
  conversations: Conversation[];
  onNewChatClick: () => void;
  onConversationClick: (conversation: Conversation) => void;
}

const MemoryPane: React.FC<Props> = ({
  conversations,
  onNewChatClick,
  onConversationClick,
}) => {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    if (conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations]);

  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation);
    onConversationClick(conversation);
  };

  return (
    <Box
      backgroundColor="brand.mid"
      color="white"
      width="full"
      height="100vh"
      padding="4"
    >
      <Box marginBottom="4">
        <Heading as="h2" size="md">
          History
        </Heading>
      </Box>
      <Box marginBottom="4">
        {/* <Button
          backgroundColor="teal.700"
          colorScheme="teal"
          size={"sm"}
          onClick={onNewChatClick}
          _hover={{ bg: "teal.400" }}
        >
          <FaPlus />
          <Text ml="2" fontSize={"base"}>
            New Chat
          </Text>
        </Button> */}
      </Box>
      <List spacing={3}>
        {conversations.map((conversation) => (
          <ListItem
            backgroundColor={
              activeConversation?.id === conversation.id
                ? "brand.accent"
                : "brand.mid"
            }
            color={
              activeConversation?.id === conversation.id
                ? "brand.dark"
                : "brand.mid"
            }
            borderRadius={"4px"}
            cursor="pointer"
            key={conversation.id}
            onClick={() => handleConversationClick(conversation)}
            p="2"
            pl="4"
            // borderY="1px"
            _hover={{
              backgroundColor: "brand.dark",
              color: "brand.light",
            }}
          >
            {conversation.title}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MemoryPane;
