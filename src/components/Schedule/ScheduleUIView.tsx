import React, { useState } from "react";
import {
  Flex,
  Button,
  Box,
  Icon,
  VStack,
  Text,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { CgInsights } from "react-icons/cg";
import { PiRobot } from "react-icons/pi";
import ScheduleChatInterface from "./AssistantChatInterface";
import ScheduleInsights from "./ScheduleInsights";

function ScheduleUiViewOLD() {
  const [view, setView] = useState<string>("insights");

  return (
    <Flex
      display="flex"
      direction="column"
      alignContent="space-between"
      height={"95vh"}
    >
      <Flex className="ScheduleView" height="full">
        {view === "assistant" && <ScheduleChatInterface />}
        {view === "insights" && <ScheduleInsights />}
      </Flex>
    </Flex>
  );
}

export default ScheduleUiViewOLD;
