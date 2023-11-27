import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Button,
  Heading,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { IoChevronDownOutline } from "react-icons/io5";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";
import { FaBackward } from "react-icons/fa";
function TopBar() {
  const toast = useToast();
  const {
    session,
    activeProject,
    taskToView,
    setActiveProject,
    activeChatEntity,
    setActiveChatEntity,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    taskToView: state.taskToView,
    setActiveProject: state.setActiveProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
  }));

  const queryClient = useQueryClient();
  const [projects, setProjects] = useState<ProjectEntity[]>([]);

  const { data: initialProjectQuery } = useQuery({
    queryKey: ["initialProjectList", session],
    queryFn: () => getProjects(session!, "SCHEDULE"),
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  const { data: projectQuery, isLoading } = useQuery({
    queryKey: ["projectList", session, taskToView],
    queryFn: () => {
      if (taskToView.id !== "SCHEDULE")
        return getProjects(session!, taskToView.id);
      return [];
    },
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (
      (initialProjectQuery && initialProjectQuery.length > 0) ||
      (projectQuery && projectQuery.length > 0)
    ) {
      setProjects([...(initialProjectQuery ?? []), ...(projectQuery ?? [])]);
      if (projectQuery && projectQuery.length > 0) {
        setActiveProject(projectQuery[0]);
      }
    }
  }, [projectQuery, initialProjectQuery]);

  useEffect(() => {
    if (projects && projects.length > 0 && !activeProject) {
      setActiveProject(projects[0]);
    }
  }, [projects]);

  return (
    <Flex
      justifyContent={"flex-start"}
      w={"98%"}
      pt={"4"}
      zIndex={"999"}
      pl={"6"}
    >
      <Icon
        as={FaBackward}
        cursor={"pointer"}
        onClick={() => {
          setActiveProject(projects[0]);
        }}
      />
      <Menu>
        <MenuButton
          // as={Button}
          // rightIcon={<IoChevronDownOutline />}
          // size={"sm"}
          // bg={"brand2.mid"}
          // _hover={{ bg: "brand2.dark", color: "white" }}
          fontSize={"xl"}
          fontWeight={"black"}
        >
          <Flex alignItems={"center"}>
            {activeProject?.name ? activeProject.name : "No Project"}
            <Flex ml={"2"}>
              <IoChevronDownOutline />
            </Flex>
          </Flex>
        </MenuButton>
        <MenuList>
          {isLoading && <Heading color="white">Loading...</Heading>}
          {!isLoading &&
            projects &&
            projects.map((project: ProjectEntity) => (
              <Flex key={project.project_id}>
                <MenuItem onClick={() => setActiveProject(project)}>
                  {project.name}
                </MenuItem>
              </Flex>
            ))}
        </MenuList>
      </Menu>
      <Flex></Flex>
    </Flex>
  );
}

export default TopBar;
