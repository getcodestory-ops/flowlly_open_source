import React, { useMemo, useCallback } from "react";
import { Calendar, View } from "react-big-calendar";
import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";
import { dayMapping, localizer } from "./calendar-utils";
import type { GraphData } from "./types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useViewStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";

type ToolbarApi = {
	onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
	onView: (view: string) => void;
	label: string;
	view: string;
};

const CustomToolbar = (toolbar: ToolbarApi): JSX.Element => {
	const goToBack = (): void => {
		toolbar.onNavigate("PREV");
	};

	const goToNext = (): void => {
		toolbar.onNavigate("NEXT");
	};

	const goToCurrent = (): void => {
		toolbar.onNavigate("TODAY");
	};

	return (
		<div className="flex items-center justify-between p-2 bg-background border-b">
			<div className="space-x-2">
				<Button
					onClick={goToBack}
					size="sm"
					variant="outline"
				>
          Back
				</Button>
				<Button
					onClick={goToCurrent}
					size="sm"
					variant="outline"
				>
          Today
				</Button>
				<Button
					onClick={goToNext}
					size="sm"
					variant="outline"
				>
          Next
				</Button>
			</div>
			<div className="text-sm font-medium">{toolbar.label}</div>
			<div className="space-x-2">
				{["month", "week", "day", "agenda"].map((viewOption) => (
					<Button
						className="capitalize"
						key={viewOption}
						onClick={() => toolbar.onView(viewOption)}
						size="sm"
						variant={toolbar.view === viewOption ? "default" : "ghost"}
					>
						{viewOption}
					</Button>
				))}
			</div>
		</div>
	);
};

