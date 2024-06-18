import React, { useState, useEffect } from "react";
import {
  Flex,
  Grid,
  GridItem,
  Text,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  Button,
} from "@chakra-ui/react";
import NEW_Menu from "../Menu/Menu";
import { MdOutlineSettings } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { useStore } from "@/utils/store";
import { ProjectEntity } from "@/types/projects";
import { useRouter } from "next/router";
import { ActivityEntity } from "@/types/activities";
import { IoShareSocialOutline, IoAddCircleOutline } from "react-icons/io5";
import checkProjectStatus from "@/utils/checkProjectStatus";
import ShareProjectModal from "../Schedule/ShareProjectModal";
import CreateNewProjectButton from "../Schedule/NewProjectButton";
import UserPanel from "../UserPanel";
interface TopBarMenuItemsProps {
  taskToView: ActivityEntity;
  renderProjects: number;
}

function ProjectInfoDisplay() {
  const router = useRouter();
  const [isShareOpen, setShareModal] = useState<boolean>(false);
  const {
    userProjects,
    activeProject,
    setActiveProject,
    setAppView,
    appView,
    userActivities,
    projectStatus,
  } = useStore((state) => ({
    userProjects: state.userProjects,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
    setAppView: state.setAppView,
    appView: state.appView,
    userActivities: state.userActivities,
    projectStatus: state.projectStatus,
  }));

  useEffect(() => {
    console.log("activeProject", activeProject?.name);
  }, [activeProject?.name]);

  return (
    <Flex h="100%">
      <ShareProjectModal
        isShareOpen={isShareOpen}
        shareModalClose={() => {
          setShareModal(false);
        }}
      />
      <Grid w={"full"} templateRows="repeat(1, 1fr)" gap={0}>
        <GridItem
          rowSpan={1}
          bgGradient="linear(brand.gray , white )"
          px={"4"}
          py={"3"}
          rounded={"2xl"}
        >
          <Flex justifyContent={"space-between"}>
            <Flex alignItems={"center"}>
              <Flex mr={"12"} alignItems={"baseline"}>
                <Text fontSize={"14px"} fontWeight={"medium"} mr={"2"}>
                  Project:
                </Text>
                {/* <Flex fontSize={"xs"}>PROJECT</Flex> */}

                {userProjects && userProjects.length > 0 && (
                  <Menu>
                    <MenuButton fontSize={"22px"} fontWeight={"bold"}>
                      <Flex alignItems={"center"}>
                        {activeProject?.name
                          ? activeProject.name
                          : "No Project"}
                        <Icon as={FaChevronDown} ml={"3"} boxSize={"4"} />
                      </Flex>
                    </MenuButton>
                    <MenuList
                      maxHeight={"70vh"}
                      overflowY={"auto"}
                      className="custom-scrollbar"
                    >
                      {userProjects.map((project, index) => (
                        <MenuItem
                          key={`project-menu-${project.project_id}`}
                          onClick={(e) => {
                            setActiveProject(project);
                          }}
                        >
                          <Flex alignItems={"center"}>{project.name}</Flex>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
              </Flex>
            </Flex>
            <Flex>
              <CreateNewProjectButton />
            </Flex>
          </Flex>
        </GridItem>
        {/* <GridItem colSpan={1}></GridItem> */}
      </Grid>
    </Flex>
  );
}

export default ProjectInfoDisplay;
