import React, { useState, useEffect } from "react";
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { FiPlus, FiTrash } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { ImFilesEmpty } from "react-icons/im";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";
import AddNewChatEntity from "./AddNewChatEntity";
import FileHandler from "@/Layouts/FileHandler";
import { BiConversation } from "react-icons/bi";
import { IoChevronDown } from "react-icons/io5";
import { BsChatLeftDots } from "react-icons/bs";

const AssistantChatSelector = () => {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);
  const [folderView, setFolderView] = useState(false);
  const onFolder = () => {
    setFolderView(!folderView);
    if (conversationView) {
      setConversationView(false);
    }
  };
  const [conversationView, setConversationView] = useState(false);
  const onConversation = () => {
    setConversationView(!conversationView);
    if (folderView) {
      setFolderView(false);
    }
  };

  const {
    session,
    activeProject,
    setActiveProject,
    activeChatEntity,
    setActiveChatEntity,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
  }));

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projectList", session],
    queryFn: () => getProjects(session!),
    enabled: !!session?.access_token,
  });

  const { data: chatEntitities, isLoading: chatsLoading } = useQuery({
    queryKey: ["chatEntityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      return getAgentChatEntities(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  const mutation = useMutation({
    mutationFn: () => deleteProject(session!, activeProject!.project_id),
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  return (
    <Flex
      flexDirection={"column"}
      borderColor={"gray.200"}
      // position={"absolute"}
      // mx="32"
      // top="28"
      // zIndex={"overlay"}
      fontSize={"xs"}
    >
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
          {chatEntitities &&
            chatEntitities.map((chatEntity, index) => (
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
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default AssistantChatSelector;
