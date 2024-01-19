// import React, { useState, useEffect } from "react";
// import { HStack } from "@chakra-ui/react";
// import { DragDropContext } from "react-beautiful-dnd";
// import KanbanLane from "./KanbanLane";
// import { useStore } from "@/utils/store";
// import { ActivityEntity } from "@/types/activities";

// type GroupedActivities = {
//   [key: string]: ActivityEntity[];
// };

// function KanbanBoard() {
//   const { userActivities, setUserActivities } = useStore((state) => ({
//     userActivities: state.userActivities,
//     setUserActivities: state.setUserActivities,
//   }));

//   useEffect(() => {
//     console.log("userActivities", userActivities);
//   }, [userActivities]);

//   const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>(
//     {}
//   );

//   const laneNames = [
//     "On Schedule",
//     "At Risk",
//     "Delayed",
//     "In Progress",
//     "Completed",
//   ];

//   function groupActivitiesByStatus(
//     activities: ActivityEntity[]
//   ): GroupedActivities {
//     const groupedActivities: GroupedActivities = {};

//     activities.forEach((activity) => {
//       // Ensure status is defined and is a string
//       if (typeof activity.status === "string") {
//         if (groupedActivities[activity.status]) {
//           groupedActivities[activity.status].push(activity);
//         } else {
//           groupedActivities[activity.status] = [activity];
//         }
//       }
//     });

//     // return groupedActivities;
//     return groupedActivities;
//   }

//   useEffect(() => {
//     setGroupedActivities(groupActivitiesByStatus(userActivities));
//   }, [userActivities]);

//   // useEffect(() => {
//   //   console.log("groupedActivities", groupedActivities);
//   // }, [groupedActivities]);

//   const onDragEnd = () => {
//     // Logic to update task list on drag end
//   };

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       <HStack spacing={4} overflowX="auto" alignItems={"flex-start"}>
//         {Object.keys(groupedActivities).length > 0 &&
//           laneNames.map((laneTitle) => (
//             <KanbanLane
//               key={laneTitle}
//               title={laneTitle}
//               tasks={
//                 groupedActivities[laneTitle] ? groupedActivities[laneTitle] : []
//               }
//             />
//           ))}
//       </HStack>
//     </DragDropContext>
//   );
// }

// export default KanbanBoard;

// src/components/MainBoard.tsx
//
import React, { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
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

  const [tasks, setTasks] = useState<any[]>(userActivities);
  useEffect(() => {
    setTasks(userActivities);
    console.log("userActivities", userActivities);
  }, [userActivities]);

  const statuses = [
    "On Schedule",
    "At Risk",
    "Delayed",
    "In Progress",
    "Completed",
  ];

  // useEffect(() => {
  //   // Load your tasks data here, for example, from an API
  // }, []);

  const handleDrop = (draggedItem, newStatus) => {
    // setTasks((prevTasks) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === draggedItem.id) {
          return { ...task, status: newStatus };
        }
        return task;
      });
      return updatedTasks;
    });
  };

  return (
    <Flex>
      {statuses.map((status, index) => (
        <KanbanLane
          key={index}
          status={status}
          tasks={tasks.filter((task) => task.status === status)}
          onDrop={handleDrop}
        />
      ))}
    </Flex>
  );
}

export default KanbanBoard;
