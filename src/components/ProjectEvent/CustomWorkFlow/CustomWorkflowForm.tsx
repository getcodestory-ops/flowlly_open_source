"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useStore } from "@/utils/store";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BasicMetadata } from "./components/BasicMetadata";
import { TriggerConfiguration } from "./components/TriggerConfiguration";
import { WorkflowNodes } from "./components/WorkflowNodes/WorkFlowNodes";
import { useWorkflowForm } from "./hooks/useWorkflowForm";
import { WorkflowFormData } from "./types";

import { Loader2 } from "lucide-react";
import { GraphData } from "../../WorkflowComponents/types";

const convertGraphToWorkflow = (graphData: GraphData, accessByKey: string): WorkflowFormData => {
	const recDay = graphData.metadata.recurrence_day;
	let recurrenceDay: string[] = [];
	if (Array.isArray(recDay)) {
		recurrenceDay = recDay;
	} else if (recDay) {
		recurrenceDay = [recDay];
	}
	
	return {
		id: graphData.id,
		name: graphData.name,
		workflowFor: graphData.description,
		recurrence: graphData.metadata.frequency,
		startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
		timeZone: graphData.metadata.time_zone,
		accessBy: "project_access",
		accessByKey: accessByKey,
		triggerBy:
	    (graphData.event_trigger?.[0]
	    	?.trigger_by as WorkflowFormData["triggerBy"]) ?? "time",
		triggerKeyword: graphData.event_trigger?.[0]?.trigger_keyword ?? "",
		triggerByKey: graphData.event_trigger?.[0]?.trigger_by_key ?? "",
		authorizedUsers: [],
		nodes: graphData.metadata?.nodes ?? [],
		recurrenceDay: recurrenceDay,
	};
};

