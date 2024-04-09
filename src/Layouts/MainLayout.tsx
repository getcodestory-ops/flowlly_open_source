import React, { use, useEffect, useRef, useState } from "react";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import SidePanel from "@/Layouts/SidePanel";
import { useStore } from "@/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopBar from "@/components/TopBar/index";
import NewTopBar from "@/components/TopBar/TopBar";
import ProjectInfoDisplay from "@/components/ProjectDashboard/ProjectInfoDisplay";
import AiActions from "@/components/AiActions/AiActions";
import ProjectDashboard from "./ProjectDashboard";
import ScheduleUiView from "@/components/Schedule/ScheduleViewLeftPanel";
import Head from "next/head";
import { useRouter } from "next/router";
import DocumentList from "@/components/DocumentEditor/DocumentList";
import supabase from "@/utils/supabaseClient";
import NotesPage from "@/components/Notes/NotesPage";
import ReportsPage from "@/components/AiActions/ReportsPage";
import UpdatesPage from "@/components/AiActions/UpdatesPage";
import ProjectSetup from "./ProjectSetup";
import checkProjectStatus from "@/utils/checkProjectStatus";
import { useMediaQuery } from "@chakra-ui/react";
import Integration from "./Integration";
import DailyReports from "@/components/Dailies/DailyReport";

const queryClient = new QueryClient();

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const path = router.pathname;
  const [smallScreen] = useMediaQuery("(max-width: 1441px)");
  //check if router path has /auth/passwordchange
  //if so, render only the children

  const {
    setSessionToken,
    userProjects,
    appView,
    setAppView,
    AiActionsView,
    userActivities,
    setProjectStatus,
  } = useStore((state) => ({
    setSessionToken: state.setSession,
    userProjects: state.userProjects,
    appView: state.appView,
    setAppView: state.setAppView,
    AiActionsView: state.AiActionsView,
    userActivities: state.userActivities,
    setProjectStatus: state.setProjectStatus,
  }));

  const [settingsView, setSettingsView] = useState<string>("folders");

  useEffect(() => {
    // console.log("userActivities", userActivities);
    setProjectStatus(checkProjectStatus(userActivities));
  }, [userActivities]);

  const gridItemRef = useRef(null);

  const checkScrolling = (element: HTMLElement) => {
    const vertical = element.scrollHeight > element.clientHeight;
    const horizontal = element.scrollWidth > element.clientWidth;
    // console.log(`Vertical scrolling needed: ${vertical}`);
    // console.log(`Horizontal scrolling needed: ${horizontal}`);
  };

  useEffect(() => {
    // Check if the GridItem needs scrolling after the component mounts
    if (gridItemRef.current) {
      checkScrolling(gridItemRef.current);
    }
  }, []);

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        setAppView("login");
        router.replace("/");
      } else {
        setSessionToken(data?.session);
        if (path === "/auth/passwordChange") {
          setAppView("changePassword");
        } else {
          setAppView("schedule");
        }
      }
    }
    loginCheck();
  }, []);

  useEffect(() => {
    console.log("path", router.pathname);
    if (path === "/auth/passwordChange") {
      console.log("path", router.pathname);
      setAppView("changePassword");
    } else {
      setAppView("schedule");
    }
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>Construction Documentation </title>
        <meta
          name="description"
          content="Personal assistant for construction professionals"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <QueryClientProvider client={queryClient}>
          <Flex
            w="100vw"
            h="100vh"
            // direction={{ base: "column", md: "row" }}
            overflow="auto"
            p={smallScreen ? "0" : "2"}
          >
            {(appView === "login" || appView === "changePassword") && (
              <Flex>{children}</Flex>
            )}

            {appView !== "login" && appView !== "changePassword" && (
              <Grid
                w={"full"}
                templateRows="repeat(16, 1fr)"
                templateColumns="repeat(14, 1fr)"
                gap={4}
                p={2}
              >
                <GridItem colSpan={1} rowSpan={16}>
                  <NewTopBar />
                </GridItem>

                {AiActionsView === "expand" ? (
                  <GridItem colSpan={14} rowSpan={16}>
                    <AiActions />
                  </GridItem>
                ) : (
                  <>
                    <GridItem
                      colSpan={AiActionsView === "open" ? 13 : 13}
                      rowSpan={16}
                    >
                      <Grid
                        h="100%"
                        templateRows="repeat(15, 1fr)"
                        templateColumns="repeat(13, 1fr)"
                        gap={4}
                        bg={"white"}
                        rounded={"2xl"}
                        boxShadow={"lg"}
                      >
                        <GridItem rowSpan={1} colSpan={15}>
                          <ProjectInfoDisplay />
                        </GridItem>
                        {appView === "dashboard" && (
                          <GridItem rowSpan={15} colSpan={13} px={"2"} pb={"2"}>
                            {<ProjectDashboard />}
                          </GridItem>
                        )}
                        {appView === "schedule" && (
                          <GridItem rowSpan={15} colSpan={13} px={"4"} pb={"2"}>
                            <ScheduleUiView />
                          </GridItem>
                        )}
                        {appView === "notes" && (
                          <GridItem rowSpan={15} colSpan={13} px={"2"} pb={"2"}>
                            {<NotesPage />}
                          </GridItem>
                        )}
                        {/* {appView === "reports" && (
                          <GridItem rowSpan={5} colSpan={5} px={"2"} pb={"2"}>
                            {<ReportsPage />}
                          </GridItem>
                        )} */}
                        {appView === "updates" && (
                          <GridItem rowSpan={15} colSpan={13} px={"2"} pb={"2"}>
                            <DailyReports />
                          </GridItem>
                        )}
                        {(appView === "members" || appView === "folders") && (
                          <GridItem rowSpan={15} colSpan={13} px={"2"} pb={"2"}>
                            <ProjectSetup />
                          </GridItem>
                        )}
                        {appView === "integrations" && (
                          <GridItem rowSpan={15} colSpan={13} px={"2"} pb={"2"}>
                            <Integration />
                          </GridItem>
                        )}
                      </Grid>
                    </GridItem>
                    {/* <GridItem
                      colSpan={AiActionsView === "open" ? 4 : 1}
                      rowSpan={15}
                    >
                      <AiActions />
                    </GridItem> */}
                  </>
                )}
              </Grid>
            )}
          </Flex>
        </QueryClientProvider>
      </main>
    </>
  );
}
