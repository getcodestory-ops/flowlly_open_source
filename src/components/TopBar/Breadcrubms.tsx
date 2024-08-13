import React from "react";
import { Flex } from "@chakra-ui/react";
import TopBarProjects from "./TopBarProjects";
import { ActivityEntity } from "@/types/activities";

function Breadcrubms({
  taskToView,
  renderProjects,
}: {
  taskToView: ActivityEntity;
  renderProjects: number;
}) {
  return (
    <Flex>
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
