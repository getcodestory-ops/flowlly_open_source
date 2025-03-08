"use client";

import { useState, useEffect } from "react";
import { useConfigureTaskQueue } from "./useCofigureTaskQueue";
import { timezones } from "@/utils/timezones";
import { MemberEntity } from "@/types/members";
import { TimeConfig } from "@/types/taskQueue";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import MultiSelect from "@/components/MultiSelect/MultiSelect";

function ConfigureTaskQueue() {
	const {
		taskQueue,
		members,
		defaultQueueItem,
		editQueueItem,
		setEditQueueItem,
		saveTaskQueue,
		deleteTaskQueueItem,
	} = useConfigureTaskQueue();

	const { toast } = useToast();
	const [timezoneFilter, setTimezoneFilter] = useState("");
	const [showTimezoneOptions, setShowTimezoneOptions] = useState(false);
	const [timeInput, setTimeInput] = useState<string>("");
	const [deliveryTimeInput, setDeliveryTimeInput] = useState<string>("");
	const [selectedTimes, setSelectedTimes] = useState<TimeConfig[]>(
		editQueueItem.run_config.time ?? [],
	);

	useEffect(() => {
		setTimezoneFilter(editQueueItem.run_config.time_zone);
		setSelectedTimes(editQueueItem.run_config.time);
	}, [editQueueItem]);

	const handleDayChange = (selectedDays: string[]) => {
		const dayNumbers = selectedDays.map((day) => parseInt(day));
		setEditQueueItem((prev) => ({
			...prev,
			run_config: {
				...prev.run_config,
				day: dayNumbers,
			},
		}));
	};

	const setStartDateTime = (date: string) =>
		setEditQueueItem((prev) => ({
			...prev,
			run_config: {
				...prev.run_config,
				start: date,
			},
		}));

	const setEndDateTime = (date: string) =>
		setEditQueueItem((prev) => ({
			...prev,
			run_config: {
				...prev.run_config,
				end: date,
			},
		}));

	const handleTaskOwnerIdsChange = (selectedOwners: string[]) => {
		setEditQueueItem((prev) => ({
			...prev,
			task_args: {
				...prev.task_args,
				task_owner_ids: selectedOwners,
			},
		}));
	};

	const handleTimezoneChange = (selectedOption: string) => {
		setEditQueueItem((prev) => ({
			...prev,
			run_config: {
				...prev.run_config,
				time_zone: selectedOption,
			},
		}));
		setShowTimezoneOptions(false);
		setTimezoneFilter(selectedOption);
	};

	const handleAddTime = () => {
		if (timeInput && deliveryTimeInput) {
			if (timeInput > deliveryTimeInput) {
				toast({
					title: "Error",
					description: "Run time should be earlier than delivery time",
					variant: "destructive",
				});
				return;
			}
		}

		timeInput &&
      setEditQueueItem((prev) => ({
      	...prev,
      	run_config: {
      		...prev.run_config,
      		time: [
      			...prev.run_config.time,
      			{ run_time: timeInput, delivery_time: deliveryTimeInput },
      		],
      	},
      }));

		if (
			timeInput &&
      !selectedTimes.includes({
      	run_time: timeInput,
      	delivery_time: deliveryTimeInput,
      })
		) {
			setSelectedTimes([
				...selectedTimes,
				{ run_time: timeInput, delivery_time: deliveryTimeInput },
			]);
			setTimeInput("");
			setDeliveryTimeInput("");
		}
	};

	const handleRemoveTime = (time: string) => {
		setEditQueueItem((prev) => ({
			...prev,
			run_config: {
				...prev.run_config,
				time: prev.run_config.time.filter((t) => t.run_time !== time),
			},
		}));
		setSelectedTimes(selectedTimes.filter((t) => t.run_time !== time));
	};

	return (
		<div className="flex flex-row gap-6 p-4">
			<div className="flex flex-col w-1/4">
				<div className="flex flex-col gap-4 ">
					<Button
						onClick={() => setEditQueueItem(defaultQueueItem)}
						variant="outline"
					>
            Add New Task Schedule
					</Button>
					<div className="p-2">
						<h3 className="font-bold ">Current Activities:</h3>
					</div>
				</div>
				<div>
					<ScrollArea className=" w-full">
						{taskQueue &&
              taskQueue.length > 0 &&
              taskQueue.map((task, index) => (
              	<Card
              		className={`mb-2 cursor-pointer ${
              			editQueueItem.id === task.id ? "bg-secondary" : ""
              		}`}
              		key={task.id}
              		onClick={() => setEditQueueItem(task)}
              	>
              		<CardContent className="flex justify-between items-center p-4">
              			<span>
              				{index + 1}. {task.task_name}
              			</span>
              			{editQueueItem.id === task.id && (
              				<Button
              					onClick={() => deleteTaskQueueItem(task.id)}
              					size="icon"
              					variant="ghost"
              				>
              					<Trash2 className="h-4 w-4" />
              				</Button>
              			)}
              		</CardContent>
              	</Card>
              ))}
					</ScrollArea>
				</div>
			</div>
			<div className="flex flex-col">
				<div>
					{editQueueItem && (
						<div className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-semibold">
                  Coordinator Task
								</label>
								<Select
									onValueChange={(value) =>
										setEditQueueItem({
											...editQueueItem,
											task_function: value,
										})
									}
									value={editQueueItem.task_function}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select task function" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="generate_daily_briefing">
                      Daily Task Reminder
										</SelectItem>
										<SelectItem value="get_project_updates">
                      Request Progress Update
										</SelectItem>
										<SelectItem value="process_task_history">
                      Update Schedule
										</SelectItem>
										<SelectItem value="deliver_notification">
                      Send Messages
										</SelectItem>
										<SelectItem value="generate_daily_report">
                      Generate Daily Report
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-semibold">Task Name</label>
								<Input
									onChange={(e) =>
										setEditQueueItem({
											...editQueueItem,
											task_name: e.target.value,
										})
									}
									placeholder="Task Name"
									value={editQueueItem.task_name}
								/>
							</div>
							<div>
								<MultiSelect
									existingSelection={editQueueItem.run_config.day.map(String)}
									onChange={handleDayChange}
									options={[
										{ id: "0", label: "Monday" },
										{ id: "1", label: "Tuesday" },
										{ id: "2", label: "Wednesday" },
										{ id: "3", label: "Thursday" },
										{ id: "4", label: "Friday" },
										{ id: "5", label: "Saturday" },
										{ id: "6", label: "Sunday" },
									]}
									title="Days"
								/>
							</div>
							<MultiSelect
								existingSelection={editQueueItem.task_args.task_owner_ids}
								onChange={handleTaskOwnerIdsChange}
								options={members?.data.map((member: MemberEntity) => ({
									label: `${member.first_name} ${member.last_name}`,
									id: member.id,
								}))}
								title="Assignees"
							/>
							<div className="space-y-2">
								<label className="text-sm font-semibold">Start task from</label>
								<Input
									onChange={(e) => setStartDateTime(e.target.value)}
									type="date"
									value={editQueueItem.run_config.start.split("T")[0]}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-semibold">Run Task until</label>
								<Input
									onChange={(e) => setEndDateTime(e.target.value)}
									type="date"
									value={editQueueItem.run_config.end?.split("T")[0]}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-semibold">Time zone</label>
								<Popover
									onOpenChange={setShowTimezoneOptions}
									open={showTimezoneOptions}
								>
									<PopoverTrigger asChild>
										<Button className="w-full justify-start" variant="outline">
											{timezoneFilter || "Select timezone"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="p-0">
										<Command>
											<CommandInput placeholder="Search timezone..." />
											<CommandEmpty>No timezone found.</CommandEmpty>
											<CommandGroup>
												<ScrollArea className="h-72">
													{timezones.map((timezone) => (
														<CommandItem
															key={timezone}
															onSelect={() => handleTimezoneChange(timezone)}
														>
															{timezone}
														</CommandItem>
													))}
												</ScrollArea>
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
							<div className="space-y-2">
								<div className="flex gap-2">
									<label className="text-sm font-semibold">
										{editQueueItem.task_function ===
                      "generate_daily_briefing" ||
                    editQueueItem.task_function === "get_project_updates"
											? "Draft messages"
											: "Run task at"}
									</label>
									{(editQueueItem.task_function === "generate_daily_briefing" ||
                    editQueueItem.task_function === "get_project_updates") && (
										<label className="text-sm font-semibold">
                      : Deliver Message at
										</label>
									)}
								</div>
								<div className="flex items-center space-x-2">
									<Input
										onChange={(e) => setTimeInput(e.target.value)}
										placeholder="HH:MM"
										type="time"
										value={timeInput}
									/>
									{(editQueueItem.task_function === "generate_daily_briefing" ||
                    editQueueItem.task_function === "get_project_updates") && (
										<Input
											onChange={(e) => setDeliveryTimeInput(e.target.value)}
											placeholder="HH:MM"
											type="time"
											value={deliveryTimeInput}
										/>
									)}
									<Button onClick={handleAddTime}>Add Time</Button>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									{selectedTimes.map((time, index) => (
										<Badge key={index} variant="secondary">
											{time.run_time} : {time.delivery_time ?? ""}
											<Button
												className="ml-2 h-4 w-4 p-0"
												onClick={() => handleRemoveTime(time.run_time)}
												size="sm"
												variant="ghost"
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</Badge>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="mt-4">
					<Button onClick={saveTaskQueue}>
						{editQueueItem.id ? "Update" : "Create"}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default ConfigureTaskQueue;
