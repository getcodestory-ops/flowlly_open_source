import { Task } from "gantt-task-react";

export function initTasks() {
	const currentDate = new Date();
	const tasks: Task[] = [
		{
			start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
			end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
			name: "Loading activities...",
			id: "sampleActivity",
			progress: 0,
			type: "project",
			hideChildren: false,
			displayOrder: 1,
		},
	];
	return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
	const projectTasks = tasks.filter((t) => t.project === projectId);
	let start = projectTasks[0].start;
	let end = projectTasks[0].end;

	for (let i = 0; i < projectTasks.length; i++) {
		const task = projectTasks[i];
		if (start.getTime() > task.start.getTime()) {
			start = task.start;
		}
		if (end.getTime() < task.end.getTime()) {
			end = task.end;
		}
	}
	return [start, end];
}
