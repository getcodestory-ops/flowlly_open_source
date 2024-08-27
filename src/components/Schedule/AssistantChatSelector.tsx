import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { FiPlus } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getAgentChatEntities } from "@/api/agentRoutes";
import AddNewChatEntity from "./AddNewChatEntity";
import { IoChevronDown } from "react-icons/io5";
import { BsChatLeftDots } from "react-icons/bs";

const AssistantChatSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const {
    session,
    activeProject,
    activeChatEntity,
    setActiveChatEntity,
    chatEntities,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
    chatEntities: state.chatEntities,
  }));

  return (
    <Flex flexDirection={"column"} borderColor={"gray.200"} fontSize={"xs"}>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<IoChevronDown />}
          size={"xs"}
          bg={"white"}
          _hover={{ bg: "brand.dark", color: "white" }}
        >
          Saved Chats
        </MenuButton>
        <MenuList>
          <MenuItem>
            <AddNewChatEntity isOpen={isOpen} onClose={onClose} />
            <Flex
              align="center"
              justify="center"
              gap="2"
              p="2"
              width="full"
              bg="none"
              _hover={{ bg: "none", color: "brand.dark" }}
              onClick={onOpen}
              cursor="pointer"
              borderRadius="md"
            >
              <Icon as={FiPlus} />
              <Text noOfLines={{ base: 2, md: 1 }} width="full">
                New Chat
              </Text>
            </Flex>
          </MenuItem>
          <MenuDivider />
          <Flex
            flexDir="column"
            maxH="60vh"
            overflow={"auto"}
            className="custom-scrollbar"
          >
            {chatEntities &&
              chatEntities.map((chatEntity, index) => (
                <MenuItem
                  key={`chat-${chatEntity.id}-index-${index}`}
                  onClick={() => setActiveChatEntity(chatEntity)}
                  _hover={{ bg: "gray.100" }}
                >
                  <Flex
                    alignItems={"center"}
                    w="full"
                    justifyContent={"space-between"}
                  >
                    <Flex alignItems={"center"}>
                      <Icon as={BsChatLeftDots} mr={4} />
                      <Text
                        fontWeight={
                          chatEntity.id === activeChatEntity?.id ? "bold" : ""
                        }
                      >
                        {chatEntity.chat_name}
                      </Text>
                    </Flex>
                  </Flex>
                </MenuItem>
              ))}
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default AssistantChatSelector;
