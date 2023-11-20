import React from "react";
import { Flex } from "@chakra-ui/react";
import ScheduleChatInterface from "@/components/Schedule/ScheduleChat";
import ScheduleGanttInterface from "@/components/Schedule/ScheduleGanttInterface";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";
import ScheduleUIView from "@/components/Schedule/ScheduleViewLeftPanel";
import RightPanel from "@/components/Schedule/ScheduleViewRightPanel";

function ScheduleInterface() {
  return (
    <Flex>
      <DraggablePaneDivider
        // LeftPanel={ScheduleChatInterface}
        LeftPanel={ScheduleUIView}
        RightPanel={RightPanel}
      />
    </Flex>
  );
}

export default ScheduleInterface;
