import React, { useEffect, useState } from "react";
import { Flex, useMediaQuery } from "@chakra-ui/react";
// import UserPanel from "../UserPanel";
import { useStore } from "@/utils/store";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
// import { getProjects } from "@/api/projectRoutes";
import { getActivities } from "@/api/activity_routes";
// import { getMembers } from "@/api/membersRoutes";

import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";

import MenuDrawer from "../Menu/Menu";

function SideMenuPanel() {
  const {
    session,
    // setUserProjects,
    // setActiveProject,
    activeProject,
    scheduleDate,
    scheduleProbability,
    setUserActivities,
    setTaskToView,
    // setMembers,
  } = useStore((state) => ({
    session: state.session,
    // setUserProjects: state.setUserProjects,
    // setActiveProject: state.setActiveProject,
    activeProject: state.activeProject,
    scheduleDate: state.scheduleDate,
    scheduleProbability: state.scheduleProbability,
    setUserActivities: state.setUserActivities,
    setTaskToView: state.setTaskToView,
    // setMembers: state.setMembers,
  }));

  const [hovered, setHovered] = useState<boolean>(false);
  // const [smallScreen] = useMediaQuery("(max-width: 1441px)");

  // const { data: projects } = useQuery({
  //   queryKey: ["initialProjectList", session],
  //   queryFn: () => getProjects(session!, "SCHEDULE"),
  //   enabled: !!session?.access_token,
  // });

  const defaultTask = {
    id: "SCHEDULE",
    project_id: "parent",
    name: "No active task",
    start: "01/02/23",
    end: "01/02/23",
    progress: 0,
    activity_critical: {
      critical_path: false,
    },
  };

  const { data: activities, isSuccess } = useQuery({
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
      setUserActivities(activities);
    } else if (isSuccess && activities && activities.length === 0) {
      setUserActivities([
        {
          id: "SCHEDULE",
          project_id: "parent",
          name: "No active task",
          start: "01/02/23",
          end: "01/02/23",
          progress: 0,
          activity_critical: {
            critical_path: false,
          },
        },
      ]);
    }
  }, [activities, isSuccess, setUserActivities]);

  useEffect(() => {
    setTaskToView(defaultTask);
  }, [activeProject]);

  // useEffect(() => {
  //   if (projects && projects.length > 0) {
  //     setUserProjects(projects);
  //     setActiveProject(projects[0]);
  //   }
  // }, [projects, setActiveProject, setUserProjects]);

  // const { data: members, isLoading: membersLoading } = useQuery({
  //   queryKey: ["memberList", session, activeProject],
  //   queryFn: async () => {
  //     if (!session || !activeProject) {
  //       return Promise.reject("No session or active project");
  //     }

  //     return getMembers(session, activeProject.project_id);
  //   },
  //   enabled: !!session?.access_token,
  // });

  // useEffect(() => {
  //   if (members && members.data.length > 0) {
  //     setMembers(members.data);
  //   }
  // }, [members, setMembers]);

  return (
    <Flex
      px={1}
      py={"4"}
      flexDirection={"column"}
      alignItems={"center"}
      justifyContent={"space-between"}
      bg={"brand.light"}
      h={"full"}
      rounded={"xl"}
      className="custom-shadow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Flex alignItems={"center"} flexDirection={"column"}>
        <MenuDrawer hovered={hovered} />
      </Flex>
      {/* <Flex
        flexDir="column"
        justifyContent={"center"}
        alignItems={"center"}
        gap="4"
      >
        <UserPanel />
      </Flex> */}
    </Flex>
  );
}

export default SideMenuPanel;
