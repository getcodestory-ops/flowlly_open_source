import React, { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import TopBarProjects from "./TopBarProjects";
import { ActivityEntity } from "@/types/activities";

function Breadcrubms({
  taskToView,
  renderProjects,
}: {
  taskToView: ActivityEntity;
  renderProjects: boolean;
}) {
  return (
    <Flex
      justifyContent={"space-between"}
      w={"98%"}
      pt={"4"}
      zIndex={"999"}
      pl={"6"}
    >
      <Flex>
        {taskToView && (
          <TopBarProjects
            taskToView={taskToView}
            renderProjects={renderProjects}
          />
        )}
      </Flex>
    </Flex>
  );
}

export default Breadcrubms;
