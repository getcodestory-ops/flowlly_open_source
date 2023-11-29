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
      {taskToView && <Breadcrubms taskToView={taskToView} />}
    </Flex>
  );
}

export default TopBar;
