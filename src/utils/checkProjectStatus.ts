import { ActivityEntity } from "@/types/activities";

function checkProjectStatus(tasks: ActivityEntity[]): string {
	let isAtRiskPresent = false;

	for (const task of tasks) {
		if (task.status === "Delayed") {
			return "Delayed";
		}
		if (task.status === "At Risk") {
			isAtRiskPresent = true;
		}
	}

	if (isAtRiskPresent) {
		return "At Risk";
	}

	return "On Schedule";
}

export default checkProjectStatus;
