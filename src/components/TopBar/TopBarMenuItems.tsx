import React, { useState, useEffect } from "react";
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { IoChevronDownOutline } from "react-icons/io5";
import { ProjectEntity } from "@/types/projects";

interface TopBarMenuItemsProps {
  activeProject: ProjectEntity | null;
  setActiveProject: (project: ProjectEntity) => void;
  userProjects: ProjectEntity[];
}

const TopBarMenuItems = ({
  activeProject,
  setActiveProject,
  userProjects,
}: TopBarMenuItemsProps) => {
  const [activeProjectMenu, setActiveProjectMenu] =
    useState<ProjectEntity | null>(null);

  return (
    <Flex>
      <Menu>
        <MenuButton fontSize={"xl"} fontWeight={"black"}>
          <Flex alignItems={"center"}>
            {activeProjectMenu?.name ? activeProjectMenu.name : ""}
            <Flex ml={"2"}>
              <IoChevronDownOutline />
            </Flex>
          </Flex>
        </MenuButton>
        <MenuList>
          {userProjects &&
            userProjects.map((project: ProjectEntity) => (
              <Flex key={project.project_id}>
                <MenuItem
                  onClick={() => {
                    setActiveProject(project);
                    setActiveProjectMenu(project);
                  }}
                >
                  {project.name}
                </MenuItem>
              </Flex>
            ))}
        </MenuList>
      </Menu>{" "}
    </Flex>
  );
};
export default TopBarMenuItems;
