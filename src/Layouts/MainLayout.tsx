import React, { useEffect, useRef } from "react";
import { Flex, Grid, GridItem } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SideMenuPanel from "@/components/TopBar/SideMenuPanel";
import AiActions from "@/components/AiActions/AiActions";
import ScheduleInterface from "./ScheduleInterface";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
import ProjectSetup from "./ProjectSetup";
import checkProjectStatus from "@/utils/checkProjectStatus";
import Integration from "./Integration";
import {
  DocumentFolderModule,
} from "@/components/Dailies/DocumentModule";
import ProjectBoard from "@/components/ProjectDashboard/ProjectDashboard";
import ProjectInfoDisplay from "@/components/ProjectDashboard/ProjectInfoDisplay";
import ScheduleSummaryView from "@/components/Schedule/ScheduleSummaryView";
import { TooltipProvider } from "@/components/ui/tooltip";
const queryClient = new QueryClient();

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const path = router.pathname;

  const {
    setSessionToken,
    appView,
    setAppView,
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
  }, [userActivities]);

  useEffect(() => {
    async function loginCheck() {

      const { accessToken, refreshToken } = router.query;

      if (accessToken && refreshToken) {
        if (
          typeof accessToken === "string" &&
          typeof refreshToken === "string"
        ) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }

      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        setAppView("login");
        router.replace("/");
      } else {
        setSessionToken(data?.session);
        if (path === "/auth/passwordChange") {
          setAppView("changePassword");
        } else {
          setAppView("dashboard");
        }
      }
    }
    loginCheck();
  }, []);

  useEffect(() => {
    if (path === "/auth/passwordChange") {
      setAppView("changePassword");
    } else {
      setAppView("dashboard");
    }
  }, [router.pathname]);

  return (
    <>
      <main>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Flex w="100vw" h="100vh" bg={"#E5E5E5"} overflow="auto">
              {(appView === "login" || appView === "changePassword") && (
                <Flex w="100vw" h="100vh">
                  {children}
                </Flex>
              )}

              {appView !== "login" && appView !== "changePassword" && (
                <Flex width="full" flexDir="column" h="100vh" w="100vw">
                  <ProjectInfoDisplay />
                  <MainDisplayInLayout appView={appView} />
                </Flex>
              )}
            </Flex>
          </TooltipProvider>
        </QueryClientProvider>
      </main>
    </>
  );
}

export const MainDisplayInLayout = ({ appView }: { appView: string }) => {
  return (
    <Flex gap="2" p="1" w="full" flexGrow={1} overflow="auto">
      <Flex width="60px" zIndex={1}>
        <SideMenuPanel />
      </Flex>

      <Flex flexGrow={1} overflow={"hidden"}>
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
              <ScheduleInterface />
            </GridItem>
          )}
          {appView === "agent" && (
            <GridItem rowSpan={15} colSpan={13}>
              <AiActions />
            </GridItem>
          )}

          {appView === "updates" && (
            <GridItem rowSpan={15} colSpan={13}>
              <DocumentFolderModule />
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
  );
};
