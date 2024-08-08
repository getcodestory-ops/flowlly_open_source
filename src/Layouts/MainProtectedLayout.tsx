"use client";
import React, { useEffect } from "react";
import { Flex, Grid, GridItem } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import SideMenuPanel from "@/components/TopBar/TopBar";
// import AiActions from "@/components/AiActions/AiActions";
// import ScheduleUiView from "@/components/Schedule/ScheduleViewLeftPanel";

// import NotesPage from "@/components/Notes/NotesPage";
// import ProjectSetup from "./ProjectSetup";
import checkProjectStatus from "@/utils/checkProjectStatus";
// import Integration from "./Integration";
// import DocumentModule from "@/components/Dailies/DocumentModule";
// import ProjectBoard from "@/components/ProjectDashboard/ProjectDashboard";
// import ProjectInfoDisplay from "@/components/ProjectDashboard/ProjectInfoDisplay";
// import ScheduleSummaryView from "@/components/Schedule/ScheduleSummaryView";
import { ChakraProvider } from "@chakra-ui/react";
import { chakraTheme } from "@/utils/chakraTheme";
import { MainDisplayInLayout } from "./MainLayout";

import { TooltipProvider } from "@/components/ui/tooltip";
const queryClient = new QueryClient();

function MainLayout() {
  const {
    appView,
    userActivities,

    setProjectStatus,
  } = useStore((state) => ({
    setSessionToken: state.setSession,
    appView: state.appView,
    setAppView: state.setAppView,
    userActivities: state.userActivities,

    setProjectStatus: state.setProjectStatus,
  }));

  useEffect(() => {
    setProjectStatus(checkProjectStatus(userActivities));
  }, [userActivities, setProjectStatus]);

  return (
    <>
      <main>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Flex
              w="100vw"
              h="calc(100vh - 64px)"
              bg={"#E5E5E5"}
              overflow="auto"
            >
              <Flex
                width="full"
                flexDir="column"
                h="calc(100vh - 64px)"
                w="100vw"
              >
                <MainDisplayInLayout appView={appView} />
              </Flex>
            </Flex>
          </TooltipProvider>
        </QueryClientProvider>
      </main>
    </>
  );
}

export default function MainLayoutProvider() {
  return (
    <ChakraProvider theme={chakraTheme}>
      <MainLayout />
    </ChakraProvider>
  );
}
