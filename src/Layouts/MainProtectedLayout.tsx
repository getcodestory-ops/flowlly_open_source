"use client";
import React, { useEffect } from "react";
import { Flex, Grid, GridItem } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SideMenuPanel from "@/components/TopBar/TopBar";
import AiActions from "@/components/AiActions/AiActions";
import ScheduleUiView from "@/components/Schedule/ScheduleViewLeftPanel";

import NotesPage from "@/components/Notes/NotesPage";
import ProjectSetup from "./ProjectSetup";
import checkProjectStatus from "@/utils/checkProjectStatus";
import Integration from "./Integration";
import DocumentModule from "@/components/Dailies/DocumentModule";
import ProjectBoard from "@/components/ProjectDashboard/ProjectDashboard";
// import ProjectInfoDisplay from "@/components/ProjectDashboard/ProjectInfoDisplay";
import ScheduleSummaryView from "@/components/Schedule/ScheduleSummaryView";
import { ChakraProvider } from "@chakra-ui/react";
import { chakraTheme } from "@/utils/chakraTheme";

const queryClient = new QueryClient();

export function MainLayout() {
  const {
    // setSessionToken,
    appView,
    // setAppView,
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
    // console.log("userActivities", userActivities);
    setProjectStatus(checkProjectStatus(userActivities));
  }, [userActivities]);

  return (
    <>
      <main>
        <QueryClientProvider client={queryClient}>
          <Flex w="100vw" h="calc(100vh - 64px)" bg={"#E5E5E5"} overflow="auto">
            <Flex
              width="full"
              flexDir="column"
              h="calc(100vh - 64px)"
              w="100vw"
            >
              <Flex gap="2" p="1" w="full" flexGrow={1} overflow="auto">
                <Flex width="60px" zIndex={1}>
                  <SideMenuPanel />
                </Flex>

                <Flex flexGrow={1} overflow={"auto"}>
                  <Grid
                    h="full"
                    w="full"
                    templateRows="repeat(15, 1fr)"
                    templateColumns="repeat(13, 1fr)"
                    gap={4}
                    bg={"white"}
                    rounded={"2xl"}
                    boxShadow={"lg"}
                  >
                    {appView === "dashboard" && (
                      <GridItem rowSpan={15} colSpan={13}>
                        {<ScheduleSummaryView />}
                      </GridItem>
                    )}
                    {appView === "schedule" && (
                      <GridItem rowSpan={15} colSpan={13}>
                        <ScheduleUiView />
                      </GridItem>
                    )}
                    {appView === "notes" && (
                      <GridItem rowSpan={15} colSpan={13}>
                        {<NotesPage />}
                      </GridItem>
                    )}
                    {appView === "agent" && (
                      <GridItem rowSpan={15} colSpan={13}>
                        <AiActions />
                      </GridItem>
                    )}

                    {appView === "updates" && (
                      <GridItem rowSpan={15} colSpan={13}>
                        <DocumentModule />
                      </GridItem>
                    )}
                    {appView === "project" && (
                      <GridItem rowSpan={15} colSpan={13} h="full">
                        <ProjectBoard />
                      </GridItem>
                    )}
                    {(appView === "members" || appView === "folders") && (
                      <GridItem rowSpan={15} colSpan={13}>
                        <ProjectSetup />
                      </GridItem>
                    )}
                    {appView === "integrations" && (
                      <GridItem rowSpan={15} colSpan={13}>
                        <Integration />
                      </GridItem>
                    )}
                  </Grid>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
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
