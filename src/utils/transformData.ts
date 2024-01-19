// src/utils/transformData.ts
import { IBoardState, ITask } from "@/types/kanban";

const transformData = (tasksArray: ITask[]): IBoardState => {
  const tasks: Record<string, ITask> = {};
  const lanes: Record<
    string,
    { id: string; title: string; taskIds: string[] }
  > = {
    "in-progress": { id: "in-progress", title: "In Progress", taskIds: [] },
    completed: { id: "completed", title: "Completed", taskIds: [] },
    "on-schedule": { id: "on-schedule", title: "On Schedule", taskIds: [] },
    "at-risk": { id: "at-risk", title: "At Risk", taskIds: [] },
    delayed: { id: "delayed", title: "Delayed", taskIds: [] },
  };

  tasksArray.forEach((task) => {
    tasks[task.id] = task;

    // Assuming the status of each task is one of the lane titles
    const laneId = task.status.toLowerCase().replace(/\s+/g, "-");
    if (lanes[laneId]) {
      lanes[laneId].taskIds.push(task.id);
    }
  });

  return {
    tasks,
    lanes,
    laneOrder: [
      "in-progress",
      "completed",
      "on-schedule",
      "at-risk",
      "delayed",
    ],
  };
};

export default transformData;
