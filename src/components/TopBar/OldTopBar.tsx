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
    <Flex width={"full"} m="2" zIndex={"overlay"} ml="8">
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
        renderProjects={1}
      />
    </Flex>
  );
}

export default TopBar;
