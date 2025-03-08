import React, { useEffect, useState } from "react";
import { useStore } from "@/utils/store";
import { DataTable } from "./ScheduleTable/DataTable";
import { columns } from "./ScheduleTable/Columns";

import {
	mapOwnersToMembers,
	ActivityEntityWithMembers,
} from "@/utils/mapOwnerToMembers";

function ScheduleInsights() {
	const { activities, setTaskToView, taskToView, members } = useStore(
		(state) => ({
			activities: state.userActivities,
			setTaskToView: state.setTaskToView,
			taskToView: state.taskToView,
			members: state.members,
		}),
	);

	const [activitiesWithMembers, setActivitiesWithMembers] = useState<
    ActivityEntityWithMembers[]
  >([]);

	useEffect(() => {
		if (taskToView && taskToView.id !== "SCHEDULE") {
			const updateTaskToView: any = activities.find(
				(activity) => activity.id === taskToView.id,
			);
			setTaskToView(updateTaskToView);
		}
	}, [activities]);

	useEffect(() => {
		if (activities && members) {
			setActivitiesWithMembers(mapOwnersToMembers(activities, members));
		}
	}, [activities, members]);

	return (
		<div className="p-4">
			{activitiesWithMembers.length > 0 && (
				<DataTable columns={columns} data={activitiesWithMembers} />
			)}
		</div>
	);
}

export default ScheduleInsights;
