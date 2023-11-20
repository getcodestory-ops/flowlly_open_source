import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import MeetingDisplay from "@/components/Meetings/MeetingDisplay";

function MeetingInterface() {
  return (
    <Flex>
      <MeetingDisplay />
    </Flex>
  );
}

export default MeetingInterface;
