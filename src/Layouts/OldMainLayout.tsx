import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Center,
  Text,
  Heading,
  useToast,
  Image,
} from "@chakra-ui/react";
import supabase from "@/utils/supabaseClient";
import logo from "../img/logo_full.svg";
import { useStore } from "@/utils/store";

export default function MainLayout() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setAppView = useStore((state) => state.setAppView);

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

    router.push("/dasboard");
  };

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        router.replace("/dasboard");
        setAppView("updates");
      } else {
        setAppView("login");
        console.log("Sign in to continue !");
      }
    }
    loginCheck();
  }, [router]);

  return (
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
              onKeyPress={(e) => {
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
  );
}
