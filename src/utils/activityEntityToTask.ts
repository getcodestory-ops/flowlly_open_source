import { Task } from "gantt-task-react";
import { ActivityEntity } from "@/types/activities";

export const activityEntityToTask = (activity: ActivityEntity): Task => {
  return {
    id: activity.id,
    type: "task", // Assuming a default type of 'STANDARD' for demonstration
    name:
      activity.status === null
        ? activity.name
        : activity.name + " " + "(" + activity.status + ")",
    start: new Date(activity.start),
    end: new Date(activity.end),
    progress: activity.progress,
    project: activity.project_id,
    dependencies: activity.dependencies,
    styles: {
      progressColor: `
      ${
        activity.activity_critical && activity.activity_critical.critical_path
          ? "#FA8072"
          : activity.status === "Delayed"
          ? "#FF4141"
          : activity.status === "At Risk"
          ? "#FFA841"
          : activity.status === "In Progress"
          ? "#5F55EE"
          : ""
      } `,
      backgroundColor: `${
        activity.activity_critical && activity.activity_critical.critical_path
          ? "#C8987E"
          : activity.status === "Delayed"
          ? "#FF4141"
          : activity.status === "At Risk"
          ? "#FFA841"
          : activity.status === "In Progress"
          ? "#5F55EE"
          : "#CCCCCC"
      }`,
    },
    // Below are the additional fields you might want to set as per your requirements
    // isDisabled: ...,
    // hideChildren: ...,
    // displayOrder: ...,
  };
};
