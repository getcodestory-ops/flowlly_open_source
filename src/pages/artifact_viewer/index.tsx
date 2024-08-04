import React, { useState, useEffect } from "react";
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
import { Session } from "@supabase/supabase-js";
import { getAgentChatHistoryItem } from "@/api/agentRoutes";
import { Antartifact } from "@/types/agentChats";
import ArtifactViewer from "@/components/AiActions/ArtifactViewer";
import { ChakraProvider } from "@chakra-ui/react";
import { chakraTheme } from "@/utils/chakraTheme";

function Viewer() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [sessionToken, setSessionToken] = useState<Session | null>();
  const [chatData, setChatData] = useState<Antartifact | null>();
  const toast = useToast();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      let message = "An error occured";
      if (error.name === "AuthApiError") {
        message =
          "Please verify your email before logging in. Check your spam folder if you can't find the email in main inbox.";
      }
      toast({
        title: error.message,
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    const { data: loginSession } = await supabase.auth.getSession();

    if (loginSession?.session?.user) {
      setSessionToken(loginSession?.session);
    }
  };

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        setSessionToken(data?.session);
      }
    }
    loginCheck();
  }, [router]);

  useEffect(() => {
    async function retrieveChat(chatHistoryId: string) {
      if (!sessionToken) {
        return;
      }
      const chatData = await getAgentChatHistoryItem(
        sessionToken,
        chatHistoryId
      );
      if (chatData && chatData.message && chatData.message.antartifact) {
        setChatData(chatData.message.antartifact);
        if (!chatData.message.antartifact.result) {
          let retries = 0;
          const maxRetries = 6;
          const retryInterval = 20000;

          const retry = setInterval(async () => {
            retries++;
            const updatedChatData = await getAgentChatHistoryItem(
              sessionToken,
              chatHistoryId
            );
            if (
              updatedChatData &&
              updatedChatData.message &&
              updatedChatData.message.antartifact
            ) {
              setChatData(updatedChatData.message.antartifact);
              if (
                updatedChatData.message.antartifact.result ||
                retries >= maxRetries
              ) {
                clearInterval(retry);
              }
            } else if (retries >= maxRetries) {
              clearInterval(retry);
            }
          }, retryInterval);
        }
      }
    }
    const { chatHistoryId } = router.query;
    if (typeof chatHistoryId === "string") {
      retrieveChat(chatHistoryId);
    }
  }, [router, sessionToken]);

  return (
    <ChakraProvider theme={chakraTheme}>
      <Flex
        height="100vh"
        justifyContent={"center"}
        alignItems="center"
        width="100vw"
        bg="brand.dark"
      >
        {sessionToken && (
          <Flex w={"100vw"}>
            <Center
              p="2"
              width="full"
              height="100vh"
              display="flex"
              alignItems="center"
              flexDirection="column"
            >
              <Box
                p={6}
                borderRadius={8}
                width="full"
                color="white"
                overflow="scroll"
              >
                {chatData && (
                  <ArtifactViewer
                    antartifact={chatData}
                    sessionToken={sessionToken}
                  />
                )}
              </Box>
            </Center>
          </Flex>
        )}
        {!sessionToken && (
          <Flex w={"100vw"}>
            <Center
              p="2"
              width="full"
              height="100vh"
              bg="brand.dark"
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
                width="sm"
                m="8"
                textColor="white"
              >
                <FormControl id="email" mb="4">
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl id="password" mb="4">
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        handleLogin(email, password);
                      }
                    }}
                  />
                  <Button
                    colorScheme="gray"
                    textColor="black"
                    onClick={() => handleLogin(email, password)}
                    mt={4}
                  >
                    Login with Email
                  </Button>
                </FormControl>
              </Box>
            </Center>
          </Flex>
        )}
      </Flex>
    </ChakraProvider>
  );
}

export default Viewer;
