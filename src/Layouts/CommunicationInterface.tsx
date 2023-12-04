import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import CommunicationDisplay from "@/components/Communication/CommunicationDisplay";
import TopBar from "@/components/TopBar";

function CommunicationInterface() {
  return (
    <Flex direction={"column"}>
      <CommunicationDisplay />
    </Flex>
  );
}

export default CommunicationInterface;
