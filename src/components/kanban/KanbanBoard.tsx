import React, { useState, useEffect, use } from "react";
import { Flex } from "@chakra-ui/react";
import KanbanLane from "./KanbanLane";
import { useStore } from "@/utils/store";
import { ActivityEntity } from "@/types/activities";
import { GiConsoleController } from "react-icons/gi";
import { useScheduleUpdate } from "../Agent/useAgentFunctions";
import UpdateActivityModal from "../Schedule/UpdateActivityModal";
import { Task } from "gantt-task-react";
import { activityEntityToTask } from "@/utils/activityEntityToTask";
import { getStartEndDateForProject, initTasks } from "../Schedule/helper";

type GroupedActivities = {
  [key: string]: ActivityEntity[];
};

function KanbanBoard() {
  const { userActivities, setUserActivities } = useStore((state) => ({
    userActivities: state.userActivities,
    setUserActivities: state.setUserActivities,
  }));

  const [tasks, setTasks] = useState<any[]>(userActivities);
  const [tasksNew, setTasksNew] = React.useState<Task[]>(initTasks());
  const { isOpen, onClose, onOpen } = useScheduleUpdate();
  const [modifyTask, setModifyTask] = useState<Task>();
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [changedTask, setChangedTask] = useState<any>();

  useEffect(() => {
    setTasks(userActivities);
    // console.log("userActivities", userActivities);
  }, [userActivities]);

  useEffect(() => {
    setUserActivities(tasks);
  }, [tasks]);

  useEffect(() => {
    if (tasks) {
      if (tasks.length > 0) {
        const transformedTasks = tasks
          .map(activityEntityToTask)
          .sort((a, b) => a.start.getTime() - b.start.getTime()); // Assuming the data you want is in activities.data
        setTasksNew(transformedTasks);
      } else {
        const currentDate = new Date();
        setTasksNew([
          {
            start: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate()
            ),
            end: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate()
            ),
            name: "No data available",
            id: "ProjectSample",
            progress: 0,
            type: "project",
            hideChildren: false,
            displayOrder: 1,
          },
        ]);
      }
    }
  }, [tasks]);

  useEffect(() => {
    console.log("tasksNew", tasksNew);
  }, [tasksNew]);

  const statuses = [
    "On Schedule",
    "At Risk",
    "Delayed",
    "In Progress",
    "Completed",
  ];

  const handleDrop = (draggedItem: ActivityEntity, newStatus: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task: any) => {
        if (task.id === draggedItem.id) {
          return { ...task, status: newStatus };
        }
        return task;
      });
      return updatedTasks;
    });
    setChangedTask(draggedItem);
  };

  useEffect(() => {
    if (changedTask) {
      const result = tasksNew.find((task) => task.id === changedTask.id);
      setModifyTask(result);
      setEditOpen(true);
    }
  }, [tasksNew]);

  return (
    <Flex w={"full"} justifyContent={"space-around"}>
      {modifyTask && (
        <UpdateActivityModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          tasks={tasks}
          modifyTask={modifyTask}
          updateSource={"kanban"}
        />
      )}
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
