import React, { useState, useEffect, use } from "react";
import { HStack } from "@chakra-ui/react";
import { DragDropContext } from "react-beautiful-dnd";
import KanbanLane from "./KanbanLane";
import { useStore } from "@/utils/store";
import { ActivityEntity } from "@/types/activities";

type GroupedActivities = {
  [key: string]: ActivityEntity[];
};

function KanbanBoard() {
  const { userActivities, setUserActivities } = useStore((state) => ({
    userActivities: state.userActivities,
    setUserActivities: state.setUserActivities,
  }));

  const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>(
    {}
  );

  const laneNames = [
    "On Schedule",
    "At Risk",
    "Delayed",
    "In Progress",
    "Completed",
  ];

  function groupActivitiesByStatus(
    activities: ActivityEntity[]
  ): GroupedActivities {
    const groupedActivities: GroupedActivities = {};

    activities.forEach((activity) => {
      // Ensure status is defined and is a string
      if (typeof activity.status === "string") {
        if (groupedActivities[activity.status]) {
          groupedActivities[activity.status].push(activity);
        } else {
          groupedActivities[activity.status] = [activity];
        }
      }
    });

    // return groupedActivities;
    return groupedActivities;
  }

  useEffect(() => {
    setGroupedActivities(groupActivitiesByStatus(userActivities));
  }, [userActivities]);

  // useEffect(() => {
  //   console.log("groupedActivities", groupedActivities);
  // }, [groupedActivities]);

  const onDragEnd = () => {
    // Logic to update task list on drag end
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <HStack spacing={4} overflowX="auto" alignItems={"flex-start"}>
        {Object.keys(groupedActivities).length > 0 &&
          laneNames.map((laneTitle) => (
            <KanbanLane
              key={laneTitle}
              title={laneTitle}
              tasks={
                groupedActivities[laneTitle] ? groupedActivities[laneTitle] : []
              }
            />
          ))}
      </HStack>
    </DragDropContext>
  );
}

export default KanbanBoard;
