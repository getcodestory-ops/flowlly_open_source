import React, { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";

import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";

import { getActivities } from "@/api/activity_routes";

import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";

import MenuDrawer from "../Menu/Menu";

function SideMenuPanel() {
  const {
    session,
    activeProject,
    scheduleDate,
    scheduleProbability,
    setUserActivities,
    setTaskToView,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    scheduleDate: state.scheduleDate,
    scheduleProbability: state.scheduleProbability,
    setUserActivities: state.setUserActivities,
    setTaskToView: state.setTaskToView,
  }));

  const [hovered, setHovered] = useState<boolean>(false);

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
    </Flex>
  );
}

export default SideMenuPanel;
