import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import CommunicationDisplay from "@/components/Communication/CommunicationDisplay";

function CommunicationInterface() {
  return (
    <Flex direction={"column"}>
      <CommunicationDisplay />
    </Flex>
  );
}

export default CommunicationInterface;
