import React, { useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import SidePanel from "@/Layouts/SidePanel";
import { useStore } from "@/utils/store";
import ScheduleInterface from "@/Layouts/ScheduleInterface";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopBar from "@/components/TopBar/index";
import Head from "next/head";
import { useRouter } from "next/router";

import supabase from "@/utils/supabaseClient";

const queryClient = new QueryClient();

export default function NavBars({ children }: { children: React.ReactNode }) {
  const appView = useStore((state) => state.appView);
  const router = useRouter();
  const { setSessionToken } = useStore((state) => ({
    setSessionToken: state.setSession,
  }));

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        router.replace("/");
      } else {
        setSessionToken(data?.session);
      }
    }
    loginCheck();
  }, [router]);

  // useEffect(() => {
  //   console.log("appView", appView);
  //   console.log("children", children);
  // }, [appView]);

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
            // bg={"brand2.light"}
            // bg={"pink.200"}
            w="100vw"
            h="100vh"
            direction={{ base: "column", md: "row" }}
            overflow="auto"
          >
            <div className="overlay ">
              <SidePanel />
            </div>
            <Flex direction={"column"} h="100vh" w="full">
              <Flex h="5vh">
                <TopBar />
              </Flex>
              <Flex h={{ base: "90vh", md: "95vh" }}>{children}</Flex>
            </Flex>
          </Flex>
        </QueryClientProvider>
      </main>
    </>
  );
}
