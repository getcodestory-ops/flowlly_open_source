"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/utils/store";
import { BiSolidCircle } from "react-icons/bi";
import UpdateActivityModal from "./UpdateActivityModal";
import { ActivityEntity } from "@/types/activities";
import EditScheduleThroughNotes from "./EditScheduleThroughNote/EditScheduleThroughNote";
import { useDeleteActivity } from "@/utils/useDeleteActivity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityEntityWithMembers } from "@/utils/mapOwnerToMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ActivitiesDetailPage() {
	const handleTaskDelete = useDeleteActivity();

	const { taskToView, userActivities } = useStore((state) => ({
		taskToView: state.taskToView,
		userActivities: state.userActivities,
	}));

	const [editOpen, setEditOpen] = useState<boolean>(false);
	const [modifyTask, setModifyTask] = useState<ActivityEntity>();
	const [editTask, setEditTask] = useState<boolean>(false);

	const handleEdit = (
		activity: ActivityEntityWithMembers | ActivityEntity,
		newStatus: string,
	) => {
		if (!activity) return;
		//console.log(activity);

		if (activity.owner) {
			const ownerIds = activity.owner.map((owner) => {
				if (typeof owner === "string") return owner;
				return owner.id;
			});
			setModifyTask({
				...activity,
				owner: ownerIds,
				status: newStatus,
			});
			setEditOpen(true);
		}
	};

	const detailsView = () => (
		<div className="space-y-4 text-sm">
			<div className="flex justify-between items-center">
				<div className="space-y-1">
					<p className="italic">Start Date:</p>
					<p className="font-semibold">{taskToView?.start}</p>
				</div>
				<div className="space-y-1">
					<p className="italic">End Date:</p>
					<p className="font-semibold">{taskToView?.end}</p>
				</div>
				<div className="space-y-1">
					<p className="italic">Duration:</p>
					<p className="font-semibold">{taskToView?.duration} days</p>
				</div>
			</div>
			<div className="space-y-1">
				<p className="italic">Task Owner:</p>
				<p
					className={`font-semibold ${
						!taskToView?.owner ? "text-red-500" : ""
					}`}
				>
					{taskToView &&
            taskToView.owner &&
            taskToView.owner.length &&
            (taskToView.owner
            	.map(
            		(member) =>
            			typeof member !== "string" &&
                  `${member.first_name} ${member.last_name}`,
            	)
            	.join(" ") ??
              "No owner assigned")}
				</p>
			</div>
			<div className="space-y-1">
				<p className="italic">Task Description:</p>
				<p
					className={`font-semibold ${
						!taskToView?.description ? "text-red-500" : ""
					}`}
				>
					{taskToView && taskToView.description
						? taskToView.description
						: "This task has no description.."}
				</p>
			</div>
			{taskToView && (
				<EditScheduleThroughNotes activityName={taskToView.name} />
			)}
		</div>
	);

	const historyView = () => (
		<ScrollArea className="h-[300px] w-full">
			<div className="space-y-4 text-sm">
				<div className="border-b pb-4 space-y-2">
					<div className="flex gap-2">
						<p className="italic">Date:</p>
						<p className="font-bold">
							{taskToView?.creation_time &&
                taskToView.creation_time.slice(0, 10)}
						</p>
					</div>
					<div className="flex gap-2">
						<p className="italic">Action Type:</p>
						<p className="font-bold">Task Created</p>
					</div>
				</div>
				{taskToView?.history &&
          taskToView.history
          	.sort(
          		(a, b) =>
          			new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
          	)
          	.map((history, index) => (
          		<div
          			className="border-b pb-4 pt-4 pl-4 space-y-2"
          			key={`history-${index}`}
          		>
          			<div className="flex gap-2">
          				<p className="italic">Date:</p>
          				<p className="font-bold">{history?.created_at ?? ""}</p>
          			</div>
          			<div className="flex gap-2">
          				<p className="italic">Action Type:</p>
          				<p className="font-bold">Daily Update</p>
          			</div>
          			<div className="flex gap-2">
          				<p className="italic">Impact on Schedule:</p>
          				<p className="font-bold">{history?.severity ?? ""}</p>
          			</div>
          			<div className="flex gap-2">
          				<p className="italic">Sent By:</p>
          				<p className="font-bold" />
          			</div>
          			<div className="space-y-1">
          				<p className="italic">Message:</p>
          				<p className="font-bold">
          					{history?.message ?? history?.impact ?? ""}
          				</p>
          			</div>
          		</div>
          	))}
			</div>
		</ScrollArea>
	);

	const impactView = () => (
		<ScrollArea className="h-[300px] w-full">
			<div className="space-y-4 text-sm">
				{taskToView?.history &&
          taskToView.history
          	.sort((a, b) => {
          		const dateA = new Date(a.created_at);
          		const dateB = new Date(b.created_at);
          		if (dateA > dateB) return -1;
          		if (dateA < dateB) return 1;
          		if (a.severity === "severe" && b.severity !== "severe") return -1;
          		if (a.severity !== "severe" && b.severity === "severe") return 1;
          		return 0;
          	})
          	.map((history, index) => (
          		<Card
          			className="mb-4"
          			key={`view-task-history-${history?.impact ?? index}-${index}`}
          		>
          			<CardContent className="pt-6 space-y-2">
          				<div className="flex gap-2">
          					<p className="italic">Date:</p>
          					<p className="font-bold">
          						{history?.created_at?.slice(0, 10)}
          					</p>
          				</div>
          				<div className="flex gap-2">
          					<p className="italic">Severity:</p>
          					<p className="font-bold">{history?.severity}</p>
          				</div>
          				<div className="space-y-1">
          					<p className="italic">Impact on Schedule:</p>
          					<p className="font-bold">{history?.impact}</p>
          				</div>
          				<p className="italic">Suggested Actions:</p>
          			</CardContent>
          		</Card>
          	))}
			</div>
		</ScrollArea>
	);

	return (
		<>
			{userActivities && userActivities.length > 0 && taskToView && (
				<Card className="w-full">
					<CardContent className="p-6">
						{modifyTask && editOpen && (
							<UpdateActivityModal
								isOpen={editOpen}
								modifyTask={modifyTask}
								onClose={() => setEditOpen(false)}
								tasks={userActivities}
							/>
						)}
						<div className="space-y-4">
							<div className="flex flex-col w-96">
								{taskToView && (
									<>
										<div className="flex items-center justify-between">
											<div className="flex items-center">
												<BiSolidCircle
													className="mr-2"
													color={
														taskToView.status === "Delayed"
															? "#FF4141"
															: taskToView.status === "At Risk"
																? "#FFA841"
																: taskToView.status === "In Progress"
																	? "#5F55EE"
																	: taskToView.status === "Completed"
																		? "#26d995"
																		: "brand2.dark"
													}
													size={12}
												/>
												<CardTitle className="text-sm min-h-12 flex items-center">
													{taskToView?.name}
												</CardTitle>
											</div>
											<div className="flex gap-4">
												<Button
													onClick={() => handleEdit(taskToView, "In Progress")}
													size="sm"
													variant="outline"
												>
													{editTask ? "Save Changes" : "Edit Task"}
												</Button>
												<Button
													onClick={() => handleTaskDelete(taskToView.id)}
													size="sm"
													variant="outline"
												>
                          Delete Task
												</Button>
											</div>
										</div>
										<div className="ml-6 text-sm">
											<span className="italic mr-2">Status:</span>
											<span
												className="font-bold"
												style={{
													color:
                            taskToView.status === "Delayed"
                            	? "#FF4141"
                            	: taskToView.status === "At Risk"
                            		? "#FFA841"
                            		: taskToView.status === "In Progress"
                            			? "#5F55EE"
                            			: taskToView.status === "Completed"
                            				? "#26d995"
                            				: "inherit",
												}}
											>
												{taskToView.status}
											</span>
										</div>
									</>
								)}
							</div>
							<Tabs className="w-full" defaultValue="history">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="details">Task Information</TabsTrigger>
									<TabsTrigger value="history">Task History</TabsTrigger>
									<TabsTrigger value="impact">Delay Impact</TabsTrigger>
								</TabsList>
								<TabsContent value="details">{detailsView()}</TabsContent>
								<TabsContent value="history">{historyView()}</TabsContent>
								<TabsContent value="impact">{impactView()}</TabsContent>
							</Tabs>
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}
