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
import ScheduleChatInterface from "./ScheduleChat";
import ScheduleInsights from "./ScheduleInsights";

function ScheduleUiView() {
  const [view, setView] = useState<string>("insights");

  return (
    <Flex display="flex" direction="column" alignContent="space-between">
      <Flex display="flex" justify="flex-start" width="full" marginTop="5">
        <Tooltip
          label="Schedule Insights"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            marginLeft="10"
            marginRight="5"
            bg={`${view === "insights" ? "brand2.accent" : "brand2.mid"}`}
            _hover={{ bg: "brand.dark", color: "white" }}
            onClick={() => setView("insights")}
          >
            <Icon as={CgInsights} />
          </Button>
        </Tooltip>
        <Tooltip
          label="Schedule Assistant"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            bg={`${view === "assistant" ? "brand2.accent" : "brand2.mid"}`}
            _hover={{ bg: "brand.dark", color: "white" }}
            onClick={() => setView("assistant")}
          >
            <Icon as={PiRobot} />
          </Button>
        </Tooltip>
      </Flex>
      <Flex className="ScheduleView" height="full">
        {view === "assistant" && <ScheduleChatInterface />}
        {view === "insights" && <ScheduleInsights />}
      </Flex>
    </Flex>
  );
}

export default ScheduleUiView;
