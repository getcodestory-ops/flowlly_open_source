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
    const url = `${serverUrl}/integrate/procore/${project_access_id}`;
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };
    axios
      .get(url, {
        params: { code: code },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      .then((response) => {
        toast({
          title: "Success",
          description: "Successfully integrated with Procore",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        router.push("/");
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

  return (
    <>
      <main style={{ textAlign: "center", fontWeight: "bold" }}>
        Integrating with Procore...
      </main>
    </>
  );
}