export default function CustomWorkflowForm({
	onClose,
	editData,
}: {
  onClose: () => void;
  editData?: GraphData;
}) {
	// const queryClient = useQueryClient();
	// const { toast } = useToast();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const members = useStore((state) => state.members);

	const {
		currentStep,
		formData,
		handleNext,
		handleBack,
		handleSubmit,
		isFormValid,
		updateFormData,
		isPending,
		isSuccess,
	} = useWorkflowForm({ session, activeProject, members, editData });

	const handleFormUpdate = (updates: Partial<WorkflowFormData>) => {
		updateFormData(updates);
	};

	useEffect(() => {
		if (isSuccess) {
			onClose();
		}
	}, [isSuccess, onClose]);

	useEffect(() => {
		handleFormUpdate({
			accessByKey: activeProject?.project_id ?? "",
		});
		if (formData.triggerBy === "email_subject") {
			// Set default values for email triggers
			handleFormUpdate({
				triggerByKey: session?.user?.email ?? "User",
			});
		}
	}, [formData.triggerBy, activeProject, session]);

	useEffect(() => {
		if (editData) {
			handleFormUpdate(convertGraphToWorkflow(editData, activeProject?.project_id ?? ""));
		}
	}, [editData]);

	useEffect(() => {
		if (formData.recurrence === "weekdays") {
			const currentDay = format(new Date(), "EEEE");
			handleFormUpdate({ recurrenceDay: [currentDay] });
		}
	}, [formData.recurrence]);

	const [startDate, setStartDate] = useState<Date>(new Date());

	return (
		<div className="mx-auto border border-gray-200 rounded-lg p-4">
			<ScrollArea className="h-full">
				<Card
					className={`w-full ${
						currentStep < 2 ? "max-w-4xl" : "w-full"
					} mx-auto shadow-none`}
				>
					<CardHeader>
						<CardTitle>Deploy a new worker</CardTitle>
						<span className="text-sm mt-2 font-thin ">
							{new Date().toLocaleTimeString()} {formData.timeZone}
						</span>
					</CardHeader>
					<div>
						<CardContent className="space-y-6  ">
							{currentStep === 0 && (
								<BasicMetadata formData={formData} onChange={handleFormUpdate} />
							)}
							{currentStep === 1 && activeProject && (
								<>
									<div className="space-y-2">
										<Label htmlFor="triggerType">
                      How do you want to initiate this workflow?
										</Label>
										<Select
											name="triggerBy"
											onValueChange={(
												value: "ui" | "time",
											) => {
												handleFormUpdate({ triggerBy: value });
												if (value === "time") {
													handleFormUpdate({
														startDate: format(new Date(), "yyyy-MM-dd"),
														endDate: format(new Date(), "yyyy-MM-dd"),
														recurrence: "once",
													});
												}
											}}
											value={formData.triggerBy}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select trigger type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="ui">Chat</SelectItem>
												<SelectItem value="time">At a specific time</SelectItem>
											</SelectContent>
										</Select>
									</div>
									{formData.triggerBy === "time" && (
										<>
											<div className="space-y-2 m-2 p-2 bg-secondary rounded-lg">
												<div className="space-y-2">
													<Label htmlFor="recurrence">Repeat</Label>
													<Select
														name="recurrence"
														onValueChange={(value) =>
															handleFormUpdate({ recurrence: value })
														}
														value={
															formData.recurrence !== "manual"
																? formData.recurrence
																: "once"
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select repeat frequency" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="once">
                                Does not repeat
															</SelectItem>
															<SelectItem value="daily">Daily</SelectItem>
															<SelectItem value="weekly">Weekly</SelectItem>
															<SelectItem value="monthly">Monthly</SelectItem>
															<SelectItem value="weekdays">Weekdays</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="grid grid-cols-2 gap-4">
													{formData.recurrence === "weekly" && (
														<div className="space-y-2 col-span-2">
															<Label htmlFor="weeklyRecurrenceDay">On</Label>
															<div className="flex flex-wrap gap-2">
																{[
																	"Sunday",
																	"Monday",
																	"Tuesday",
																	"Wednesday",
																	"Thursday",
																	"Friday",
																	"Saturday",
																].map((day) => {
																	const recDays = Array.isArray(formData.recurrenceDay) 
																		? formData.recurrenceDay 
																		: formData.recurrenceDay ? [formData.recurrenceDay] : [];
																	return (
																		<label 
																			className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
																				recDays.includes(day)
																					? "bg-blue-100 text-blue-700" 
																					: "bg-gray-100 hover:bg-gray-200 text-gray-700"
																			}`}
																			key={day}
																		>
																			<Checkbox
																				checked={recDays.includes(day)}
																				className="sr-only"
																				onCheckedChange={() => {
																					const current = Array.isArray(formData.recurrenceDay) 
																						? formData.recurrenceDay 
																						: formData.recurrenceDay ? [formData.recurrenceDay] : [];
																					const updated = current.includes(day)
																						? current.filter((d) => d !== day)
																						: [...current, day];
																					handleFormUpdate({ recurrenceDay: updated });
																				}}
																			/>
																			{day.slice(0, 3)}
																		</label>
																	);
																})}
															</div>
														</div>
													)}
													{formData.recurrence === "weekdays" && (
														<div className="space-y-2 col-span-2">
															<Label htmlFor="weeklyRecurrenceDay">
                                Every Weekday
															</Label>
															<div className="px-3 py-2 rounded-md bg-gray-100 text-sm">
																Monday - Friday
															</div>
														</div>
													)}
													<div className="space-y-2">
														<Label>
															{formData.recurrence === "once"
																? "Date"
																: "Start Date"}
														</Label>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	className={
																		!startDate ? "text-muted-foreground" : ""
																	}
																	variant="outline"
																>
																	{formData.startDate
																		? format(new Date(formData.startDate), "PPP")
																		: "Pick a date"}
																	<CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
																</Button>
															</PopoverTrigger>
															<PopoverContent
																align="start"
																className="w-auto p-0"
															>
																<Calendar
																	initialFocus
																	mode="single"
																	onSelect={(date) => {
																		if (date) {
																			const currentDate = formData.startDate
																				? new Date(formData.startDate)
																				: new Date();
																			const newDate = new Date(date);
																			newDate.setHours(currentDate.getHours());
																			newDate.setMinutes(
																				currentDate.getMinutes(),
																			);
																			handleFormUpdate({
																				startDate: newDate.toISOString(),
																				startTime: newDate.toISOString(),
																			});
																		}
																	}}
																	selected={
																		formData.startDate
																			? new Date(formData.startDate)
																			: new Date()
																	}
																/>
															</PopoverContent>
														</Popover>
													</div>
													{formData.recurrence !== "once" && (
														<div className="space-y-2">
															<Label>End Date</Label>
															<Popover>
																<PopoverTrigger asChild>
																	<Button
																		className={
																			!formData.endDate
																				? "text-muted-foreground"
																				: ""
																		}
																		variant="outline"
																	>
																		{formData.endDate
																			? format(new Date(formData.endDate), "PPP")
																			: "Pick a date"}
																		<CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
																	</Button>
																</PopoverTrigger>
																<PopoverContent
																	align="start"
																	className="w-auto p-0"
																>
																	<Calendar
																		fromDate={new Date(formData.startDate ?? "")}
																		initialFocus
																		mode="single"
																		onSelect={(date) => {
																			if (date) {
																				const currentEndDate = formData.endDate
																					? new Date(formData.endDate)
																					: new Date();
																				const newEndDate = new Date(date);
																				newEndDate.setHours(
																					currentEndDate.getHours(),
																				);
																				newEndDate.setMinutes(
																					currentEndDate.getMinutes(),
																				);
																				handleFormUpdate({
																					endDate: newEndDate.toISOString(),
																				});
																			} else {
																				handleFormUpdate({ endDate: undefined });
																			}
																		}}
																		selected={
																			formData.endDate
																				? new Date(formData.endDate)
																				: undefined
																		}
																	/>
																</PopoverContent>
															</Popover>
														</div>
													)}
												</div>
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor="startTime">Start Time</Label>
														<Select
															onValueChange={(time) => {
																const [hours, minutes] = time
																	.split(":")
																	.map(Number);
																const newDate = new Date(formData.startTime);
																newDate.setHours(hours);
																newDate.setMinutes(minutes);
																handleFormUpdate({
																	startTime: newDate.toISOString(),
																});
															}}
															value={format(
																new Date(formData.startTime),
																"HH:mm",
															)}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select start time" />
															</SelectTrigger>
															<SelectContent>
																{Array.from({ length: 96 }, (_, i) => {
																	const date = addMinutes(
																		new Date().setHours(0, 0, 0, 0),
																		i * 15,
																	);
																	return (
																		<SelectItem
																			key={i}
																			value={format(date, "HH:mm")}
																		>
																			{format(date, "p")}
																		</SelectItem>
																	);
																})}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>
										</>
									)}
									<TriggerConfiguration
										activeProject={activeProject}
										formData={formData}
										members={members}
										onChange={handleFormUpdate}
									/>
								</>
							)}
							{currentStep === 2 && (
								<WorkflowNodes formData={formData} onChange={handleFormUpdate} />
							)}
						</CardContent>
						<CardFooter className="flex justify-between">
							{currentStep > 0 && (
								<Button
									onClick={handleBack}
									type="button"
									variant="outline"
								>
                  Back
								</Button>
							)}
							{currentStep < 2 ? (
								<Button
									disabled={currentStep === 0 && !isFormValid}
									onClick={handleNext}
									type="button"
								>
                  Next
								</Button>
							) : (
								<Button
									disabled={!formData.nodes.length || isPending}
									onClick={handleSubmit}
									type="button"
								>
									{isPending ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : editData ? (
										"Update Workflow"
									) : (
										"Save Workflow"
									)}
								</Button>
							)}
						</CardFooter>
					</div>
				</Card>
			</ScrollArea>
		</div>
	);
}
