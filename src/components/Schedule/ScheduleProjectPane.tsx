import React, { useState } from "react";
import {
  Button,
  Flex,
  Box,
  Icon,
  useToast,
  Input,
  Heading,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { Session } from "@supabase/supabase-js";
import CreateNewProjectButton from "@/components/Schedule/NewProjectButton";
import { FiEdit, FiTrash, FiCheck, FiX } from "react-icons/fi";
import { BsChatLeftDots } from "react-icons/bs";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { ProjectEntity } from "@/types/projects";

const ScheduleProjectPanel = () => {
  const toast = useToast();
  const { session, activeProject, setActiveProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
  }));

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projectList", session],
    queryFn: () => getProjects(session!),
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
            color="white"
            justifyContent={"space-between"}
            borderRadius="md"
            boxShadow={
              project.project_id === activeProject?.project_id
                ? "0px 0px 1px 1px white"
                : "none"
            }
            p={2}
            m={2}
            cursor={"pointer"}
            onClick={() => setActiveProject(project)}
            _hover={{
              boxShadow: "0px 0px 8px 1px white",
            }}
          >
            {project.name}
            {project.project_id === activeProject?.project_id && (
              <Flex justifyContent={"end"}>
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
        ))}
    </Flex>
  );
};

export default ScheduleProjectPanel;
