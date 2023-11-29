import React, { useState, useEffect } from "react";
import { ProjectEntity } from "@/types/projects";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjects } from "@/api/projectRoutes";
import { getActivities } from "@/api/activity_routes";
import { useStore } from "@/utils/store";
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
import TopBarMenuItems from "./TopBarMenuItems";
import TopActivitiesItems from "./TopActivitiesItem";
import { FaBackward } from "react-icons/fa";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { ActivityEntity } from "@/types/activities";

function Breadcrubms({ taskToView }: { taskToView: ActivityEntity }) {
  const [initialProjectList, setInitialProjectList] = useState<ProjectEntity[]>(
    []
  );
  const {
    session,
    userProjects,
    setRightPanelView,
    setTaskToView,
    activeProject,
    setTaskDetailsView,
    setUserProjects,
    setActiveProject,
    userActivities,
    setUserActivities,
    scheduleDate,
    scheduleProbability,
  } = useStore((state) => ({
    session: state.session,
    userProjects: state.userProjects,
    setUserProjects: state.setUserProjects,
    userActivities: state.userActivities,
    setUserActivities: state.setUserActivities,
    activeProject: state.activeProject,
    setRightPanelView: state.setRightPanelView,
    setTaskToView: state.setTaskToView,
    setTaskDetailsView: state.setTaskDetailsView,
    setActiveProject: state.setActiveProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
    scheduleDate: state.scheduleDate,
    scheduleProbability: state.scheduleProbability,
  }));

  const { data: projects, isLoading } = useQuery({
    queryKey: ["initialProjectList", session, taskToView],
    queryFn: () => getProjects(session!, taskToView.id ?? "SCHEDULE"),
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      setUserProjects(projects);
      setActiveProject(projects[0]);
    }
    if (taskToView.id === "SCHEDULE") {
      setInitialProjectList(projects);
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
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isSuccess && activities && activities.length > 0) {
      setUserActivities(activities);
    }
  }, [activities]);

  return (
    <Flex
      justifyContent={"space-between"}
      w={"98%"}
      pt={"4"}
      zIndex={"999"}
      pl={"6"}
    >
      <Flex>
        <Icon
          as={FaBackward}
          cursor={"pointer"}
          onClick={() => {
            setActiveProject(initialProjectList[0]);
          }}
        />
        <TopBarMenuItems
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          userProjects={initialProjectList}
        />
        /
        <TopBarMenuItems
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          userProjects={userProjects}
        />
      </Flex>
      <Flex>
        <TopActivitiesItems
          taskToView={taskToView}
          setTaskToView={setTaskToView}
          setRightPanelView={setRightPanelView}
          activities={userActivities}
        />
      </Flex>
    </Flex>
  );
}

export default Breadcrubms;
