import React, { useState, useEffect } from "react";
import { Button, Text, Flex, Box, Heading } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import supabase from "@/utils/supabaseClient";
import { Session } from "@supabase/supabase-js";

const IntegrationHandler = ({ sessionToken }: { sessionToken: Session }) => {
  return (
    <Flex direction="column" height="100vh" bg="teal.500" width="full" p="4">
      <Box marginBottom="4">
        <Heading as="h2" size="md" color="white">
          Integrations
        </Heading>
      </Box>
      <Button
        bg="teal.600"
        colorScheme="teal"
        size="sm"
        _hover={{ bg: "teal.400" }}
      >
        Prolog integration coming soon
      </Button>
    </Flex>
  );
};

export default IntegrationHandler;
