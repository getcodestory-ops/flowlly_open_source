import React from "react";
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
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { IoChevronDownOutline } from "react-icons/io5";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";

function TopBar() {
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

  return (
    <Flex
      justifyContent={"flex-start"}
      w={"98%"}
      pt={"4"}
      zIndex={"999"}
      pl={"6"}
    >
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
              <>
                <MenuItem onClick={() => setActiveProject(project)}>
                  {project.name}
                </MenuItem>
              </>
            ))}
        </MenuList>
      </Menu>
      <Flex></Flex>
    </Flex>
  );
}

export default TopBar;
