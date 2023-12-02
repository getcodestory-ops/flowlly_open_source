import React, { useState, useEffect, use } from "react";
import { Flex, useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

import Breadcrubms from "./Breadcrubms";

function TopBar() {
  const toast = useToast();

  const { taskToView } = useStore((state) => ({
    taskToView: state.taskToView,
  }));

  return (
    <Flex
      justifyContent={"space-between"}
      w={"98%"}
      pt={"4"}
      zIndex={"999"}
      pl={"6"}
    >
      <Breadcrubms
        taskToView={{
          id: "SCHEDULE",
          project_id: "parent",
          name: "Select a task",
          start: "01/01/23",
          end: "01/02/23",
          progress: 0,
          activity_critical: {
            critical_path: false,
          },
        }}
        renderProjects={true}
      />
    </Flex>
  );
}

export default TopBar;
