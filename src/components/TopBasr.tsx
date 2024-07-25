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
import { getActivities, deleteActivity } from "@/api/activity_routes";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { ActivityEntity } from "@/types/activities";
import NotificationButton from "./Notifications/NotificationButton";

function TopBar() {
  const toast = useToast();

  const {
    session,
    userProjects,
    activeProject,
    taskToView,
    setRightPanelView,
    setTaskToView,
    setTaskDetailsView,
    setUserProjects,
    setActiveProject,
    userActivities,
    setUserActivities,
    activeChatEntity,
    setActiveChatEntity,
    scheduleDate,
    scheduleProbability,
  } = useStore((state) => ({
    session: state.session,
    userProjects: state.userProjects,
    setUserProjects: state.setUserProjects,
    userActivities: state.userActivities,
    setUserActivities: state.setUserActivities,
    activeProject: state.activeProject,
    taskToView: state.taskToView,
    setRightPanelView: state.setRightPanelView,
    setTaskToView: state.setTaskToView,
    setTaskDetailsView: state.setTaskDetailsView,
    setActiveProject: state.setActiveProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
    scheduleDate: state.scheduleDate,
    scheduleProbability: state.scheduleProbability,
  }));

  const queryClient = useQueryClient();
  // const [projects, setProjects] = useState<ProjectEntity[]>([]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["initialProjectList", session],
    queryFn: () => getProjects(session!, "SCHEDULE"),
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      setUserProjects(projects);
      setActiveProject(projects[0]);
    }
  }, [projects]);

  const {
    data: activities,
    isLoading: isLoadingActivities,
    isSuccess,
  } = useQuery({
    queryKey: [
      "activityList",
      session,
      activeProject,
      scheduleDate,
      scheduleProbability,
    ],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("Set session first !");
      }
      const date = getCurrentDateFormatted(scheduleDate || new Date());
      return getActivities(
        session,
        activeProject.project_id,
        date,
        scheduleProbability
      );
    },

    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  useEffect(() => {
    if (isSuccess && activities && activities.length > 0) {
      console.log("activities", activities);
      setUserActivities(activities);
    }
  }, [activities]);

  // const { data: projectQuery, isLoading } = useQuery({
  //   queryKey: ["projectList", session, taskToView],
  //   queryFn: () => {
  //     if (taskToView.id !== "SCHEDULE")
  //       return getProjects(session!, taskToView.id);
  //     return [];
  //   },
  //   enabled: !!session?.access_token,
  //   placeholderData: keepPreviousData,
  // });

  // useEffect(() => {
  //   if (
  //     (initialProjectQuery && initialProjectQuery.length > 0) ||
  //     (projectQuery && projectQuery.length > 0)
  //   ) {
  //     setProjects([...(initialProjectQuery ?? []), ...(projectQuery ?? [])]);
  //     if (projectQuery && projectQuery.length > 0) {
  //       setActiveProject(projectQuery[0]);
  //     }
  //   }
  // }, [projectQuery, initialProjectQuery]);

  // useEffect(() => {
  //   if (projects && projects.length > 0 && !activeProject) {
  //     setActiveProject(projects[0]);
  //   }
  // }, [projects]);

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
        <MenuButton fontSize={"xl"} fontWeight={"black"}>
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
            userProjects &&
            userProjects.map((project: ProjectEntity) => (
              <Flex key={project.project_id}>
                <MenuItem onClick={() => setActiveProject(project)}>
                  {project.name}
                </MenuItem>
              </Flex>
            ))}{" "}
        </MenuList>
      </Menu>
      /
      <Menu>
        <MenuButton fontSize={"xl"} fontWeight={"black"}>
          <Flex alignItems={"center"}>
            {taskToView?.name ?? "No Activity"}
            <Flex ml={"2"}>
              <IoChevronDownOutline />
            </Flex>
          </Flex>
        </MenuButton>
        <MenuList>
          {userActivities &&
            userActivities.map((activity: ActivityEntity) => (
              <Flex
                key={activity.id}
                onClick={() => {
                  setTaskToView(activity);
                  setRightPanelView("task");
                }}
              >
                <MenuItem>{activity.name}</MenuItem>
              </Flex>
            ))}
        </MenuList>
      </Menu>
      <Flex>
        <NotificationButton />
      </Flex>
    </Flex>
  );
}

export default TopBar;
