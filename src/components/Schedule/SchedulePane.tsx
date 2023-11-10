import React, { useState } from "react";
import {
  Button,
  Flex,
  Box,
  Icon,
  useToast,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import CreateNewProjectButton from "@/components/Schedule/NewProjectButton";
import { FiTrash } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { ImFilesEmpty } from "react-icons/im";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";
import AddNewChatEntity from "./AddNewChatEntity";
import { on } from "events";
import FileHandler from "@/Layouts/FileHandler";
import { BiConversation } from "react-icons/bi";

const SchedulePanel = () => {
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
    <Flex direction="column" height="100vh" bg="brand.mid" width="full" p="4">
      <AddNewChatEntity isOpen={isOpen} onClose={onClose} />
      <Box marginBottom="4">
        <Heading as="h2" size="md" color="white">
          Projects
        </Heading>
      </Box>
      <Flex>{/* <CreateNewProjectButton /> */}</Flex>
      {isLoading && <Heading color="white">Loading...</Heading>}
      {!isLoading &&
        projects &&
        projects.map((project: ProjectEntity) => (
          <Flex
            key={`${project.project_id}`}
            flexDir={"column"}
            bg={
              project.project_id === activeProject?.project_id
                ? "brand.dark"
                : "none"
            }
            borderRadius="md"
            _hover={
              project.project_id !== activeProject?.project_id
                ? {
                    bg: "brand.light",
                    color: "brand.dark",
                  }
                : {}
            }
            p={2}
            m={2}
            color="white"
          >
            <Flex
              justifyContent={"space-between"}
              cursor={"pointer"}
              onClick={() => setActiveProject(project)}
            >
              <Heading size={"md"}>{project.name}</Heading>
              {project.project_id === activeProject?.project_id && (
                <Flex justifyContent={"end"}>
                  {/* <Button
                    bg={folderView === true ? "brand.accent" : "none"}
                    color={folderView === true ? "brand.dark" : "white"}
                    variant="ghost"
                    size={"sm"}
                    _hover={{ bg: "gray.600" }}
                    onClick={onFolder}
                  >
                    <Icon as={ImFilesEmpty} />
                  </Button> */}
                  <Button
                    bg={conversationView === true ? "brand.accent" : "none"}
                    color={conversationView === true ? "brand.dark" : "white"}
                    variant="ghost"
                    size={"sm"}
                    _hover={{ bg: "gray.600" }}
                    onClick={onConversation}
                  >
                    <Icon as={BiConversation} />
                  </Button>
                  {/* <Button
                    color="white"
                    variant="ghost"
                    size={"sm"}
                    _hover={{ bg: "gray.600" }}
                    onClick={onOpen}
                  >
                    <Icon as={AiOutlinePlus} />
                  </Button> */}
                  {/* <Button
                    color="white"
                    variant="ghost"
                    size={"sm"}
                    onClick={() => mutation.mutate()}
                    _hover={{ bg: "gray.600" }}
                  >
                    <Icon as={FiTrash} />
                  </Button> */}
                </Flex>
              )}
            </Flex>
            {project.project_id === activeProject?.project_id &&
              conversationView === true && (
                <Flex flexDir={"column"} mt={4}>
                  <Heading
                    as="h2"
                    size="sm"
                    color="white"
                    marginLeft={"10px"}
                    marginBottom={"6px"}
                  >
                    Conversations
                  </Heading>
                  <Box
                    display="flex"
                    alignItems="center"
                    bg="brand.md"
                    p={2}
                    width="full"
                    borderRadius="md"
                  >
                    <Button
                      leftIcon={<Icon as={AiOutlinePlus} />}
                      color="white"
                      width="full"
                      variant="outline"
                      borderColor="white"
                      _hover={{ bg: "gray.600" }}
                      onClick={onOpen}
                    >
                      New Conversation
                    </Button>
                  </Box>
                  {chatEntitities &&
                    chatEntitities.map((chatEntity) => (
                      <Flex
                        key={chatEntity.id}
                        ml={8}
                        color={
                          chatEntity.id === activeChatEntity.id
                            ? "brand.dark"
                            : "white"
                        }
                        cursor={"pointer"}
                        borderRadius="md"
                        m="2"
                        p="2"
                        bg={
                          chatEntity.id === activeChatEntity.id
                            ? "brand.light"
                            : "none"
                        }
                        _hover={{
                          bg: "brand.mid",
                          color: "white",
                        }}
                        onClick={() => setActiveChatEntity(chatEntity)}
                      >
                        {chatEntity.chat_name}
                      </Flex>
                    ))}
                </Flex>
              )}
            {project.project_id === activeProject?.project_id &&
              folderView === true && (
                <Flex flexDir={"column"}>
                  <FileHandler />
                </Flex>
              )}
          </Flex>
        ))}
    </Flex>
  );
};

export default SchedulePanel;
