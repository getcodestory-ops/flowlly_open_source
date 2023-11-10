import React from "react";
import { Flex } from "@chakra-ui/react";
import ScheduleChatInterface from "@/components/Schedule/ScheduleChat";
import ScheduleGanttInterface from "@/components/Schedule/ScheduleGanttInterface";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";

function ScheduleInterface() {
  return (
    <Flex>
      <DraggablePaneDivider
        LeftPanel={ScheduleChatInterface}
        RightPanel={ScheduleGanttInterface}
      />
    </Flex>
  );
}

export default ScheduleInterface;
