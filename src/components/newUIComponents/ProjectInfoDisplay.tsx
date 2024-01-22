import React, { useEffect } from "react";
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
import NEW_Menu from "./NEW_Menu";
import { MdOutlineSettings } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { useStore } from "@/utils/store";
import { ProjectEntity } from "@/types/projects";
import { useRouter } from "next/router";
import { ActivityEntity } from "@/types/activities";
import { IoShareSocialOutline, IoAddCircleOutline } from "react-icons/io5";
import checkProjectStatus from "@/utils/checkProjectStatus";

interface TopBarMenuItemsProps {
  taskToView: ActivityEntity;
  renderProjects: number;
}

function ProjectInfoDisplay() {
  const router = useRouter();
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

  // useEffect(() => {
  //   console.log("activeProject", activeProject);
  //   console.log("userProjects", userProjects);
  // }, [activeProject]);

  return (
    <Flex h="100%">
      <Grid w={"full"} templateRows="repeat(2, 1fr)" gap={0}>
        <GridItem
          rowSpan={1}
          bgGradient="linear(brand.gray , white )"
          px={"4"}
          py={"4"}
          rounded={"2xl"}
        >
          <Flex justifyContent={"space-between"}>
            <Flex>
              <Flex mr={"12"}>
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
                    <MenuList>
                      {userProjects.map((project, index) => (
                        <MenuItem key={index}>
                          <Flex
                            onClick={() => setActiveProject(project)}
                            alignItems={"center"}
                          >
                            {project.name}
                          </Flex>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
              </Flex>
              <Flex fontSize={"sm"} alignItems={"flex-end"}>
                <Text mr={"2"}>Status:</Text>
                {userActivities && userActivities.length > 0 ? (
                  <Text
                    fontWeight={"bold"}
                    color={
                      projectStatus === "Delayed"
                        ? "red.400"
                        : projectStatus === "At Risk"
                        ? "orange.200"
                        : "brand.dark"
                    }
                  >
                    {projectStatus}
                  </Text>
                ) : (
                  <Text fontWeight={"bold"}>No Tasks</Text>
                )}
              </Flex>
            </Flex>
            <Flex justifyContent={"space-between"}>
              <Flex color={"black"} fontSize={"sm"}>
                {/* <Tooltip
                  label="Add File"
                  aria-label="A tooltip"
                  bg="white"
                  color="brand.dark"
                >
                  <Button
                    p={"1"}
                    size={"sm"}
                    bg={"white"}
                    rounded={"full"}
                    className="custom-shadow"
                    _hover={{ bg: "brand.dark", color: "white" }}
                    cursor={"pointer"}
                  >
                    <Icon as={IoAddCircleOutline} boxSize={"5"} />
                  </Button>
                </Tooltip> */}

                <Tooltip
                  label="Share Project"
                  aria-label="A tooltip"
                  bg="white"
                  color="brand.dark"
                >
                  <Button
                    p={"1"}
                    mx={"2"}
                    bg={"white"}
                    size={"sm"}
                    className="custom-shadow"
                    rounded={"full"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                    cursor={"pointer"}
                  >
                    <Icon as={IoShareSocialOutline} boxSize={"5"} />
                  </Button>
                </Tooltip>
                <Tooltip
                  label="Project Settings"
                  aria-label="A tooltip"
                  bg={"white"}
                  color="brand.dark"
                >
                  <Button
                    bg={
                      appView === "projectSettings" ? "brand.accent" : "white"
                    }
                    p={"1"}
                    size={"sm"}
                    rounded={"full"}
                    cursor={"pointer"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                    className="custom-shadow"
                    onClick={() => setAppView("projectSettings")}
                  >
                    <Icon as={MdOutlineSettings} boxSize={"5"} />
                  </Button>
                </Tooltip>
              </Flex>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <NEW_Menu />
        </GridItem>
      </Grid>
    </Flex>
  );
}

export default ProjectInfoDisplay;
