import React, { useState, useEffect, useMemo } from "react";
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
		Intl.DateTimeFormat().resolvedOptions().timeZone,
	);
	const [onlineLink, setOnlineLink] = useState(currentGraph?.metadata?.online_link || "");
	const [selectedDays, setSelectedDays] = useState<number[]>(
		currentGraph?.event_schedule?.[0]?.schedule?.day || [],
	);
	const [weeklyRecurrenceDay, setWeeklyRecurrenceDay] = useState<string[]>(() => {
		const recDay = currentGraph?.metadata?.recurrence_day;
		if (Array.isArray(recDay)) return recDay;
		if (recDay) return [recDay];
		return ["Monday"];
	});

	// Update state when currentGraph changes
	useEffect(() => {
		if (currentGraph) {
			setMeetingName(currentGraph.name || "");
			setDescription(currentGraph.description || "");
			setFrequency(currentGraph.metadata?.frequency || "weekly");
			{
				const firstSchedule = currentGraph.event_schedule?.[0];
				const scheduleStart = firstSchedule?.schedule?.start;
				const scheduleTime = firstSchedule?.schedule?.time as any;
				const scheduleRunTime = Array.isArray(scheduleTime) ? scheduleTime?.[0]?.run_time : scheduleTime?.run_time;
				let localHHmm: string | null = null;
				if (scheduleStart && scheduleRunTime) {
					let iso: string;
					if (scheduleRunTime.includes("T")) {
						const hasZone = /Z|[+-]\d\d:\d\d$/.test(scheduleRunTime);
						iso = hasZone ? scheduleRunTime : `${scheduleRunTime}Z`;
					} else {
						const baseDateStr = extractDatePart(scheduleStart);
						const norm = normalizeTimeString(scheduleRunTime);
						iso = baseDateStr && norm ? `${baseDateStr}T${norm}Z` : "";
					}
					if (iso) {
						const d = new Date(iso);
						if (!Number.isNaN(d.getTime())) {
							const hh = String(d.getHours()).padStart(2, "0");
							const mm = String(d.getMinutes()).padStart(2, "0");
							localHHmm = `${hh}:${mm}`;
						}
					}
				}
				if (!localHHmm) {
					const raw = currentGraph.metadata?.time || "";
					if (raw.includes("T")) {
						const hasZone = /Z|[+-]\d\d:\d\d$/.test(raw);
						const iso = hasZone ? raw : `${raw}Z`;
						const d = new Date(iso);
						if (!Number.isNaN(d.getTime())) {
							const hh = String(d.getHours()).padStart(2, "0");
							const mm = String(d.getMinutes()).padStart(2, "0");
							localHHmm = `${hh}:${mm}`;
						}
					} else {
						const norm = normalizeTimeString(raw);
						localHHmm = norm ? `${norm.split(":")[0]}:${norm.split(":")[1]}` : null;
					}
				}
				// Final fallback: use currentGraph.run_time if present
				if (!localHHmm && currentGraph.run_time) {
					const grt = currentGraph.run_time as string;
					const hasZone = /Z|[+-]\d\d:\d\d$/.test(grt);
					const iso = grt.includes("T") ? (hasZone ? grt : `${grt}Z`) : null;
					if (iso) {
						const d = new Date(iso);
						if (!Number.isNaN(d.getTime())) {
							const hh = String(d.getHours()).padStart(2, "0");
							const mm = String(d.getMinutes()).padStart(2, "0");
							localHHmm = `${hh}:${mm}`;
						}
					}
				}
				setTime(localHHmm || "");
			}
			setDuration(currentGraph.metadata?.duration?.toString() || "60");
			setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
			setOnlineLink(currentGraph.metadata?.online_link || "");
			setSelectedDays(currentGraph.event_schedule?.[0]?.schedule?.day || []);
			
			// Handle recurrence_day as either string or string[]
			const recDay = currentGraph.metadata?.recurrence_day;
			if (Array.isArray(recDay)) {
				setWeeklyRecurrenceDay(recDay);
			} else if (recDay) {
				setWeeklyRecurrenceDay([recDay]);
			} else {
				setWeeklyRecurrenceDay(["Monday"]);
			}
		}
	}, [currentGraph]);

	// Normalize various time formats to 24h HH:mm:ss (time-only) or return as-is if ISO with 'T'
	const normalizeTimeString = (val: string): string | null => {
		if (!val) return null;
		const input = val.trim();
		// If it's ISO-like, leave it (handled separately)
		if (input.includes("T")) return input;
		// 12-hour format e.g. 8:00 PM or 08:00:30 pm
		const ampmMatch = input.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])\s*$/);
		if (ampmMatch) {
			let hh = parseInt(ampmMatch[1] || "0", 10);
			const mm = parseInt(ampmMatch[2] || "0", 10);
			const ss = parseInt(ampmMatch[3] || "0", 10);
			const ap = ampmMatch[4].toUpperCase();
			if (ap === "PM" && hh < 12) hh += 12;
			if (ap === "AM" && hh === 12) hh = 0;
			const hhS = String(Math.max(0, Math.min(23, hh))).padStart(2, "0");
			const mmS = String(Math.max(0, Math.min(59, mm))).padStart(2, "0");
			const ssS = String(Math.max(0, Math.min(59, ss))).padStart(2, "0");
			return `${hhS}:${mmS}:${ssS}`;
		}
		// 24-hour HH:mm or HH:mm:ss
		const h24Match = input.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/);
		if (h24Match) {
			const hh = String(Math.max(0, Math.min(23, parseInt(h24Match[1] || "0", 10)))).padStart(2, "0");
			const mm = String(Math.max(0, Math.min(59, parseInt(h24Match[2] || "0", 10)))).padStart(2, "0");
			const ss = String(Math.max(0, Math.min(59, parseInt(h24Match[3] || "0", 10)))).padStart(2, "0");
			return `${hh}:${mm}:${ss}`;
		}
		return null;
	};

	// Extract YYYY-MM-DD from a date or datetime string
	const extractDatePart = (val?: string): string | null => {
		if (!val) return null;
		const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
		return m ? m[1] : null;
	};

	// Compute a local display datetime based on schedule.start + schedule.time.run_time when available
	const formattedMeetingDateTime = useMemo(() => {
		if (!currentGraph) return "";
		const firstSchedule = currentGraph.event_schedule?.[0];
		const scheduleStart = firstSchedule?.schedule?.start;
		const scheduleTime = firstSchedule?.schedule?.time as any;
		const scheduleRunTime = Array.isArray(scheduleTime) ? scheduleTime?.[0]?.run_time : scheduleTime?.run_time;

		// Prefer the explicit schedule start date + run_time
		if (scheduleStart && scheduleRunTime) {
			let iso: string;
			if (scheduleRunTime.includes("T")) {
				const hasZone = /Z|[+-]\d\d:\d\d$/.test(scheduleRunTime);
				iso = hasZone ? scheduleRunTime : `${scheduleRunTime}Z`;
			} else {
				const baseDateStr = extractDatePart(scheduleStart);
				const norm = normalizeTimeString(scheduleRunTime);
				if (!norm) return "";
				if (!baseDateStr) return "";
				iso = `${baseDateStr}T${norm}Z`;
			}
			const d = new Date(iso);
			if (!Number.isNaN(d.getTime())) {
				return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
			}
		}

		// Fallbacks: use graph.run_time or metadata.time
		const rt = (currentGraph.run_time as string | undefined) || (currentGraph.metadata?.time as string | undefined);
		if (!rt) return "";
		if (rt.includes("T")) {
			const hasZone = /Z|[+-]\d\d:\d\d$/.test(rt);
			const iso = hasZone ? rt : `${rt}Z`;
			const d = new Date(iso);
			return Number.isNaN(d.getTime()) ? "" : d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
		}
		const baseDateStr = extractDatePart(scheduleStart || currentGraph.created_at || new Date().toISOString());
		if (!baseDateStr) return "";
		const norm = normalizeTimeString(rt);
		if (!norm) return "";
		const d = new Date(`${baseDateStr}T${norm}Z`);
		return Number.isNaN(d.getTime()) ? "" : d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
	}, [currentGraph]);

	// Derive day label: prefer schedule.start's weekday (local), else selectedDays, else weeklyRecurrenceDay
	const dayLabel = useMemo(() => {
		const firstSchedule = currentGraph?.event_schedule?.[0];
		const scheduleStart = firstSchedule?.schedule?.start;
		if (scheduleStart) {
			const datePart = extractDatePart(scheduleStart);
			if (datePart) {
				const d = new Date(`${datePart}T00:00:00Z`);
				if (!Number.isNaN(d.getTime())) {
					return daysOfWeek[d.getUTCDay()];
				}
			}
		}
		if (selectedDays.length > 0) return selectedDays.map((idx) => daysOfWeek[idx]).join(", ");
		if (weeklyRecurrenceDay.length > 0) return weeklyRecurrenceDay.join(", ");
		return "";
	}, [currentGraph, selectedDays, weeklyRecurrenceDay]);

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
		const norm = normalizeTimeString(startTime);
		if (!norm) return "";
		const parts = norm.split(":");
		const hours = parseInt(parts[0] || "0", 10);
		const minutes = parseInt(parts[1] || "0", 10);
		const totalMinutes = hours * 60 + minutes + parseInt(durationMinutes, 10);
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
				<div className="text-sm text-gray-600">
					{dayLabel}
					{formattedMeetingDateTime && ` • ${formattedMeetingDateTime}`}
					{duration && ` • ${duration === "60" ? "1 hour" : duration === "30" ? "30 min" : duration === "90" ? "1.5 hours" : duration === "120" ? "2 hours" : duration === "180" ? "3 hours" : `${duration} min`}`}
				</div>
			</div>
			{/* Time and Duration Section */}
			<div className="space-y-3">
				<div className="flex items-center gap-4 ">
					<Clock className="h-5 w-5 text-gray-600" />
					<div className="flex items-center gap-2 text-sm ">
						<Input
							className="h-9  text-center border-none bg-gray-50 hover:bg-gray-100 focus:bg-white"
							onChange={(e) => setTime(e.target.value)}
							placeholder="Start"
							type="time"
							value={time}
						/>
						<span className="text-gray-500">–</span>
						<div className="h-9 flex items-center justify-center text-center min-w-20 rounded-md bg-gray-50 hover:bg-gray-100 focus:bg-white">
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
				{( frequency === "weekdays") && (
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
				{/* Weekly Recurrence Days */}
				{frequency === "weekly" && (
					<div className="ml-9 space-y-3">
						<div className="flex flex-wrap gap-2">
							{daysOfWeek.map((day, index) => (
								<label 
									className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
										weeklyRecurrenceDay.includes(day) 
											? "bg-blue-100 text-blue-700" 
											: "bg-gray-100 hover:bg-gray-200 text-gray-700"
									}`}
									key={day}
								>
									<Checkbox
										checked={weeklyRecurrenceDay.includes(day)}
										className="sr-only"
										onCheckedChange={() => {
											setWeeklyRecurrenceDay((prev) => 
												prev.includes(day)
													? prev.filter((d) => d !== day)
													: [...prev, day],
											);
										}}
									/>
									{day.slice(0, 3)}
								</label>
							))}
						</div>
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