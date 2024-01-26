import React, { useEffect } from "react";
import { Flex, Image } from "@chakra-ui/react";
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
      console.log("activities", activities);
    }
  }, [activities]);

  useEffect(() => {
    if (projects && projects.length > 0) {
      setUserProjects(projects);
      setActiveProject(projects[0]);
      // console.log("projects", projects);
    }
  }, [projects]);

  return (
    <Flex
      px={4}
      py={"3"}
      alignItems={"center"}
      bg={"brand.gray"}
      h={"full"}
      justifyContent={"space-between"}
      rounded={"xl"}
      className="custom-shadow"
    >
      <Image
        src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/logo_full.svg"
        alt="logo"
        width="150px"
      />

      <Flex alignItems={"center"}>
        <CreateNewProjectButton />
        <UserPanel />
      </Flex>
    </Flex>
  );
}

export default NewTopBar;
