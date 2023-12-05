import React from "react";
import { Flex } from "@chakra-ui/react";
import ScheduleChatInterface from "@/components/Schedule/ScheduleChat";
import ScheduleGanttInterface from "@/components/Schedule/ScheduleGanttInterface";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";
import ScheduleUIView from "@/components/Schedule/ScheduleViewLeftPanel";
import RightPanel from "@/components/Schedule/ScheduleViewRightPanel";
import TopBar from "@/components/TopBar";
import { useStore } from "@/utils/store";

function ScheduleInterface() {
  const { activeProject } = useStore((state) => ({
    activeProject: state.activeProject,
  }));

  return (
    <Flex direction={"column"} w={"full"}>
      {/* <Flex w="100vw">
        <TopBar />
      </Flex> */}
      {activeProject ? (
        <ScheduleUIView />
      ) : (
        <>
          <Flex
            fontSize={"3xl"}
            fontWeight={"black"}
            color={"brand.mid"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"100%"}
          >
            {" "}
            Select a project at the top left corner
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default ScheduleInterface;
