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
import { TbReportAnalytics } from "react-icons/tb";
import ScheduleChatInterface from "./ScheduleChat";
import ScheduleInsights from "./ScheduleInsights";
import ReportsPage from "./ReportsPage";

function ScheduleUiView() {
  const [view, setView] = useState<string>("insights");

  return (
    <Flex
      display="flex"
      direction="column"
      alignContent="space-between"
      w={"full"}
    >
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
            marginRight="5"
          >
            <Icon as={PiRobot} />
          </Button>
        </Tooltip>
        <Tooltip
          label="Reports"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            bg={`${view === "reports" ? "brand2.accent" : "brand2.mid"}`}
            _hover={{ bg: "brand.dark", color: "white" }}
            onClick={() => setView("reports")}
          >
            <Icon as={TbReportAnalytics} />
          </Button>
        </Tooltip>
      </Flex>
      <Flex
        className="ScheduleView"
        height="full"
        w={"full"}
        overscrollBehaviorY={"contain"}
      >
        {view === "assistant" && <ScheduleChatInterface />}
        {view === "insights" && <ScheduleInsights />}
        {view === "reports" && <ReportsPage />}
      </Flex>
    </Flex>
  );
}

export default ScheduleUiView;
