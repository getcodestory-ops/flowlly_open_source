import { CreateNewActivity } from "@/types/activities";

export const ACTIVITY_KEYS: CreateNewActivity = {
	name: "",
	description: "",
	duration: 0,
	start: "",
	end: "",
	cost: 0,
	dependencies: [],
	resources: [],
	status: true,
	owner: [""],
	progress: 0,
};

export const validateType = (key: keyof CreateNewActivity, value: string) => {
	switch (key) {
		case "name":
		case "description":
		case "start":
		case "end":
		case "owner":
			return typeof value === "string";
		case "duration":
		case "cost":
		case "progress":
			return !isNaN(Number(value));
		case "status":
			return value === "true" || value === "false";
		case "dependencies":
		case "resources":
			return Array.isArray(value.split(","));
		default:
			return true;
	}
};
