import Head from "next/head";
import Dashboard from "@/Layouts/Dashboard";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabaseClient";
import checkAdminRights from "@/utils/checkAdminRights";
import Script from "next/script";
import { useStore } from "@/utils/store";
import ProjectSetup from "@/Layouts/ProjectSetup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Flex } from "@chakra-ui/react";
import SidePanel from "@/Layouts/SidePanel";

const queryClient = new QueryClient();

export default function DashboardPage() {
  const router = useRouter();
  const { setSessionToken, sessionToken, setAdminRights, hasAdminRights } =
    useStore((state) => ({
      setSessionToken: state.setSession,
      sessionToken: state.session,
      setAdminRights: state.setAdminRights,
      hasAdminRights: state.hasAdminRights,
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

  useEffect(() => {
    async function getAdminRights() {
      if (!sessionToken?.user.id) return;
      const adminRights = await checkAdminRights(sessionToken?.user.id);
      setAdminRights(adminRights);
    }
    getAdminRights();
  }, [sessionToken?.user]);

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
        {/* <Script src="https://tools.luckyorange.com/core/lo.js?site-id=5324bf34" strategy="afterInteractive"></Script> */}
        <QueryClientProvider client={queryClient}>
          <Flex height="100vh">
            <Flex zIndex="10">
              <SidePanel />
            </Flex>

            <Flex height={"full"} overflow={"scroll"} w="full">
              <ProjectSetup />
            </Flex>
          </Flex>
        </QueryClientProvider>
      </main>
    </>
  );
}
