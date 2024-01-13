import React, { useEffect } from "react";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import SidePanel from "@/Layouts/SidePanel";
import { useStore } from "@/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopBar from "@/components/TopBar/index";
import NewTopBar from "@/components/newUIComponents/NEW_TopBar";
import ProjectInfoDisplay from "@/components/newUIComponents/ProjectInfoDisplay";
import AiActions from "@/components/newUIComponents/NEW_AIActions";
import ProjectDashboard from "./ProjectDashboard";
import ScheduleUiView from "@/components/Schedule/ScheduleViewLeftPanel";
import Head from "next/head";
import { useRouter } from "next/router";
import DocumentList from "@/components/DocumentEditor/DocumentList";
import supabase from "@/utils/supabaseClient";

const queryClient = new QueryClient();

export default function NewLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setSessionToken, userProjects, appView, setAppView } = useStore(
    (state) => ({
      setSessionToken: state.setSession,
      userProjects: state.userProjects,
      appView: state.appView,
      setAppView: state.setAppView,
    })
  );

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        setAppView("login");
        router.replace("/");
      } else {
        setSessionToken(data?.session);
        setAppView("dashboard");
      }
    }
    loginCheck();
  }, [router]);

  useEffect(() => {
    console.log("userProjects", userProjects);
  }, [userProjects]);

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
          >
            {appView === "login" && <Flex>{children}</Flex>}
            {appView !== "login" && (
              <Grid
                w={"full"}
                templateRows="repeat(16, 1fr)"
                templateColumns="repeat(14, 1fr)"
                gap={4}
                p={4}
              >
                <GridItem colSpan={14} rowSpan={1}>
                  <NewTopBar />
                </GridItem>
                <GridItem colSpan={10} rowSpan={15}>
                  <Grid
                    h="100%"
                    templateRows="repeat(4, 1fr)"
                    templateColumns="repeat(5, 1fr)"
                    gap={4}
                  >
                    <GridItem rowSpan={1} colSpan={5}>
                      <ProjectInfoDisplay />
                    </GridItem>
                    {appView === "dashboard" && (
                      <GridItem rowSpan={4} colSpan={5}>
                        {<ProjectDashboard />}
                      </GridItem>
                    )}
                    {appView === "schedule" && (
                      <GridItem rowSpan={4} colSpan={5}>
                        <ScheduleUiView />
                      </GridItem>
                    )}
                    {appView === "notes" && (
                      <GridItem rowSpan={4} colSpan={5}>
                        <DocumentList />
                      </GridItem>
                    )}
                  </Grid>
                </GridItem>
                <GridItem colSpan={4} rowSpan={15}>
                  <AiActions />
                </GridItem>
              </Grid>
            )}
          </Flex>
        </QueryClientProvider>
      </main>
    </>
  );
}
