"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "../ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon, PlusCircle, Link, Mic } from "lucide-react";
import { format, parse, addMinutes, roundToNearestMinutes } from "date-fns";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
import { CreateEvent } from "@/types/projectEvents";
import { createNewProjectEvent } from "@/api/taskQueue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GraphData } from "../WorkflowComponents/types";
import MeetingDocumentEditor from "./MeetingDocumentEditor";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  language?: string;
  phoneNumber?: string;
}

interface Event {
  id: string;
  name: string;
  participants: Participant[];
  recurrence: string;
  startDate: string;
  endDate: string;
  startTime: string;
  duration: string;
  participationLink?: string;
}

function ParticipantSelector({
	participants,
	setParticipants,
	selectedParticipants,
	setSelectedParticipants,
}: {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  selectedParticipants: string[];
  setSelectedParticipants: (selectedParticipants: string[]) => void;
}) {
	const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
	const [newParticipant, setNewParticipant] = useState<Partial<Participant>>(
		{},
	);

	const handleAddParticipant = () => {
		if (
			newParticipant.firstName &&
      newParticipant.lastName &&
      newParticipant.email
		) {
			const participant = {
				...newParticipant,
				id: Date.now().toString(), // Simple unique ID generation
			} as Participant;
			setParticipants([...participants, participant]);
			setSelectedParticipants([...selectedParticipants, participant.id]);
			setNewParticipant({});
			setIsAddParticipantOpen(false);
		}
	};

	return (
		<div className="space-y-2">
			<Label>Participants / Attendees</Label>
			<div className="flex space-x-2">
				<MultiSelect
					className="flex-grow"
					defaultValue={selectedParticipants}
					onValueChange={setSelectedParticipants}
					options={participants.map((p) => ({
						label: `${p.email} `,
						value: p.email,
					}))}
				/>
				<Dialog
					onOpenChange={setIsAddParticipantOpen}
					open={isAddParticipantOpen}
				>
					<DialogTrigger asChild>
						<Button type="button" variant="outline">
							<PlusCircle className="mr-2 h-4 w-4" />
              Add
						</Button>
					</DialogTrigger>
					<DialogContent aria-describedby="new_user creation dialogure" title="Add Participant">
						<DialogHeader>
							<DialogTitle>Add Participant</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										onChange={(e) =>
											setNewParticipant({
												...newParticipant,
												firstName: e.target.value,
											})
										}
										required
										value={newParticipant.firstName || ""}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										onChange={(e) =>
											setNewParticipant({
												...newParticipant,
												lastName: e.target.value,
											})
										}
										required
										value={newParticipant.lastName || ""}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									onChange={(e) =>
										setNewParticipant({
											...newParticipant,
											email: e.target.value,
										})
									}
									required
									type="email"
									value={newParticipant.email || ""}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="role">Role (Optional)</Label>
								<Input
									id="role"
									onChange={(e) =>
										setNewParticipant({
											...newParticipant,
											role: e.target.value,
										})
									}
									value={newParticipant.role || ""}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="language">Language (Optional)</Label>
								<Input
									id="language"
									onChange={(e) =>
										setNewParticipant({
											...newParticipant,
											language: e.target.value,
										})
									}
									value={newParticipant.language || ""}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
								<Input
									id="phoneNumber"
									onChange={(e) =>
										setNewParticipant({
											...newParticipant,
											phoneNumber: e.target.value,
										})
									}
									value={newParticipant.phoneNumber || ""}
								/>
							</div>
						</div>
						<Button onClick={handleAddParticipant} type="button">
              Add Participant
						</Button>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

export default function ProjectEventCreationForm({
	onClose,
	editData,
}: {
  onClose: () => void;
  editData?: GraphData;
}) {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const members = useStore((state) => state.members);
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const [participants, setParticipants] = useState<Participant[]>(
		members.map((m) => ({
			id: m.id,
			firstName: m.first_name,
			lastName: m.last_name,
			email: m.email,
		})),
	);
	const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
		[],
	);
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>();

	const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
	const [meetingName, setMeetingName] = useState("");
	const [recurrence, setRecurrence] = useState<string>("once");
	const [startTime, setStartTime] = useState(
		format(roundToNearestMinutes(new Date(), { nearestTo: 30 }), "HH:mm"),
	);
	const [duration, setDuration] = useState("60");
	const [participationLink, setParticipationLink] = useState("");
	const [location, setLocation] = useState("");
	const [autoJoin, setAutoJoin] = useState(true);
	const [isFormValid, setIsFormValid] = useState(false);
	const [weeklyRecurrenceDay, setWeeklyRecurrenceDay] = useState<string[]>(
		[format(new Date(), "EEEE")],
	);
	const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
	const [participationOption, setParticipationOption] = useState<
    "join" | "record"
  >("join");
	const [timeZone, setTimeZone] = useState(
		Intl.DateTimeFormat().resolvedOptions().timeZone,
	);
	const [isJoining, setIsJoining] = useState(false);
	const [showPostCreationOptions, setShowPostCreationOptions] = useState(false);
	const [editingDocument, setEditingDocument] = useState<"agenda" | "template" | null>(null);
	const [agendaContent, setAgendaContent] = useState("");
	const [templateContent, setTemplateContent] = useState("");
	const [eventId, setEventId] = useState<string | null>(null);

	const { mutate, isPending } = useMutation({
		mutationFn: createNewProjectEvent,
		onSuccess: (data) => {
			toast({
				title: "Success",
				description: "Event created successfully!",
				duration: 9000,
			});
			queryClient.invalidateQueries({ queryKey: ["projectEvents"] });
			setShowPostCreationOptions(true);
			setEventId(data.project_event.id);
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				duration: 9000,
			});
		},
	});

	useEffect(() => {
		if (editData) {
			// Set basic event info
			setMeetingName(editData.name || "");
			setSelectedEvent(editData.id || null);
			
			// Set metadata fields
			if (editData.metadata) {
				setParticipationLink(editData.metadata.online_link || "");
				setLocation(editData.metadata.location || "");
				
				const frequency = editData.metadata.frequency || "once";
				setRecurrence(frequency);
				
				// Get Microsoft recurrence object for reading pattern details
				const msRecurrence = editData.event_schedule?.[0]?.schedule?.recurrence;
			
				// Check for Microsoft recurrence interval - prioritize recurrence object over metadata
				if (msRecurrence?.pattern?.interval) {
				// Use interval from the recurrence pattern (most accurate)
					setRecurrenceInterval(msRecurrence.pattern.interval);
				} else if (editData.metadata.recurrence_interval) {
				// Fallback to metadata interval
					setRecurrenceInterval(editData.metadata.recurrence_interval);
				} else {
				// Default to 1
					setRecurrenceInterval(1);
				}
				
				// Set time from metadata if available
				if (editData.metadata.time) {
					try {
						// If the time is in a different timezone, convert it to local time for display
						if (editData.metadata.time_zone && editData.metadata.time_zone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
							// Parse the time and convert from stored timezone to local timezone
							const timeParts = editData.metadata.time.split(":");
							
							// Validate that we have valid time parts
							if (timeParts.length >= 2) {
								const hours = Number(timeParts[0]);
								const minutes = Number(timeParts[1]);
								
								// Check if hours and minutes are valid numbers
								if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
									// Create a date object in the stored timezone
									const storedDate = new Date();
									storedDate.setUTCHours(hours, minutes, 0, 0);
									
									// If stored timezone is UTC, convert to local
									if (editData.metadata.time_zone === "UTC") {
										// Get local time from UTC time
										const localTime = format(storedDate, "HH:mm");
										setStartTime(localTime);
									} else {
										// For other timezones, just use the time as-is for now
										setStartTime(editData.metadata.time);
									}
								} else {
									// Invalid time values, use the time as-is
									console.warn("Invalid time values in metadata:", editData.metadata.time);
									setStartTime(editData.metadata.time);
								}
							} else {
								// Invalid time format, use the time as-is
								console.warn("Invalid time format in metadata:", editData.metadata.time);
								setStartTime(editData.metadata.time);
							}
						} else {
							setStartTime(editData.metadata.time);
						}
					} catch (error) {
						// If any error occurs during time conversion, fall back to using the time as-is
						console.error("Error processing time from metadata:", error);
						setStartTime(editData.metadata.time || format(roundToNearestMinutes(new Date(), { nearestTo: 30 }), "HH:mm"));
					}
				}
				
				setDuration(editData.metadata.duration?.toString() || "60");
				
				// Handle recurrence_day - prioritize recurrence object over metadata
				if (msRecurrence?.pattern?.daysOfWeek && msRecurrence.pattern.daysOfWeek.length > 0) {
					// Use days from recurrence pattern (capitalize first letter to match UI format)
					setWeeklyRecurrenceDay(
						msRecurrence.pattern.daysOfWeek.map((day) => 
							day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
						),
					);
				} else if (editData.metadata.recurrence_day) {
					// Fallback to metadata
					if (Array.isArray(editData.metadata.recurrence_day)) {
						setWeeklyRecurrenceDay(editData.metadata.recurrence_day);
					} else {
						setWeeklyRecurrenceDay([editData.metadata.recurrence_day]);
					}
				} else {
					setWeeklyRecurrenceDay([format(new Date(), "EEEE")]);
				}
				
				// Load auto_join setting
				if (editData.metadata.auto_join !== undefined) {
					setAutoJoin(editData.metadata.auto_join);
				}
				
				setTimeZone(editData.metadata.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone);
			}

			// Set schedule information
			if (editData.event_schedule && editData.event_schedule.length > 0) {
				const schedule = editData.event_schedule[0].schedule;
				setStartDate(new Date(schedule.start));
				
				// Set end date if it exists
				if (schedule.end) {
					setEndDate(new Date(schedule.end));
				}
				
				// Set time zone from schedule if not in metadata
				if (schedule.time_zone && !editData.metadata?.time_zone) {
					setTimeZone(schedule.time_zone);
				}
				
				// Set start time from schedule time if not already set from metadata
				if (schedule.time && !editData.metadata?.time) {
					let runTime = "";
					// Handle both array and object formats
					if (Array.isArray(schedule.time) && schedule.time.length > 0) {
						runTime = schedule.time[0].run_time;
					} else if (typeof schedule.time === "object" && "run_time" in schedule.time) {
						runTime = schedule.time.run_time;
					}
					
					if (runTime) {
						// Extract HH:mm from HH:mm:ss format
						const timeMatch = runTime.match(/(\d{2}:\d{2})/);
						if (timeMatch) {
							setStartTime(timeMatch[1]);
						}
					}
				}
			}
		}
	}, [editData]);

	useEffect(() => {
		const isValid =
      meetingName !== "" &&
      startTime !== "" &&
      duration !== "" &&
      (participationOption === "join" ? participationLink !== "" : true);
		setIsFormValid(isValid);
	}, [
		meetingName,
		selectedParticipants,
		startDate,
		endDate,
		startTime,
		duration,
		participationLink,
		participationOption,
	]);

	// Reset interval to 1 when recurrence is set to "once" (but not during initial load of edit data)
	useEffect(() => {
		// Only reset if we're not editing (editData is null)
		// This prevents resetting the interval when loading edit data
		if (recurrence === "once" && !editData) {
			setRecurrenceInterval(1);
		}
	}, [recurrence, editData]);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!session || !activeProject) {
			console.error("Session or active project not available");
			return;
		}
		
		// Ensure the creator is always included as a participant
		let finalParticipants = [...selectedParticipants];
		if (session.user?.email && !selectedParticipants.includes(session.user.email)) {
			finalParticipants.push(session.user.email);
		}
		
		// Convert time back to the stored timezone if editing
		let submissionTime = startTime;
		if (editData?.metadata?.time_zone && editData.metadata.time_zone !== timeZone) {
			// Convert from local time back to stored timezone (UTC)
			if (editData.metadata.time_zone === "UTC") {
				const [hours, minutes] = startTime.split(":").map(Number);
				const localDate = new Date();
				localDate.setHours(hours, minutes, 0, 0);
				
				// Convert to UTC by getting UTC hours and minutes
				const utcHours = localDate.getUTCHours();
				const utcMinutes = localDate.getUTCMinutes();
				submissionTime = `${String(utcHours).padStart(2, "0")}:${String(utcMinutes).padStart(2, "0")}`;
			}
		}
		
		// Construct Microsoft-compatible recurrence structure
		let recurrenceData: any = recurrence;
		
		// Send full recurrence structure if:
		// 1. Interval is greater than 1, OR
		// 2. It's weekly with multiple days selected (for better clarity on backend)
		const shouldSendFullRecurrence = recurrence !== "once" && (
			recurrenceInterval > 1 || 
			(recurrence === "weekly" && weeklyRecurrenceDay.length > 1)
		);
		
		if (shouldSendFullRecurrence) {
			// Build the recurrence pattern
			const pattern: any = {
				type: recurrence,
				interval: recurrenceInterval,
			};
			
			// Add days of week for weekly recurrence
			if (recurrence === "weekly" && weeklyRecurrenceDay.length > 0) {
				pattern.daysOfWeek = weeklyRecurrenceDay.map((day) => day.toLowerCase());
			}
			
			// Build the recurrence range
			const range: any = {
				type: endDate ? "endDate" : "noEnd",
				startDate: format(startDate, "yyyy-MM-dd"),
				recurrenceTimeZone: timeZone,
			};
			
			if (endDate) {
				range.endDate = format(endDate, "yyyy-MM-dd");
			}
			
			// Construct the full recurrence object
			recurrenceData = {
				pattern,
				range,
			};
		}
		
		const submissionData: CreateEvent = {
			id: selectedEvent || undefined, // Top-level ID for backend to identify update vs create
			project_event: {
				id: selectedEvent || undefined,
				name: meetingName,
				event_type: "meeting",
				metadata: {
					online_link: participationLink,
					location: location,
					frequency: recurrence,
					time: submissionTime,
					duration: parseInt(duration ?? 0),
					recurrence_day: weeklyRecurrenceDay.length > 0 ? weeklyRecurrenceDay : undefined,
					recurrence_interval: recurrence !== "once" ? recurrenceInterval : undefined,
					auto_join: recurrence !== "once" ? autoJoin : undefined,
					time_zone: editData?.metadata?.time_zone || timeZone,
					resource_id: editData?.metadata?.resource_id,
					calendar_event_id: editData?.metadata?.calendar_event_id,
				},
			},
			event_participants: finalParticipants.map((p) => {
				// Assign admin role to the creator (current user), member role to others
				const isCreator = session?.user?.email && p === session.user.email;
				return {
					role: isCreator ? "admin" : "member",
					identification: "email",
					metadata: {
						email: p,
					},
				};
			}),
			recurrence: recurrenceData,
			time_zone: timeZone,
			start_date: startDate
				? format(startDate, "yyyy-MM-dd")
				: format(new Date(), "yyyy-MM-dd"),
			end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
			start_time: startTime,
			duration: parseInt(duration ?? 0),
			participation_link:
        participationOption === "join" ? participationLink : undefined,
			auto_join: participationOption === "join" ? autoJoin : false,
			is_recording: participationOption === "record",
			join_now: isJoining,
		};
	

		mutate({
			session,
			projectId: activeProject.project_id,
			projectEvent: submissionData,
		});
	};

	return (
		<ScrollArea className="w-full h-full">
			<div>
				<Card className="w-full shadow-none">
					{!showPostCreationOptions ? (
						<>
							<CardHeader>
								<CardTitle>
									{editData ? "Edit Meeting" : "Join meeting"} <br />
									<span className="text-sm mt-2 font-thin">
										{new Date().toLocaleTimeString()} {timeZone}
										{editData?.metadata?.time_zone && editData.metadata.time_zone !== timeZone && (
											<span className="ml-2 text-xs text-muted-foreground">
												(Original: {editData.metadata.time_zone})
											</span>
										)}
									</span>
								</CardTitle>
							</CardHeader>
							<form onSubmit={handleSubmit}>
								<CardContent className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="meetingName">Meeting Name</Label>
										<Input
											id="meetingName"
											name="meetingName"
											onChange={(e) => setMeetingName(e.target.value)}
											required
											value={meetingName}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="location">Location</Label>
										<Input
											id="location"
											name="location"
											onChange={(e) => setLocation(e.target.value)}
											placeholder="e.g., Microsoft Teams Meeting, Conference Room A"
											value={location}
										/>
									</div>
									<div className="space-y-2">
										<ParticipantSelector
											participants={participants}
											selectedParticipants={selectedParticipants}
											setParticipants={setParticipants}
											setSelectedParticipants={setSelectedParticipants}
										/>
										<p className="text-xs text-muted-foreground">
											💡 You&apos;ll automatically be included as an admin participant
										</p>
									</div>
									<div className="space-y-2 p-2 bg-secondary rounded-lg">
										<div className="space-y-2">
											<Label htmlFor="recurrence">Repeat</Label>
											<div className="flex gap-2">
												<Select
													key={`recurrence-${recurrence}-${editData?.id || "new"}`}
													name="recurrence"
													onValueChange={setRecurrence}
													value={recurrence}
												>
													<SelectTrigger className="flex-1">
														<SelectValue placeholder="Select repeat frequency" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="once">Does not repeat</SelectItem>
														<SelectItem value="daily">Daily</SelectItem>
														<SelectItem value="weekly">Weekly</SelectItem>
														<SelectItem value="monthly">Monthly</SelectItem>
														<SelectItem value="weekdays">Weekdays</SelectItem>
													</SelectContent>
												</Select>
												{recurrence !== "once" && (
													<div className="flex items-center gap-2">
														<Label className="text-sm whitespace-nowrap">Every</Label>
														<Select
															onValueChange={(val) => setRecurrenceInterval(parseInt(val))}
															value={recurrenceInterval.toString()}
														>
															<SelectTrigger className="w-20">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
																	<SelectItem key={num} value={num.toString()}>
																		{num}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<span className="text-sm text-muted-foreground">
															{recurrence === "daily" ? "days" : 
															 recurrence === "weekly" ? "weeks" : 
															 recurrence === "monthly" ? "months" : "intervals"}
														</span>
													</div>
												)}
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											{recurrence === "weekly" && (
												<div className="space-y-2 col-span-2">
													<Label htmlFor="weeklyRecurrenceDay">On</Label>
													<MultiSelect
														defaultValue={weeklyRecurrenceDay}
														onValueChange={setWeeklyRecurrenceDay}
														options={[
															"Sunday",
															"Monday",
															"Tuesday",
															"Wednesday",
															"Thursday",
															"Friday",
															"Saturday",
														].map((day) => ({
															label: day,
															value: day,
														}))}
														placeholder="Select days"
													/>
												</div>
											)}
											<div className="space-y-2 ">
												<Label className="mr-2">
													{recurrence === "once" ? "Date" : "Start Date"}{" "}
												</Label>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															className={!startDate ? "text-muted-foreground" : ""}
															variant="outline"
														>
															{startDate ? format(startDate, "PPP") : "Pick a date"}
															<CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
														</Button>
													</PopoverTrigger>
													<PopoverContent align="start" className="w-auto p-0">
														<Calendar
															initialFocus
															mode="single"
															onSelect={(date) => setStartDate(date as Date)}
															selected={startDate}
														/>
													</PopoverContent>
												</Popover>
											</div>
											{recurrence !== "once" && (
												<div className="space-y-2">
													<Label className="mr-2">End Date </Label>
													<Popover>
														<PopoverTrigger asChild>
															<Button
																className={!endDate ? "text-muted-foreground" : ""}
																variant="outline"
															>
																{endDate ? format(endDate, "PPP") : "Pick a date"}
																<CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
															</Button>
														</PopoverTrigger>
														<PopoverContent align="start" className="w-auto p-0">
															<Calendar
																initialFocus
																mode="single"
																onSelect={(date) => setEndDate(date as Date)}
																selected={endDate}
															/>
														</PopoverContent>
													</Popover>
												</div>
											)}
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="startTime">Time</Label>
											<Select 
												key={`startTime-${startTime}-${editData?.id || "new"}`}
												onValueChange={setStartTime} 
												value={startTime}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select time" />
												</SelectTrigger>
												<SelectContent>
													{Array.from({ length: 96 }, (_, i) => {
														const date = addMinutes(
															new Date().setHours(0, 0, 0, 0),
															i * 15,
														);
														return (
															<SelectItem key={i} value={format(date, "HH:mm")}>
																{format(date, "p")}
															</SelectItem>
														);
													})}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="duration">Duration</Label>
											<Select 
												key={`duration-${editData?.id || "new"}`}
												onValueChange={setDuration} 
												value={duration}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select duration" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="5">5 minutes</SelectItem>
													<SelectItem value="30">30 minutes</SelectItem>
													<SelectItem value="60">1 hour</SelectItem>
													<SelectItem value="90">1.5 hours</SelectItem>
													<SelectItem value="120">2 hours</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									{participationOption === "join" && (
										<>
											<div className="space-y-2">
												<Label htmlFor="participationLink">
                        Participation Link
												</Label>
												<Input
													id="participationLink"
													name="participationLink"
													onChange={(e) => setParticipationLink(e.target.value)}
													placeholder="https://meet.example.com/your-meeting"
													value={participationLink}
												/>
											</div>
											{recurrence !== "once" && (
												<div className="flex items-center space-x-2">
													<Checkbox
														checked={autoJoin}
														id="autoJoin"
														onCheckedChange={(checked) =>
															setAutoJoin(checked as boolean)
														}
													/>
													<Label htmlFor="autoJoin">
                        Auto-join at corresponding times
													</Label>
												</div>
											)}
										</>
									)}
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										disabled={!isFormValid || isPending}
										type="submit"
									>
										{isPending ? (
											<span className="spinner">Loading...</span>
										) : editData ? (
											"Update Event"
										) : (
											"Create Event"
										)}
									</Button>
								</CardFooter>
							</form>
						</>
					) : editingDocument ? (
						<MeetingDocumentEditor
							eventId={eventId || ""}
							onClose={() => setEditingDocument(null)}
							onSave={(content) => {
								if (editingDocument === "agenda") {
									setAgendaContent(content);
								} else {
									setTemplateContent(content);
								}
								setEditingDocument(null);
							}}
							type={editingDocument}
						/>
					) : (
						<>
							<CardHeader>
								<CardTitle>Event Created Successfully!</CardTitle>
							</CardHeader>
							<CardFooter className="flex justify-between">
								<Button onClick={onClose}>
									Done
								</Button>
							</CardFooter>
						</>
					)}
				</Card>
			</div>
		</ScrollArea>
	);
}
