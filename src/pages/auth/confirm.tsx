import React, { useState, useEffect, use } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Flex,
  Center,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";
import checkAdminRights from "@/utils/checkAdminRights";
import { Session } from "@supabase/supabase-js";
import { useStore } from "@/utils/store";
import { type EmailOtpType } from "@supabase/supabase-js";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<Session | null>();
  const [hasAdminRights, setAdminRights] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();
  const setAppView = useStore((state) => state.setAppView);

  useEffect(() => {
    async function loginCheck() {
      const { token_hash } = router.query;

      if (!token_hash) {
        router.replace("/");
      }
      if (typeof token_hash === "string") {
        const { data: userSession, error } = await supabase.auth.verifyOtp({
          type: "email",
          token_hash,
        });

        const { user, session } = userSession;

        if (session) {
          const { access_token, refresh_token } = session;
          await supabase.auth.setSession({ access_token, refresh_token });
          setSessionToken(session);
        }
      }

      const { data } = await supabase.auth.getSession();
    }
    loginCheck();
  }, [router]);

  useEffect(() => {
    if (sessionToken) {
      setAppView("schedule");
      router.push("/");
    }
  }, [sessionToken]);

  return (
    <Flex
      height="100vh"
      justifyContent={"center"}
      alignItems="center"
      width="100vw"
      bg="brand.dark"
    >
      <Flex w={"100vw"}>
        <Center
          p="2"
          width="full"
          height="100vh"
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Box p={6} borderRadius={8} width="full">
            <Heading
              size="xl"
              mb={4}
              textAlign="center"
              fontWeight="bold"
              letterSpacing="tight"
              color="brand.accent"
              display="flex"
              alignItems="center"
              flexDirection="column"
            >
              <Image
                src="https://qfktimnmlcnfowxuoune.supabase.co/storage/v1/object/public/logos/logo_full.svg"
                alt="logo"
                w={60}
                mb={4}
              />
              AI Project Management Assistant
            </Heading>
          </Box>
          <Box
            p={8}
            backgroundColor="brand.mid"
            borderRadius="md"
            m="8"
            textColor="white"
          >
            <Box p={6} borderRadius="md">
              <Heading mb={6}>Securely logging you in</Heading>
            </Box>
          </Box>
        </Center>
      </Flex>
    </Flex>
  );
}

export default function AcceptInvite() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return <ResetPassword />;
}
