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
} from "@chakra-ui/react";
import supabase from "@/utils/supabaseClient";

export default function MainLayout() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (email: string, password: string) => {
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      toast({
        title: "signin to continue ",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    router.push("/dashboard");
  };

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        router.replace("/dashboard");
      } else {
        console.log("Sign in to continue !");
      }
    }
    loginCheck();
  }, [router]);

  return (
    <Flex>
      <Center
        p="2"
        width="full"
        bgGradient="radial(gray.100 0%, gray.300 100%)"
      >
        <Box p={6} borderRadius={8} width="full">
          <Heading
            size="2xl"
            mb={4}
            textAlign="center"
            fontWeight="bold"
            letterSpacing="tight"
            color="yellow.600"
          >
            future of documentation
          </Heading>
        </Box>
      </Center>
      <Flex
        height="100vh"
        alignItems="center"
        justifyContent="center"
        backgroundColor="gray.100"
        width="2xl"
      >
        <Box p={8} backgroundColor="white" borderRadius="md" width="xl" m="8">
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
            />
          </FormControl>
          <Button
            colorScheme="gray"
            onClick={() => handleLogin(email, password)}
            mt={2}
          >
            Login with Email
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
}