export const CalendarView: React.FC = ({
}) => {
	const { graphs, setCurrentGraphId } = useWorkflow();
	const onSelectGraph = (id: string): void => {
		setCurrentGraphId(id);
	};
	const { calendarView, setCalendarView, calendarDate, setCalendarDate } = useViewStore();
	const date = useMemo(() => new Date(calendarDate), [calendarDate]);

	const extractHoursMinutes = useCallback((timeString?: string): { hours: number; minutes: number } => {
		if (!timeString) {
			return { hours: 0, minutes: 0 };
		}
		if (timeString.includes("T")) {
			const hasZone = /Z|[+-]\d\d:\d\d$/.test(timeString);
			const iso = hasZone ? timeString : `${timeString}Z`;
			const parsed = new Date(iso);
			if (!Number.isNaN(parsed.getTime())) {
				return { hours: parsed.getHours(), minutes: parsed.getMinutes() };
			}
			const rawTime = timeString.split("T")[1]?.replace("Z", "") || "00:00";
			const [hh, mm] = rawTime.split(":");
			return { hours: parseInt(hh || "0"), minutes: parseInt(mm || "0") };
		}
		const [hh, mm] = timeString.split(":");
		return { hours: parseInt(hh || "0"), minutes: parseInt(mm || "0") };
	}, []);

	const formatLocalTime = useCallback((date: Date): string => {
		try {
			return new Intl.DateTimeFormat(undefined, {
				hour: "numeric",
				minute: "2-digit",
			}).format(date);
		} catch {
			return date.toLocaleTimeString();
		}
	}, []);

type RbcEvent = {
  id: string;
  title: React.ReactNode;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: GraphData;
};

const generateRecurringEvents = useCallback((graph: GraphData): RbcEvent[] => {
	const events = [];
	const firstSchedule = graph.event_schedule?.[0];
	const scheduleStart = firstSchedule?.schedule?.start;
	const scheduleTime = firstSchedule?.schedule?.time as Record<string, unknown> | Array<Record<string, unknown>>;
	const scheduleRunTime = Array.isArray(scheduleTime) ? scheduleTime?.[0]?.run_time : scheduleTime?.run_time;
	const meetingTime = scheduleRunTime || graph.metadata.time;
	
	// Check for Microsoft recurrence structure
	const msRecurrence = firstSchedule?.schedule?.recurrence;
	
	// Determine date range
	let startDate: Date;
	let endDate: Date;
	
	if (msRecurrence?.range) {
		startDate = new Date(msRecurrence.range.startDate);
		if (msRecurrence.range.type === "endDate" && msRecurrence.range.endDate) {
			endDate = new Date(msRecurrence.range.endDate);
		} else if (msRecurrence.range.type === "numbered" && msRecurrence.range.numberOfOccurrences) {
			// Calculate end date based on number of occurrences
			endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + (msRecurrence.range.numberOfOccurrences * 7)); // rough estimate
		} else {
			// No end date - limit to 1 year for display
			endDate = new Date(startDate);
			endDate.setFullYear(endDate.getFullYear() + 1);
		}
	} else {
		startDate = new Date(graph.created_at);
		endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 84);
	}

	// Determine frequency and days
	let frequency: string;
	let meetingDays: string[];
	let interval = 1;
	
	if (msRecurrence?.pattern) {
		frequency = msRecurrence.pattern.type;
		interval = msRecurrence.pattern.interval || 1;
		meetingDays = msRecurrence.pattern.daysOfWeek?.map((day) => day.toLowerCase()) || [];
	} else {
		frequency = graph.metadata.frequency || "once";
		const recurrenceDay = graph.metadata.recurrence_day;
		meetingDays = Array.isArray(recurrenceDay) 
			? recurrenceDay.map((day) => day.toLowerCase()) 
			: recurrenceDay 
				? [recurrenceDay.toLowerCase()] 
				: [];
	}

	// Get exceptions from the schedule
	const exceptions = (firstSchedule?.schedule as Record<string, unknown>)?.exceptions as Array<Record<string, unknown>> || [];
	const exceptionMap = new Map();
	
	// Build a map of original occurrence times to exceptions
	exceptions.forEach((exception: Record<string, unknown>) => {
		if (exception.original_occurrence_time) {
			const originalDate = new Date(exception.original_occurrence_time as string);
			const dateKey = originalDate.toISOString().split("T")[0];
			exceptionMap.set(dateKey, exception);
		}
	});

	if (frequency === "weekly" && meetingDays.length > 0 && meetingTime) {
		// Iterate through each meeting day
		meetingDays.forEach((meetingDay) => {
			let currentDate = new Date(startDate);
			currentDate.setDate(
				currentDate.getDate() +
					((dayMapping[meetingDay as keyof typeof dayMapping] + 7 - currentDate.getDay()) % 7),
			);
			// const { hours, minutes } = extractHoursMinutes(meetingTime);

			while (currentDate <= endDate) {
				const baseDateStr = currentDate.toISOString().split("T")[0];
				const exception = exceptionMap.get(baseDateStr);

				// Check if this occurrence has an exception
				if (exception) {
					// Handle different exception types
					if (exception.exception_type === "moved" && exception.new_start_time && exception.new_end_time) {
						// For moved meetings, show the event at the new time
						const exceptionStart = new Date(exception.new_start_time);
						const exceptionEnd = new Date(exception.new_end_time);

						events.push({
							id: `${graph.id}-${currentDate.toISOString()}-exception`,
							title: (
								<div className="flex items-center gap-2 text-xs font-light">
									{graph.name}
								</div>
							),
							start: exceptionStart,
							end: exceptionEnd,
							allDay: false,
							resource: graph,
						});
					} else if (exception.exception_type === "cancelled") {
						// For cancelled meetings, skip adding the event
						// You could also show a strikethrough version if desired
					}
					// Skip to next occurrence
					currentDate = new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
					continue;
				}

				// Regular occurrence (no exception)
				// Compose UTC ISO from the week's date and meeting time, then convert to local
				let iso: string;
				if (typeof meetingTime === "string" && meetingTime.includes("T")) {
					const hasZone = /Z|[+-]\d\d:\d\d$/.test(meetingTime);
					iso = hasZone ? meetingTime : `${meetingTime}Z`;
				} else {
					const norm = ((): string => {
						const input = String(meetingTime || "00:00").trim();
						if (input.includes("T")) return input;
						const ampm = input.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])\s*$/);
						if (ampm) {
							let hh = parseInt(ampm[1] || "0", 10);
							const mm = parseInt(ampm[2] || "0", 10);
							const ss = parseInt(ampm[3] || "0", 10);
							const ap = ampm[4].toUpperCase();
							if (ap === "PM" && hh < 12) hh += 12;
							if (ap === "AM" && hh === 12) hh = 0;
							const hhS = String(Math.max(0, Math.min(23, hh))).padStart(2, "0");
							const mmS = String(Math.max(0, Math.min(59, mm))).padStart(2, "0");
							const ssS = String(Math.max(0, Math.min(59, ss))).padStart(2, "0");
							return `${hhS}:${mmS}:${ssS}`;
						}
						const h24 = input.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/);
						if (h24) {
							const hh = String(Math.max(0, Math.min(23, parseInt(h24[1] || "0", 10)))).padStart(2, "0");
							const mm = String(Math.max(0, Math.min(59, parseInt(h24[2] || "0", 10)))).padStart(2, "0");
							const ss = String(Math.max(0, Math.min(59, parseInt(h24[3] || "0", 10)))).padStart(2, "0");
							return `${hh}:${mm}:${ss}`;
						}
						return "00:00:00";
					})();
					iso = `${baseDateStr}T${norm}Z`;
				}
				const eventStart = new Date(iso);
				const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

				events.push({
					id: `${graph.id}-${currentDate.toISOString()}-${meetingDay}`,
					title: (
						<div className="flex items-center gap-2 text-xs font-light">
							{graph.name}
						</div>
					),
					start: eventStart,
					end: eventEnd,
					allDay: false,
					resource: graph,
				});

				currentDate = new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
			}
		});
	} else if (frequency === "daily" && meetingTime) {
		// Daily recurring events
		let currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			const baseDateStr = currentDate.toISOString().split("T")[0];
			const exception = exceptionMap.get(baseDateStr);

			// Check if this occurrence has an exception
			if (exception) {
				// Handle different exception types
				if (exception.exception_type === "moved" && exception.new_start_time && exception.new_end_time) {
					// For moved meetings, show the event at the new time
					const exceptionStart = new Date(exception.new_start_time);
					const exceptionEnd = new Date(exception.new_end_time);

					events.push({
						id: `${graph.id}-${currentDate.toISOString()}-exception`,
						title: (
							<div className="flex items-center gap-2 text-xs font-light">
								{graph.name}
							</div>
						),
						start: exceptionStart,
						end: exceptionEnd,
						allDay: false,
						resource: graph,
					});
				} else if (exception.exception_type === "cancelled") {
					// For cancelled meetings, skip adding the event
				}
				// Skip to next occurrence
				currentDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
				continue;
			}

			// Regular occurrence (no exception)
			let iso: string;
			if (typeof meetingTime === "string" && meetingTime.includes("T")) {
				const hasZone = /Z|[+-]\d\d:\d\d$/.test(meetingTime);
				iso = hasZone ? meetingTime : `${meetingTime}Z`;
			} else {
				const norm = ((): string => {
					const input = String(meetingTime || "00:00").trim();
					if (input.includes("T")) return input;
					const ampm = input.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])\s*$/);
					if (ampm) {
						let hh = parseInt(ampm[1] || "0", 10);
						const mm = parseInt(ampm[2] || "0", 10);
						const ss = parseInt(ampm[3] || "0", 10);
						const ap = ampm[4].toUpperCase();
						if (ap === "PM" && hh < 12) hh += 12;
						if (ap === "AM" && hh === 12) hh = 0;
						const hhS = String(Math.max(0, Math.min(23, hh))).padStart(2, "0");
						const mmS = String(Math.max(0, Math.min(59, mm))).padStart(2, "0");
						const ssS = String(Math.max(0, Math.min(59, ss))).padStart(2, "0");
						return `${hhS}:${mmS}:${ssS}`;
					}
					const h24 = input.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/);
					if (h24) {
						const hh = String(Math.max(0, Math.min(23, parseInt(h24[1] || "0", 10)))).padStart(2, "0");
						const mm = String(Math.max(0, Math.min(59, parseInt(h24[2] || "0", 10)))).padStart(2, "0");
						const ss = String(Math.max(0, Math.min(59, parseInt(h24[3] || "0", 10)))).padStart(2, "0");
						return `${hh}:${mm}:${ss}`;
					}
					return "00:00:00";
				})();
				iso = `${baseDateStr}T${norm}Z`;
			}
			const eventStart = new Date(iso);
			const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

			events.push({
				id: `${graph.id}-${currentDate.toISOString()}`,
				title: (
					<div className="flex items-center gap-2 text-xs font-bold">
						{graph.event_type === "document_writing" ? (
							<FileText size={14} />
						) : (
							<Video size={14} />
						)}
						<span className="text-xs  font-light">{formatLocalTime(eventStart)}</span>
						{graph.name}
					</div>
				),
				start: eventStart,
				end: eventEnd,
				allDay: false,
				resource: graph,
			});

			currentDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
		}
	} else if (frequency === "once") {
		const timeString = String(meetingTime || "");
		let eventStart: Date;

		if (timeString && timeString.includes("T")) {
			const hasZone = /Z|[+-]\d\d:\d\d$/.test(timeString);
			const iso = hasZone ? timeString : `${timeString}Z`;
			const parsed = new Date(iso);
			if (!Number.isNaN(parsed.getTime())) {
				eventStart = parsed;
			} else {
				const datePart = timeString.split("T")[0];
				const dateParsed = new Date(datePart);
				eventStart = Number.isNaN(dateParsed.getTime()) ? new Date(startDate) : dateParsed;
				const { hours, minutes } = extractHoursMinutes(timeString);
				eventStart.setHours(hours, minutes);
			}
		} else {
			// Time-only: prefer schedule.start's date if available; otherwise fallback to created_at
			const baseDateStr = scheduleStart ? scheduleStart.split("T")[0] : startDate.toISOString().split("T")[0];
			const iso = `${baseDateStr}T${timeString || "00:00"}Z`;
			eventStart = new Date(iso);
		}

		const eventEnd = new Date(eventStart);
		eventEnd.setHours(eventEnd.getHours() + 1);

		events.push({
			id: graph.id,
			title: (
				<div className="flex items-center gap-2 text-xs font-light">
					{graph.name}
				</div>
			),
			start: eventStart,
			end: eventEnd,
			allDay: false,
			resource: graph,
		});
	}

	return events;
}, [extractHoursMinutes, formatLocalTime]);

