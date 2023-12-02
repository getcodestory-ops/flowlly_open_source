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
import TopActivitiesItems from "./TopActivitiesItem";
import { getProjects } from "@/api/projectRoutes";
import { useStore } from "@/utils/store";
import { ActivityEntity } from "@/types/activities";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

interface TopBarMenuItemsProps {
  taskToView: ActivityEntity;
  renderProjects: boolean;
}

const TopBarProjects = ({
  taskToView,
  renderProjects,
}: TopBarMenuItemsProps) => {
  const [activeProjectMenu, setActiveProjectMenu] =
    useState<ProjectEntity | null>(null);

  const { session, setActiveProject } = useStore((state) => ({
    session: state.session,
    userProjects: state.userProjects,
    setActiveProject: state.setActiveProject,
    setUserProjects: state.setUserProjects,
  }));

  const { data: projects, isLoading } = useQuery({
    queryKey: ["initialProjectList", session, taskToView],
    queryFn: () => getProjects(session!, taskToView.id ?? "SCHEDULE"),
    enabled: !!session?.access_token,
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      setActiveProjectMenu(projects[0]);
      setActiveProject(projects[0]);
    }
  }, [projects]);

  return (
    <>
      {projects && projects.length > 0 && (
        <Flex>
          {renderProjects && (
            <>
              <Menu>
                <MenuButton fontSize={"xs"} fontWeight={"black"}>
                  <Flex alignItems={"center"} ml="2">
                    {activeProjectMenu?.name ? activeProjectMenu.name : ""}
                    <Flex ml={"2"}>
                      <IoChevronDownOutline />
                    </Flex>
                  </Flex>
                </MenuButton>
                <MenuList>
                  {renderProjects &&
                    projects.map((project: ProjectEntity) => (
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
              </Menu>
              /
            </>
          )}

          {activeProjectMenu && (
            <TopActivitiesItems
              activeProjectMenu={activeProjectMenu}
              renderProjects={false}
            />
          )}
        </Flex>
      )}
    </>
  );
};
export default TopBarProjects;
