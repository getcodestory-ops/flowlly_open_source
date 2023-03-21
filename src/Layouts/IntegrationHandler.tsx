import React, { useState, useEffect } from "react";
import { Button, Text, Flex } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { Link } from "@chakra-ui/react";
import supabase from "@/utils/supabaseClient";
import { Session } from "@supabase/supabase-js";

const IntegrationHandler = ({ sessionToken }: { sessionToken: Session }) => {
  return (
    <Flex direction="column" justifyContent="end" height="100vh">
      <Button colorScheme="teal">Integrate Prolog Soon</Button>
    </Flex>
  );
};

export default IntegrationHandler;
