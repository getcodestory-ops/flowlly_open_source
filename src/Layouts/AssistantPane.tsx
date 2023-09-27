import React, { useState, useEffect } from "react";
import { Button, Text, Flex, Box, Heading } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import supabase from "@/utils/supabaseClient";
import { Session } from "@supabase/supabase-js";

const AssistantPane = ({ sessionToken }: { sessionToken: Session }) => {
  return (
    <Flex direction="column" height="100vh" bg="brand.mid" width="full" p="4">
      <Box marginBottom="4">
        <Heading as="h2" size="md" color="white">
          Assistant
        </Heading>
      </Box>
      <Button
        bg="brand.dark"
        colorScheme="teal"
        size="sm"
        _hover={{ bg: "brand.accent", color: "brand.dark" }}
      >
        Flowlly Assistant
      </Button>
    </Flex>
  );
};

export default AssistantPane;