const events = useMemo(() => {
	if (!graphs) {
		return [];
	}
	return graphs.flatMap(generateRecurringEvents);
}, [graphs, generateRecurringEvents]);

	type CalendarEvent = { resource: GraphData };
	const handleSelectEvent = (event: CalendarEvent): void => {
		const eventResult = event.resource;
		onSelectGraph(eventResult.id);
	};

	const eventPropGetter = (_event: { resource: GraphData }): { style: React.CSSProperties } => ({
		style: {
			backgroundColor: "#fef08a",
			color: "black",
			padding: "4px 8px",
			borderRadius: "4px",
			display: "flex",
			alignItems: "center",
			gap: "4px",
			fontWeight: "bold",
			fontSize: "0.75rem",
			border: "none",
			outline: "none",
		},
	});

	const formats = {
		eventTimeRangeFormat: () => "",
	};

	return (
		<div style={{ height: "700px" }}>
			<Calendar
				components={{
					toolbar: CustomToolbar,
				}}
				date={date}
				endAccessor="end"
				eventPropGetter={eventPropGetter}
				events={events}
				formats={formats}
				localizer={localizer}
				onNavigate={(date: Date) => setCalendarDate(date)}
				onSelectEvent={handleSelectEvent}
				onView={setCalendarView}
				startAccessor="start"
				style={{ height: "100%" }}
				view={calendarView as View}
				views={["month", "week", "day", "agenda"]}
			/>
		</div>
	);
};
