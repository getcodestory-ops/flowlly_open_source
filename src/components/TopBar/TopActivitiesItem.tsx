import React, { useState, useEffect } from "react";
import {
	Flex,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Box,
	Text,
} from "@chakra-ui/react";
import { IoChevronDownOutline } from "react-icons/io5";
import { ProjectEntity } from "@/types/projects";
import { ActivityEntity } from "@/types/activities";
import Breadcrubms from "./Breadcrubms";
import { useStore } from "@/utils/store";
import { getActivities } from "@/api/activity_routes";
import { useQuery } from "@tanstack/react-query";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { useRouter } from "next/router";
interface TopActivitiesItemProps {
  activeProjectMenu: ProjectEntity;
  renderProjects: number;
  // setTaskToView: (project: ActivityEntity) => void;
  // setRightPanelView: (view: "task" | "gantt") => void;
  // activities: ActivityEntity[];
}

const TopActivitiesItems = ({
	activeProjectMenu,
	renderProjects,
}: TopActivitiesItemProps) => {
	const router = useRouter();
	const { projectId, taskToViewId } = router.query;
	const [activeActivity, setActiveActivity] = useState<ActivityEntity | null>(
		null,
	);
	const {
		session,
		setUserActivities,
		setRightPanelView,
		setTaskToView,
		activeProject,
		scheduleDate,
		scheduleProbability,
	} = useStore((state) => ({
		session: state.session,
		setUserActivities: state.setUserActivities,
		activeProject: state.activeProject,
		setRightPanelView: state.setRightPanelView,
		setTaskToView: state.setTaskToView,
		scheduleDate: state.scheduleDate,
		scheduleProbability: state.scheduleProbability,
	}));

	const {
		data: activities,
		isLoading: isLoadingActivities,
		isSuccess,
	} = useQuery({
		queryKey: [
			"activityList",
			session,
			activeProjectMenu,
			scheduleDate,
			scheduleProbability,
		],
		queryFn: () => {
			if (!session || !activeProject) {
				return Promise.reject("Set session first !");
			}
			const date = getCurrentDateFormatted(scheduleDate || new Date());
			return getActivities(
				session,
				activeProjectMenu.project_id,
				date,
				scheduleProbability,
			);
		},

		enabled: !!session?.access_token && !!activeProjectMenu?.project_id,
	});

	useEffect(() => {
		if (activities && activities.length > 0) {
			setUserActivities(activities);
		} else {
			setUserActivities([]);
		}
	}, [activities]);

	return (
		<>
			{activities && activities.length > 0 && (
				<Flex alignItems="center">
					<Menu>
						<MenuButton fontSize="md" fontWeight="medium">
							<Flex
								alignItems="center"
								fontSize="xs"
								ml="2"
							>
								{activeActivity?.name ?? ""}
								<Box ml="2">
									<IoChevronDownOutline />
								</Box>
							</Flex>
						</MenuButton>
						<MenuList style={{ maxHeight: "300px", overflowY: "auto" }}>
							{activities.map((activity: ActivityEntity) => (
								<Flex
									key={activity.id}
									onClick={() => {
										setTaskToView(activity);
										setRightPanelView("task");
										setActiveActivity(activity);
										if (renderProjects === 1) {
											router.push({
												query: {
													...router.query,
													taskToViewId: activity.id,
												},
											});
										}
									}}
								>
									<MenuItem>{activity.name}</MenuItem>
								</Flex>
							))}
						</MenuList>
					</Menu>
					<Text m="2">/</Text>
					{activeActivity && (
						<Breadcrubms
							renderProjects={renderProjects + 1}
							taskToView={activeActivity}
						/>
					)}
				</Flex>
			)}
		</>
	);
};
export default TopActivitiesItems;
