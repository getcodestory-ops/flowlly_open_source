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
import { ActivityEntity } from "@/types/activities";
import Breadcrubms from "./Breadcrubms";
import { useStore } from "@/utils/store";
import { getActivities } from "@/api/activity_routes";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";

interface TopActivitiesItemProps {
  activeProjectMenu: ProjectEntity;
  renderProjects: boolean;
  // setTaskToView: (project: ActivityEntity) => void;
  // setRightPanelView: (view: "task" | "gantt") => void;
  // activities: ActivityEntity[];
}

const TopActivitiesItems = ({
  activeProjectMenu,
  renderProjects,
}: TopActivitiesItemProps) => {
  const [activeActivity, setActiveActivity] = useState<ActivityEntity | null>(
    null
  );
  const {
    session,
    setUserActivities,
    setRightPanelView,
    setTaskToView,
    activeProject,
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

  const {
    data: activities,
    isLoading: isLoadingActivities,
    isSuccess,
  } = useQuery({
    queryKey: [
      "activityList",
      session,
      activeProjectMenu,
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
        activeProjectMenu.project_id,
        date,
        scheduleProbability
      );
    },

    enabled: !!session?.access_token && !!activeProjectMenu?.project_id,
  });

  useEffect(() => {
    activities && activities.length > 0 && setUserActivities(activities);
  }, [activities]);

  return (
    <>
      {activities && activities.length > 0 && (
        <Flex>
          <Menu>
            <MenuButton fontSize={"xs"} fontWeight={"black"}>
              <Flex alignItems={"center"}>
                {activeActivity?.name ?? ""}
                <Flex ml={"2"}>
                  <IoChevronDownOutline />
                </Flex>
              </Flex>
            </MenuButton>

            <MenuList>
              {activities.map((activity: ActivityEntity) => (
                <Flex
                  key={activity.id}
                  onClick={() => {
                    setTaskToView(activity);
                    setRightPanelView("task");
                    setActiveActivity(activity);
                  }}
                >
                  <MenuItem>{activity.name}</MenuItem>
                </Flex>
              ))}
            </MenuList>
          </Menu>
          /
          {activeActivity && (
            <Breadcrubms
              taskToView={activeActivity}
              renderProjects={renderProjects}
            />
          )}
        </Flex>
      )}
    </>
  );
};
export default TopActivitiesItems;
