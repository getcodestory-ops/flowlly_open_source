import { useState, useEffect } from "react";
import { CircularProgress, Box, Text } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/router";
import { Session } from "@supabase/supabase-js";
import supabase from "@/utils/supabaseClient";

export default function DataPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState(".");
  const [data, setData] = useState(null);
  const [sessionToken, setSessionToken] = useState<Session | null>();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length === 5) {
          return ".";
        } else {
          return prevDots + ".";
        }
      });
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        return;
      } else {
        setSessionToken(data?.session);
      }
    }
    loginCheck();
  }, []);

  useEffect(() => {
    async function uploadDataToSupabase(
      supabaseData: {
        user_id: string | string[];
        access_token?: string;
      },
      tableName: string
    ) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(supabaseData);

      if (error) {
        console.log("this is error", error);

        return error;
      } else {
        console.log("data uploaded successfully");
        return "okay";
      }
    }

    async function getData() {
      if (!sessionToken) return;
      const { code, installation_id } = router.query;
      console.log(code, installation_id);
      if (installation_id) {
        fetch(
          `https://fastapi.eastus.cloudapp.azure.com/generate_token?installation_id=${installation_id}&user_id=${sessionToken?.user.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionToken?.access_token}`,
            },
          }
        )
          .then((response) => response.json())
          .then((response) => {
            uploadDataToSupabase(response.message, "githubIntegration");
            uploadDataToSupabase(
              { user_id: response.message.user_id },
              "githubIntegrationStatus"
            );
          });
        window.close();
      }
      // const timer = setTimeout(() => {
      //   setLoading(false);
      //   window.close();
      // }, 2000);

      // return () => clearTimeout(timer);
    }
    getData();
  }, [router, sessionToken]);

  return (
    <>
      {loading ? (
        <div>
          <Box
            display="flex"
            flexDirection={"column"}
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <CircularProgress isIndeterminate color="blackAlpha.500" />
            <Box position="absolute" style={{ marginTop: "-88px" }}>
              <FaGithub size="40px" />
            </Box>

            <Text color="black" textAlign={"center"} mt="16">
              Integrating {dots}
            </Text>
          </Box>
        </div>
      ) : (
        <Box
          textAlign={"center"}
          display="flex"
          height="100vh"
          justifyContent={"center"}
          alignItems={"center"}
        >
          <div>
            Github Successfully integrated <br />
            You can close the window now !
          </div>
        </Box>
      )}
    </>
  );
}

//http://localhost:3000/auth/github?code=a0c899620a5596438236&installation_id=35348165&setup_action=install
