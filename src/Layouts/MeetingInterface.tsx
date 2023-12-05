import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import MeetingDisplay from "@/components/Meetings/MeetingDisplay";
import TopBar from "@/components/TopBar";

function MeetingInterface() {
  return (
    <Flex direction={"column"}>
      <MeetingDisplay />
    </Flex>
  );
}

export default MeetingInterface;
