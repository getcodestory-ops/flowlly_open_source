import React, { useState } from "react";
import { Button, Flex, Box, Icon, useToast, Heading } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import CreateNewProjectButton from "@/components/Schedule/NewProjectButton";
import { FiTrash } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { PiShareFatLight } from "react-icons/pi";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";
import AddNewChatEntity from "./AddNewChatEntity";
import ShareProjectModal from "./ShareProjectModal";

const ScheduleProjectPanel = () => {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);
  const shareModalOpen = () => setIsShareOpen(true);
  const shareModalClose = () => setIsShareOpen(false);

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
      <ShareProjectModal
        isShareOpen={isShareOpen}
        shareModalClose={shareModalClose}
      />

      <Box marginBottom="4">
        <Heading as="h2" size="md" color="white">
          Projects
        </Heading>
      </Box>
      <Flex>
        <CreateNewProjectButton />
      </Flex>
      {isLoading && <Heading color="white">Loading...</Heading>}
      {!isLoading &&
        projects &&
        projects.map((project: ProjectEntity) => (
          <Flex
            key={`${project.project_id}`}
            flexDir={"column"}
            boxShadow={
              project.project_id === activeProject?.project_id
                ? "0px 0px 1px 1px white"
                : "none"
            }
            borderRadius="md"
            _hover={{
              boxShadow: "0px 0px 8px 1px white",
            }}
            p={2}
            m={2}
            color="white"
          >
            <Flex
              justifyContent={"space-between"}
              cursor={"pointer"}
              onClick={() => setActiveProject(project)}
            >
              {project.name}
              {project.project_id === activeProject?.project_id && (
                <Flex justifyContent={"end"}>
                  <Button
                    color="white"
                    variant="ghost"
                    size={"sm"}
                    _hover={{ bg: "gray.600" }}
                    onClick={() => setIsShareOpen(true)}
                  >
                    <Icon as={PiShareFatLight} />
                  </Button>
                  <Button
                    color="white"
                    variant="ghost"
                    size={"sm"}
                    _hover={{ bg: "gray.600" }}
                    onClick={onOpen}
                  >
                    <Icon as={AiOutlinePlus} />
                  </Button>
                  <Button
                    color="white"
                    variant="ghost"
                    size={"sm"}
                    onClick={() => mutation.mutate()}
                    _hover={{ bg: "gray.600" }}
                  >
                    <Icon as={FiTrash} />
                  </Button>
                </Flex>
              )}
            </Flex>
            {project.project_id === activeProject?.project_id && (
              <Flex flexDir={"column"}>
                {chatEntitities &&
                  chatEntitities.map((chatEntity) => (
                    <Flex
                      key={chatEntity.id}
                      ml={8}
                      color="white"
                      cursor={"pointer"}
                      borderRadius="md"
                      m="2"
                      p="2"
                      boxShadow={
                        chatEntity.id === activeChatEntity.id
                          ? "0px 0px 1px 1px white"
                          : "none"
                      }
                      _hover={{
                        boxShadow: "0px 0px 8px 1px white",
                      }}
                      onClick={() => setActiveChatEntity(chatEntity)}
                    >
                      {chatEntity.chat_name}
                    </Flex>
                  ))}
              </Flex>
            )}
          </Flex>
        ))}
    </Flex>
  );
};

export default ScheduleProjectPanel;
