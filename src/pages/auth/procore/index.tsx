import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import supabase from "@/utils/supabaseClient";
// import { procoreIntegrateApi } from "@/api/integration_routes";
import { type Session } from "@supabase/supabase-js";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const { state, code } = router.query;
  const toast = useToast();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const postData = async (
    session: Session,
    project_access_id: string,
    code: string
  ) => {
    console.log(session, project_access_id);
    const url = `${serverUrl}/integrate/procore/${project_access_id}?code=${code}`;
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };
    axios
      .post(url, {
        headers: headers,
      })
      .then((response) => {
        toast({
          title: "Success",
          description: "Successfully integrated with Procore",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to integrate with Procore, try again !",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    if (!state || !code) {
      return;
    }
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Error",
          description: "You need to login first",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        router.push("/");
      } else {
        if (typeof state === "string" && typeof code === "string") {
          postData(data.session, state, code);
        }
      }
    }
    loginCheck();
  }, [state, code]);

  //   const postData = async (
  //     session: Session,
  //     project_access_id: string,
  //     code: string
  //   ) => {
  //     console.log(session, project_access_id);
  //     const url = `http://localhost:8004/integrate/procore/${project_access_id}?code=${code}`;
  //     const headers = {
  //       Authorization: `Bearer ${session.access_token}`,
  //     };
  //     axios
  //       .post(url, {
  //         headers: headers,
  //       })
  //       .then((response) => {
  //         console.log("Success:", response.data);
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error);
  //       });
  //   };

  //   useEffect(() => {
  //     const sessionStr = localStorage.getItem("session");
  //     const activeProjectStr = localStorage.getItem("activeProject");

  //     if (sessionStr !== null) {
  //       try {
  //         const session = JSON.parse(sessionStr);
  //         setSession(session);
  //       } catch (error) {
  //         console.error("Error parsing session:", error);
  //       }
  //     }

  //     if (activeProjectStr !== null) {
  //       try {
  //         const activeProject = JSON.parse(activeProjectStr);
  //         setActiveProject(activeProject);
  //       } catch (error) {
  //         console.error("Error parsing activeProject:", error);
  //       }
  //     }
  //   }, [setSession, setActiveProject]);

  //   // console.log(session,activeProject)

  //   async function fetchToken(code: any) {
  //     if (!session || !activeProject) {
  //       console.log("Either session or project is not valid !");
  //       return Promise.reject("Either session or project is not valid !");
  //     }
  //     return postData(session!, activeProject?.project_id, code);
  //   }
  //   const router = useRouter();
  //   const { code } = router.query;
  //   useEffect(() => {
  //     console.log(code);
  //     if (code) fetchToken(code);
  //   }, [code]);

  return (
    <>
      <Head>
        <title>Construction Documentation</title>
        <meta
          name="description"
          content="Your personal assistant for construction professionals"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ textAlign: "center", fontWeight: "bold" }}>
        Integrating with Procore...
      </main>
    </>
  );
}
