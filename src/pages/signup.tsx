import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";
import { Image } from "@chakra-ui/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const handleSignup = async () => {
    console.log(email);
    console.log(password);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        throw error;
      }
      toast({
        title: "Signup successful",
        status: "success",
        isClosable: true,
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "error",
        status: "error",
        isClosable: true,
      });
    }
  };

  // const handleSignup = async () => {
  //   console.log("hello not authorized");
  // };
  return (
    <Box p="4" mx="auto" w={{ base: "100%", md: "40%" }}>
      <Stack spacing="4">
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
            AI Project Management Assistant 2
          </Heading>
        </Box>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="gray" onClick={handleSignup}>
          Sign up
        </Button>
      </Stack>
    </Box>
  );
}
