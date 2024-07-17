import React, { useState } from "react";
import { Flex, Grid, GridItem, Icon, useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import ShareProjectModal from "../Schedule/ShareProjectModal";
import CreateNewProjectButton from "../Schedule/NewProjectButton";
import { IoArrowBack } from "react-icons/io5";
import { CiShare2 } from "react-icons/ci";

function ProjectBoard() {
  const [isShareOpen, setShareModal] = useState<boolean>(false);
  const [subProjectMenu, setSubProjectMenu] = useState<boolean>(false);
  const toast = useToast();
  const { userProjects, activeProject, setActiveProject } = useStore(
    (state) => ({
      userProjects: state.userProjects,
      activeProject: state.activeProject,
      setActiveProject: state.setActiveProject,
    })
  );

  return (
    <Flex
      h="100%"
      overflowY={"scroll"}
      className="custom-scrollbar"
      bg="brand.light"
      p="4"
      borderRadius={"lg"}
    >
      <ShareProjectModal
        isShareOpen={isShareOpen}
        shareModalClose={() => {
          setShareModal(false);
        }}
      />
      <Grid w={"full"} templateColumns="repeat(4, 1fr)" gap={2}>
        {!subProjectMenu && userProjects && userProjects.length > 0 && (
          <>
            <GridItem colSpan={4} p="2" rounded={"2xl"}>
              <CreateNewProjectButton />
            </GridItem>
            {userProjects.map((project, index) => (
              <GridItem
                colSpan={1}
                p={"4"}
                rounded={"2xl"}
                key={`project-menu-${project.project_id}`}
                bg={
                  activeProject?.project_id === project.project_id
                    ? "green.100"
                    : "white"
                }
                onClick={(e) => {
                  toast({
                    title: "Project Selected",
                    description: `Successfully switched to ${project.name}`,
                    position: "bottom-right",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                  setActiveProject(project);
                  // setSubProjectMenu(true);
                }}
                cursor="pointer"
              >
                <Flex alignItems={"center"}>{project.name}</Flex>
                <Flex p="2">
                  <Icon
                    as={CiShare2}
                    cursor="pointer"
                    onClick={() => setShareModal(true)}
                  ></Icon>
                </Flex>
              </GridItem>
            ))}
          </>
        )}
        {subProjectMenu && (
          <GridItem colSpan={4} p={"4"} rounded={"2xl"} bg="brand.light">
            <Icon
              as={IoArrowBack}
              alignItems={"center"}
              fontSize="2xl"
              cursor={"pointer"}
              onClick={() => {
                setSubProjectMenu(false);
              }}
            ></Icon>
            <Flex alignItems={"center"}>Name : {activeProject?.name}</Flex>
            <Flex>Description : {activeProject?.description}</Flex>
            <Flex></Flex>
          </GridItem>
        )}
      </Grid>
    </Flex>
  );
}

export default ProjectBoard;
