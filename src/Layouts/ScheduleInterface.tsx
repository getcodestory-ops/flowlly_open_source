import React from "react";
import { Flex } from "@chakra-ui/react";
import ScheduleUIView from "@/components/Schedule/ScheduleViewLeftPanel";
import { useStore } from "@/utils/store";

function ScheduleInterface({ view }: { view?: string | string[] }) {
  const { activeProject } = useStore((state) => ({
    activeProject: state.activeProject,
  }));

  return (
    <Flex direction={"column"} w={"full"}>
      {activeProject ? (
        <ScheduleUIView uiView={view} />
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
            Select a project at the top left corner
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default ScheduleInterface;
