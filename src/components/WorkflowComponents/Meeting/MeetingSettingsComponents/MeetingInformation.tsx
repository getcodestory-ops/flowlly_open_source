import React, { useState, useEffect } from "react";
import { Calendar, Clock, Globe, Link, Repeat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkflow } from "@/hooks/useWorkflow";
import { timezones } from "@/utils/timezones";

export const MeetingInformation: React.FC = () => {
	const { currentGraph } = useWorkflow();
	const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	// Initialize state from currentGraph or defaults
	const [meetingName, setMeetingName] = useState(currentGraph?.name || "");
	const [description, setDescription] = useState(currentGraph?.description || "");
	const [frequency, setFrequency] = useState(currentGraph?.metadata?.frequency || "weekly");
	const [time, setTime] = useState(currentGraph?.metadata?.time || "");
	const [duration, setDuration] = useState(currentGraph?.metadata?.duration?.toString() || "60");
	const [timeZone, setTimeZone] = useState(
		currentGraph?.metadata?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone,
	);
	const [onlineLink, setOnlineLink] = useState(currentGraph?.metadata?.online_link || "");
	const [selectedDays, setSelectedDays] = useState<number[]>(
		currentGraph?.event_schedule?.[0]?.schedule?.day || [],
	);
	const [weeklyRecurrenceDay, setWeeklyRecurrenceDay] = useState(
		currentGraph?.metadata?.recurrence_day || "Monday",
	);

	// Update state when currentGraph changes
	useEffect(() => {
		if (currentGraph) {
			setMeetingName(currentGraph.name || "");
			setDescription(currentGraph.description || "");
			setFrequency(currentGraph.metadata?.frequency || "weekly");
			setTime(currentGraph.metadata?.time || "");
			setDuration(currentGraph.metadata?.duration?.toString() || "60");
			setTimeZone(currentGraph.metadata?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone);
			setOnlineLink(currentGraph.metadata?.online_link || "");
			setSelectedDays(currentGraph.event_schedule?.[0]?.schedule?.day || []);
			setWeeklyRecurrenceDay(currentGraph.metadata?.recurrence_day || "Monday");
		}
	}, [currentGraph]);

	const handleDayToggle = (dayIndex: number) => {
		setSelectedDays((prev) => 
			prev.includes(dayIndex) 
				? prev.filter((d) => d !== dayIndex)
				: [...prev, dayIndex].sort(),
		);
	};

	const getTimeZones = () => {
		return timezones.filter((tz, index, arr) => arr.indexOf(tz) === index); 
	};

	const formatEndTime = (startTime: string, durationMinutes: string) => {
		if (!startTime || !durationMinutes) return "";
		
		const [hours, minutes] = startTime.split(":").map(Number);
		const totalMinutes = hours * 60 + minutes + parseInt(durationMinutes);
		const endHours = Math.floor(totalMinutes / 60) % 24;
		const endMins = totalMinutes % 60;
		
		// Convert to 12-hour format with AM/PM
		const period = endHours >= 12 ? "PM" : "AM";
		const displayHours = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;
		
		return `${displayHours}:${String(endMins).padStart(2, "0")} ${period}`;
	};

	return (
		<div className="space-y-6">
			{/* Meeting Title */}
			<div className="space-y-2">
				<Input
					className="text-2xl font-semibold border-none px-0 py-2 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
					onChange={(e) => setMeetingName(e.target.value)}
					placeholder="Add title"
					value={meetingName}
				/>
				{/* Meeting Schedule Summary - positioned like a caption */}
				{selectedDays.length > 0 && (
					<div className="text-sm text-gray-600">
						{selectedDays.map((d) => daysOfWeek[d]).join(", ")}
						{time && ` • ${time}`}
						{duration && ` • ${duration === "60" ? "1 hour" : duration === "30" ? "30 min" : duration === "90" ? "1.5 hours" : duration === "120" ? "2 hours" : duration === "180" ? "3 hours" : `${duration} min`}`}
					</div>
				)}
			</div>
			{/* Time and Duration Section */}
			<div className="space-y-3">
				<div className="flex items-center gap-4">
					<Clock className="h-5 w-5 text-gray-600" />
					<div className="flex items-center gap-2 text-sm">
						<Input
							className="h-9 w-20 text-center border-none bg-gray-50 hover:bg-gray-100 focus:bg-white"
							onChange={(e) => setTime(e.target.value)}
							placeholder="Start"
							type="time"
							value={time}
						/>
						<span className="text-gray-500">–</span>
						<div className="h-9 px-3 bg-gray-50 rounded-md flex items-center text-gray-600 text-sm min-w-20 justify-center">
							{formatEndTime(time, duration) || "End"}
						</div>
					</div>
				</div>
				{/* Duration and Timezone */}
				<div className="flex items-center gap-4 ml-9">
					<Select onValueChange={setDuration} value={duration}>
						<SelectTrigger className="w-32 h-8 text-sm border-none bg-gray-50 hover:bg-gray-100">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="15">15 min</SelectItem>
							<SelectItem value="30">30 min</SelectItem>
							<SelectItem value="60">1 hour</SelectItem>
							<SelectItem value="90">1.5 hours</SelectItem>
							<SelectItem value="120">2 hours</SelectItem>
							<SelectItem value="180">3 hours</SelectItem>
						</SelectContent>
					</Select>
					<div className="flex items-center gap-2">
						<Globe className="h-4 w-4 text-gray-600" />
						<Select onValueChange={setTimeZone} value={timeZone}>
							<SelectTrigger className="w-40 h-8 text-sm border-none bg-gray-50 hover:bg-gray-100">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{getTimeZones().map((tz) => (
									<SelectItem key={tz} value={tz}>
										{tz.replace(/_/g, " ")}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
			{/* Repeat Section */}
			<div className="space-y-3">
				<div className="flex items-center gap-4">
					<Repeat className="h-5 w-5 text-gray-600" />
					<Select onValueChange={setFrequency} value={frequency}>
						<SelectTrigger className="w-48 h-9 border-none bg-gray-50 hover:bg-gray-100">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="once">Does not repeat</SelectItem>
							<SelectItem value="daily">Daily</SelectItem>
							<SelectItem value="weekly">Weekly</SelectItem>
							<SelectItem value="monthly">Monthly</SelectItem>
							<SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{/* Day Selection for Weekly/Weekdays */}
				{(frequency === "weekly" || frequency === "weekdays") && (
					<div className="ml-9 space-y-3">
						<div className="flex flex-wrap gap-2">
							{daysOfWeek.map((day, index) => (
								<label 
									className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
										selectedDays.includes(index) 
											? "bg-blue-100 text-blue-700" 
											: "bg-gray-100 hover:bg-gray-200 text-gray-700"
									}`}
									key={day}
								>
									<Checkbox
										checked={selectedDays.includes(index)}
										className="sr-only"
										onCheckedChange={() => handleDayToggle(index)}
									/>
									{day.slice(0, 3)}
								</label>
							))}
						</div>
						<div className="flex gap-2">
							<button
								className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
								onClick={() => setSelectedDays([1, 2, 3, 4, 5])}
								type="button"
							>
								Weekdays
							</button>
							<button
								className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
								onClick={() => setSelectedDays([0, 6])}
								type="button"
							>
								Weekends
							</button>
							<button
								className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
								onClick={() => setSelectedDays([])}
								type="button"
							>
								Clear All
							</button>
						</div>
					</div>
				)}
				{/* Weekly Recurrence Day when no specific days selected */}
				{frequency === "weekly" && selectedDays.length === 0 && (
					<div className="ml-9">
						<Select onValueChange={setWeeklyRecurrenceDay} value={weeklyRecurrenceDay}>
							<SelectTrigger className="w-40 h-8 text-sm border-none bg-gray-50 hover:bg-gray-100">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{daysOfWeek.map((day) => (
									<SelectItem key={day} value={day}>
										{day}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>
			{/* Meeting Link */}
			<div className="space-y-2">
				<div className="flex items-center gap-4">
					<Link className="h-5 w-5 text-gray-600" />
					<Input
						className="border-none bg-gray-50 hover:bg-gray-100 focus:bg-white h-9 max-w-96"
						onChange={(e) => setOnlineLink(e.target.value)}
						placeholder="Add video conferencing link"
						type="url"
						value={onlineLink}
					/>
				</div>
			</div>
			{/* Description */}
			<div className="space-y-2">
				<Textarea
					className="border-none bg-gray-50 hover:bg-gray-100 focus:bg-white min-h-20 resize-none"
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Add description"
					value={description}
				/>
			</div>
		</div>
	);
}; 