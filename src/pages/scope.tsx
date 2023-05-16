import Head from "next/head";
import Scope from "@/Layouts/Scope";
import { Session } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabaseClient";
import checkAdminRights from "@/utils/checkAdminRights";
import Script from "next/script";
import { useStore } from "@/utils/store";

export default function ScopePage() {
  const router = useRouter();
  const setSession = useStore((state) => state.setSession);
  const [sessionToken, setSessionToken] = useState<Session | null>();
  const [hasAdminRights, setAdminRights] = useState<boolean>(false);

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        router.replace("/");
      } else {
        setSession(data?.session);
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
        <Script
          src="https://tools.luckyorange.com/core/lo.js?site-id=5324bf34"
          strategy="afterInteractive"
        ></Script>
        <Scope sessionToken={sessionToken!} hasAdminRights={hasAdminRights} />
      </main>
    </>
  );
}
