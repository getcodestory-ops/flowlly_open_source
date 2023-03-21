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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import supabase from "@/utils/supabaseClient";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast({
        title: "Error resetting password",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Password reset successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setIsLoading(false);
    router.push("/dashboard");
  };

  return (
    <Flex height="100vh" justifyContent={"center"} alignItems="center">
      <Box bg="blackAlpha.50" p={6} borderRadius="md" width="xl">
        <Heading mb={6}>Lets setup a password !</Heading>
        <form onSubmit={handleSubmit}>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormControl>
          <FormControl id="confirmPassword" isRequired mt={4}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="yellow"
            isLoading={isLoading}
            mt={4}
          >
            Set Password
          </Button>
        </form>
      </Box>
    </Flex>
  );
}

export default function AcceptInvite() {
  const [isLoading, setIsLoading] = useState<boolean>(true);


  return <ResetPassword />;
}
