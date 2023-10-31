import { Task } from "gantt-task-react";
import { ActivityEntity } from "@/types/activities";

export const activityEntityToTask = (activity: ActivityEntity): Task => {
  return {
    id: activity.id,
    type: "task", // Assuming a default type of 'STANDARD' for demonstration
    name: activity.name,
    start: new Date(activity.start),
    end: new Date(activity.end),
    progress: activity.progress,
    project: activity.project_id,
    dependencies: activity.dependencies,
    styles: {
      progressColor: `${
        activity.activity_critical && activity.activity_critical.critical_path
          ? "#FA8072"
          : "#5F55EE"
      }`,
      backgroundColor: `${
        activity.activity_critical && activity.activity_critical.critical_path
          ? "#C8987E"
          : "#656F7D"
      }`,
    },
    // Below are the additional fields you might want to set as per your requirements
    // styles: {...},
    // isDisabled: ...,
    // hideChildren: ...,
    // displayOrder: ...,
  };
};
