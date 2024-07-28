import React, { useEffect } from "react";
import {
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";
import { useStore } from "@/utils/store";
import { FaRegBuilding } from "react-icons/fa";

import { FaCheck } from "react-icons/fa6";
import NotificationButton from "../Notifications/NotificationButton";

function ProjectInfoDisplay() {
  const { userProjects, activeProject, setActiveProject } = useStore(
    (state) => ({
      userProjects: state.userProjects,
      activeProject: state.activeProject,
      setActiveProject: state.setActiveProject,
    })
  );

  return (
    <Flex justifyContent="space-between" gap="8" w="full">
      <Flex color="white" gap="6">
        <Flex w="150px">
          <Image
            src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/logo_full.svg"
            alt="logo"
            w="100px"
          />
        </Flex>
        <Flex gap="2" justifyContent={"center"} alignItems={"center"}>
          <Flex fontSize="sm">
            <Icon as={FaRegBuilding} boxSize={"4"} />
          </Flex>
          <Flex>
            {userProjects && userProjects.length > 0 && (
              <Menu>
                <MenuButton fontSize="lg" fontWeight={"bold"}>
                  <Flex alignItems={"center"}>
                    {activeProject?.name ? activeProject.name : "No Project"}
                    <Icon as={FaChevronDown} ml={"3"} boxSize={"4"} />
                  </Flex>
                </MenuButton>
                <MenuList
                  maxHeight={"70vh"}
                  overflowY={"auto"}
                  className="custom-scrollbar"
                  color="black"
                  fontSize="sm"
                >
                  {userProjects.map((project, index) => (
                    <MenuItem
                      key={`project-menu-${project.project_id}`}
                      onClick={(e) => {
                        setActiveProject(project);
                      }}
                    >
                      <Flex alignItems={"center"} px="6" py="1" gap="2">
                        {project.project_id === activeProject?.project_id && (
                          <Icon as={FaCheck} ml="-5" color="green.400" />
                        )}
                        {project.name}
                      </Flex>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex mr="8">
        <NotificationButton />
      </Flex>
    </Flex>
  );
}

export default ProjectInfoDisplay;
