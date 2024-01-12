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
} from "@chakra-ui/react";
import NEW_Menu from "./NEW_Menu";
import { MdOutlineSettings } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { useStore } from "@/utils/store";
import { ProjectEntity } from "@/types/projects";
import { useRouter } from "next/router";
import { ActivityEntity } from "@/types/activities";

interface TopBarMenuItemsProps {
  taskToView: ActivityEntity;
  renderProjects: number;
}

function ProjectInfoDisplay() {
  const router = useRouter();
  const { userProjects, activeProject, setActiveProject } = useStore(
    (state) => ({
      userProjects: state.userProjects,
      activeProject: state.activeProject,
      setActiveProject: state.setActiveProject,
    })
  );

  // const changeProject = (project: ProjectEntity) => {
  //   if (renderProjects === 1) {
  //     router.push({
  //       query: { ...router.query, projectId: project.project_id },
  //     });
  //   } else {
  //     setActiveProjectMenu(project);
  //     setActiveProject(project);
  //   }
  // };

  return (
    <Flex h="100%">
      <Grid w={"full"} templateRows="repeat(3, 1fr)" gap={0}>
        <GridItem
          rowSpan={2}
          bgGradient="linear(brand.gray , white )"
          px={"4"}
          py={"4"}
          rounded={"2xl"}
        >
          <Flex justifyContent={"space-between"} h={"full"}>
            <Flex alignItems={"flex-end"}>
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
              <Flex direction={"column"} fontSize={"sm"} pb={"1"}>
                <Text>STATUS</Text>
                <Text fontWeight={"bold"}>At Risk</Text>
              </Flex>
            </Flex>
            <Flex direction={"column"} justifyContent={"space-between"}>
              <Flex justifyContent="flex-end">
                <Flex bg={"white"} p={"1"} rounded={"full"}>
                  <Icon as={MdOutlineSettings} boxSize={"5"} />
                </Flex>
              </Flex>
              <Flex color={"black"} fontSize={"sm"}>
                <Flex
                  mr={"4"}
                  px={"2"}
                  py={"1"}
                  bg={"white"}
                  rounded={"md"}
                  className="custom-shadow"
                >
                  Add Files
                </Flex>
                <Flex
                  px={"2"}
                  py={"1"}
                  bg={"white"}
                  className="custom-shadow"
                  rounded={"md"}
                >
                  Share Project
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem colSpan={1} py={"2"}>
          <NEW_Menu />
        </GridItem>
      </Grid>
    </Flex>
  );
}

export default ProjectInfoDisplay;
