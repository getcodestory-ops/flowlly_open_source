import React from "react";
import { Flex } from "@chakra-ui/react";
import ScheduleChatInterface from "@/components/Schedule/ScheduleChat";
import ScheduleGanttInterface from "@/components/Schedule/ScheduleGanttInterface";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";
import ScheduleUIView from "@/components/Schedule/ScheduleUIView";

function ScheduleInterface() {
  return (
    <Flex>
      <DraggablePaneDivider
        // LeftPanel={ScheduleChatInterface}
        LeftPanel={ScheduleUIView}
        RightPanel={ScheduleGanttInterface}
      />
    </Flex>
  );
}

export default ScheduleInterface;
