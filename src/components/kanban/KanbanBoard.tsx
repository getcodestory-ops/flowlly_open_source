import React, { useState, useEffect, use } from "react";
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

  useEffect(() => {
    setUserActivities(tasks);
  }, [tasks]);

  const statuses = [
    "On Schedule",
    "At Risk",
    "Delayed",
    "In Progress",
    "Completed",
  ];

  const handleDrop = (draggedItem: ActivityEntity, newStatus: string) => {
    // setTasks((prevTasks) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task: any) => {
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
          tasks={userActivities.filter((task) => task.status === status)}
          onDrop={handleDrop}
        />
      ))}
    </Flex>
  );
}

export default KanbanBoard;
