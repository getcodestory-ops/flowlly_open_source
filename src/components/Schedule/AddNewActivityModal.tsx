import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import MultiSelect from "../MultiSelect/MultiSelect";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createActivity } from "@/api/activity_routes";
import { CreateNewActivity } from "@/types/activities";
import { MemberEntity } from "@/types/members";
import { getMembers } from "@/api/membersRoutes";
import { ActivityEntity } from "@/types/activities";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays, format, intervalToDuration } from "date-fns";
interface AddNewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddNewActivityModal({ isOpen, onClose }: AddNewActivityModalProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { session, activeProject, activities } = useStore((state) => ({
		session: state.session,
		activities: state.userActivities,
		activeProject: state.activeProject,
	}));

	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(),
		to: new Date(),
	});

	const [activity, setActivity] = useState<CreateNewActivity>({
		name: "",
		description: "",
		start: format(new Date(), "yyyy-MM-dd"),
		project_id: activeProject?.project_id,
		end: format(addDays(new Date(), 2), "yyyy-MM-dd"),
		duration: 2,
		cost: 0,
		status: "On Schedule",
	});

	useEffect(() => {
		if (dateRange?.from && dateRange?.to) {
			setActivity((state) => ({
				...state,
				start: format(dateRange?.from || new Date(), "yyyy-MM-dd"),
				end: format(dateRange?.to || new Date(), "yyyy-MM-dd"),
				duration:
          intervalToDuration({
          	start: dateRange.from || new Date(),
          	end: dateRange.to || new Date(),
          }).days ?? 0,
			}));
		}
	}, [dateRange]);

	useEffect(() => {
		setActivity((state) => ({
			...state!,
			project_id: activeProject?.project_id,
		}));
	}, [activeProject]);

	const { data: members, isLoading: membersLoading } = useQuery({
		queryKey: ["memberList", session, activeProject],
		queryFn: async() => {
			if (!session || !activeProject) {
				return Promise.reject("No session or active project");
			}

			return getMembers(session, activeProject.project_id);
		},
		enabled: !!session?.access_token,
	});

	const mutation = useMutation({
		mutationFn: () => {
			if (!activity) return Promise.reject("No activity");
			return createActivity(session!, activity);
		},
		onError: (error) => {
			//console.log(error);
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activityList"] });
			setActivity({
				name: "",
				description: "",
				start: format(new Date(), "yyyy-MM-dd"),
				project_id: activeProject?.project_id,
				end: format(addDays(new Date(), 5), "yyyy-MM-dd"),
				duration: 5,
				cost: 0,
				status: "On Schedule",
			});
		},
	});

	const handleCancel = () => {
		onClose();
		setActivity({
			name: "",
			description: "",
			start: format(new Date(), "yyyy-MM-dd"),
			project_id: activeProject?.project_id,
			end: format(addDays(new Date(), 5), "yyyy-MM-dd"),
			duration: 5,
			cost: 0,
			status: "On Schedule",
		});
	};

	return (
		<Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
			<DialogContent className="max-w-2xl">
				{!activeProject && (
					<>
						<DialogHeader>
							<DialogTitle>No Project Selected</DialogTitle>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={onClose} variant="ghost">
                Cancel
							</Button>
						</DialogFooter>
					</>
				)}
				{activeProject && (
					<>
						<DialogHeader>
							<DialogTitle>Create New Task</DialogTitle>
							<DialogClose />
						</DialogHeader>
						<div className="space-y-4">
							<div className="mb-4 gap-4 flex flex-col">
								<div className="flex flex-col">
									<Label className="font-bold text-xs py-2" htmlFor="task-name">
                    Task Name
									</Label>
									<Input
										className="shadow-sm p-2 rounded-md bg-white text-sm"
										id="task-name"
										onChange={(e) => {
											setActivity((state) => ({
												...state!,
												name: e.target.value,
											}));
										}}
										placeholder="Task Name"
										required
										value={activity?.name}
									/>
								</div>
								<div className="flex flex-col ">
									<Label className="py-2" htmlFor="name">
                    Date Range
									</Label>
									<CalendarDateRangePicker
										className="col-span-3"
										date={dateRange}
										setDate={setDateRange}
									/>
								</div>
							</div>
							<div className="flex flex-col">
								<Label className="font-bold text-xs">
                  Task Duration in Days
								</Label>
								<div>
									<p className="text-sm pl-2 my-2">{activity.duration} days</p>
								</div>
							</div>
							<div className="flex flex-col">
								<Label className="font-bold text-xs py-2" htmlFor="task-cost">
                  Task Cost
								</Label>
								<Input
									className="shadow-sm p-2 rounded-md bg-white text-sm"
									id="task-cost"
									onChange={(e) => {
										if (!e.target.value) e.target.value = "0";
										setActivity((state) => ({
											...state!,
											cost: parseFloat(e.target.value),
										}));
									}}
									placeholder="Cost"
									type={activity.cost ? "number" : "text"}
									value={activity.cost === 0 ? "" : activity.cost}
								/>
							</div>
							<Separator className="my-4" />
							<div className="flex gap-8">
								<MultiSelect
									existingSelection={activity?.owner ?? []}
									onChange={(selectedOptions) => {
										setActivity((state) => ({
											...state!,
											owner: selectedOptions,
										}));
									}}
									options={members?.data.map((member: MemberEntity) => ({
										label: `${member.first_name} ${member.last_name}`,
										id: member.id,
									}))}
									title="Assignees"
								/>
								<MultiSelect
									existingSelection={activity?.dependencies ?? []}
									onChange={(selectedOptions) => {
										setActivity((state) => ({
											...state!,
											dependencies: selectedOptions,
										}));
									}}
									options={activities.map((activity: ActivityEntity) => ({
										label: `${activity.name}`,
										id: activity.id,
									}))}
									title="Depends on"
								/>
							</div>
							<Separator className="my-4" />
						</div>
						<div className="flex flex-col">
							<Label
								className="font-bold text-xs py-2"
								htmlFor="task-description"
							>
                Task Description
							</Label>
							<Textarea
								className="shadow-sm p-2 rounded-md bg-white text-sm "
								id="task-description"
								onChange={(e) =>
									setActivity((state) => ({
										...state!,
										description: e.target.value,
									}))
								}
								placeholder="Task Description"
								value={activity?.description}
							/>
						</div>
						<DialogFooter>
							<Button
								className="bg-brand-accent mr-3"
								onClick={() => {
									mutation.mutate();
									onClose();
								}}
							>
                Save
							</Button>
							<Button onClick={handleCancel} variant="ghost">
                Cancel
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default AddNewActivityModal;
