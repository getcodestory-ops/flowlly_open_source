import React, { useState } from "react";
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
  Icon,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { IoChevronDownOutline } from "react-icons/io5";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";
import FileHandler from "./FileHandler";
import CSVUploader from "@/components/Schedule/CSVUpload/CSVUploader";

function ProjectSetup() {
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
  const [settingsView, setSettingsView] = useState<string>("folders");

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projectList", session],
    queryFn: () => getProjects(session!),
    enabled: !!session?.access_token,
  });

  const folderAndFIles = () => {
    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={"24"} w={"60%"} mt={"8"}>
        <GridItem colSpan={1}>
          <Flex direction={"column"}>
            <Text fontSize={"md"} as={"b"} mb={"4"}>
              Project Files
            </Text>
            <FileHandler />
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction={"column"}>
            <Text fontSize={"md"} as={"b"} mb={"4"}>
              Schedule Files
            </Text>
            <CSVUploader />
          </Flex>
        </GridItem>
      </Grid>
    );
  };

  console.log("projects", projects);

  return (
    <Flex direction={"column"} w={"100%"} p={"10"}>
      <Flex
        direction={"column"}
        // alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Flex direction={"column"}>
          <Menu>
            <MenuButton>
              <Flex alignItems={"center"} fontSize={"2xl"} fontWeight={"black"}>
                <Text mr={"2"}>
                  {activeProject?.name ? activeProject.name : "Select Project"}
                </Text>
                <Icon as={IoChevronDownOutline} />
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem>+ Create new project</MenuItem>
              <MenuDivider borderColor={"gray.500"} />
              {isLoading && <Heading color="white">Loading...</Heading>}
              {!isLoading &&
                projects &&
                projects.map((project: ProjectEntity) => (
                  <>
                    <MenuItem
                      onClick={() => setActiveProject(project)}
                      as={"b"}
                    >
                      {project.name}
                    </MenuItem>
                  </>
                ))}
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      {activeProject ? (
        <>
          <Flex
            direction={"column"}
            // alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Flex
              className="menu"
              w={"450px"}
              justifyContent={"space-between"}
              mt={"6"}
            >
              <Button
                bg={settingsView === "folders" ? "brand.accent" : "brand.light"}
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => setSettingsView("folders")}
              >
                Folders and Files
              </Button>
              <Button
                bg={settingsView === "members" ? "brand.accent" : "brand.light"}
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => setSettingsView("members")}
              >
                Members
              </Button>
              <Button
                bg={
                  settingsView === "resources" ? "brand.accent" : "brand.light"
                }
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => setSettingsView("resources")}
              >
                Resources
              </Button>
            </Flex>
          </Flex>
          {settingsView === "folders" && folderAndFIles()}
        </>
      ) : (
        <>
          <Flex
            fontSize={"3xl"}
            fontWeight={"black"}
            color={"brand.mid"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"100%"}
          >
            {" "}
            Select or create a project at the top left corner
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default ProjectSetup;
