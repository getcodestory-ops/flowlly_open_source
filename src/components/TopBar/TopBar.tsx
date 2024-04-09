import React, { useEffect } from "react";
import { Divider, Flex, Image } from "@chakra-ui/react";
import flowlly_logo from "../../img/logo_full.svg";
import UserPanel from "../UserPanel";
import { useStore } from "@/utils/store";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getActivities, deleteActivity } from "@/api/activity_routes";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import CreateNewProjectButton from "../Schedule/NewProjectButton";
import NotificationButton from "../Notifications/NotificationButton";
import NEW_Menu from "../Menu/Menu";
import { useMediaQuery } from "@chakra-ui/react";
import ConfigureDailyUpdate from "../Schedule/ConfigureTaskQueue/ConfigureDailyUpdate";

function NewTopBar() {
  const {
    session,
    setUserProjects,
    setActiveProject,
    activeProject,
    scheduleDate,
    scheduleProbability,
    setUserActivities,
  } = useStore((state) => ({
    session: state.session,
    setUserProjects: state.setUserProjects,
    setActiveProject: state.setActiveProject,
    activeProject: state.activeProject,
    scheduleDate: state.scheduleDate,
    scheduleProbability: state.scheduleProbability,
    setUserActivities: state.setUserActivities,
  }));

  const [smallScreen] = useMediaQuery("(max-width: 1441px)");
  const queryClient = useQueryClient();
  // const [projects, setProjects] = useState<ProjectEntity[]>([]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["initialProjectList", session],
    queryFn: () => getProjects(session!, "SCHEDULE"),
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

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
    if (projects && projects.length > 0) {
      setUserProjects(projects);
      setActiveProject(projects[0]);
    }
  }, [projects, setActiveProject, setUserProjects]);

  return (
    <Flex
      px={1}
      py={"4"}
      flexDirection={"column"}
      alignItems={"center"}
      justifyContent={"space-between"}
      bg={"#14213D"}
      h={"full"}
      rounded={"xl"}
      className="custom-shadow"
    >
      {smallScreen ? (
        <Image
          src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/identifyier.svg"
          alt="logo"
          w="25%"
          // transform={"rotate(90deg) "}
        />
      ) : (
        <Image
          src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/logo_full.svg"
          alt="logo"
          w="80%"
          // transform={"rotate(90deg) "}
        />
      )}
      <Flex alignItems={"center"} flexDirection={"column"}>
        {/* <CreateNewProjectButton /> */}
        <NEW_Menu />

        {/* <NotificationButton /> */}
        <Flex mt={"8"}>
          <ConfigureDailyUpdate />
        </Flex>
      </Flex>
      <UserPanel />
    </Flex>
  );
}

export default NewTopBar;
