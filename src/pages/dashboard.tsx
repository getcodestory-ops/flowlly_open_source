import Head from "next/head";
import Dashboard from "@/Layouts/Dashboard";
import { Session } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabaseClient";
import checkAdminRights from "@/utils/checkAdminRights";

export default function DashboardPage() {
  const router = useRouter();
  const [sessionToken, setSessionToken] = useState<Session | null>();
  const [hasAdminRights, setAdminRights] = useState<boolean>(false);

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

  useEffect(()=>{
    async function getAdminRights() {
    if(!sessionToken?.user.id) return;
    const adminRights = await checkAdminRights(sessionToken?.user.id)
    setAdminRights(adminRights)
  }
    getAdminRights()
  },[sessionToken?.user])

  return (
    <>
      <Head>
        <title>Construction Documentation </title>
        <meta name="description" content="Your personal assistant for construction professionals" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Dashboard sessionToken={sessionToken!} hasAdminRights={hasAdminRights}/>
      </main>
    </>
  );
}
