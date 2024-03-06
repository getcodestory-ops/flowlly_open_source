import React, { useState, useEffect } from "react";
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

function KanbanBoard() {
  const { userActivities, setUserActivities, taskToView } = useStore(
    (state) => ({
      userActivities: state.userActivities,
      setUserActivities: state.setUserActivities,
      taskToView: state.taskToView,
    })
  );

  const [modifyTask, setModifyTask] = useState<ActivityEntity>(taskToView);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  const statuses = [
    "On Schedule",
    "At Risk",
    "Delayed",
    "In Progress",
    "Completed",
  ];

  const handleDrop = (draggedItem: ActivityEntity, newStatus: string) => {
    setModifyTask(
      userActivities.find((task) => task.id === draggedItem.id) ?? taskToView
    );
    setModifyTask((prev) => ({ ...prev, status: newStatus }));
  };
  useEffect(() => {
    if (modifyTask) {
      setEditOpen(true);
    }
  }, [modifyTask]);

  return (
    <Flex w={"full"} justifyContent={"space-around"}>
      {modifyTask && (
        <UpdateActivityModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          tasks={userActivities}
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
