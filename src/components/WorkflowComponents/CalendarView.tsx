import React, { useMemo, useCallback, useState } from "react";
import { Calendar, View } from "react-big-calendar";
import { Button } from "@/components/ui/button";
import { FileText, Video, PencilIcon, ExternalLink } from "lucide-react";
import { dayMapping, localizer } from "./calendar-utils";
import type { GraphData } from "./types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useViewStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import { fromZonedTime } from "date-fns-tz";

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

interface CalendarViewProps {
	onEditEvent?: (eventData: GraphData) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
	onEditEvent,
}) => {
	const { graphs, setCurrentGraphId } = useWorkflow();
	const onSelectGraph = (id: string): void => {
		setCurrentGraphId(id);
	};
	const { calendarView, setCalendarView } = useViewStore();
	const [date, setDate] = useState(new Date());
	const [tooltip, setTooltip] = useState<{ event: GraphData; x: number; y: number } | null>(null);
	const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	// Cleanup timeout on unmount
	React.useEffect(() => {
		return () => {
			if (tooltipTimeoutRef.current) {
				clearTimeout(tooltipTimeoutRef.current);
			}
		};
	}, []);

	// Helper to interpret local time string in a specific timezone and return UTC Date
	// fromZonedTime takes a date in a specific timezone and returns the equivalent UTC date
	const zonedToUtc = (dateInput: string, tz: string): Date => {
		// Parse the date string as if it's in the target timezone
		const localDate = new Date(dateInput);
		// Convert from that timezone to UTC
		return fromZonedTime(localDate, tz);
	};

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

	// Resolve event timezone (prefer IANA if provided; map common Windows timezones otherwise)
	const windowsToIana: Record<string, string> = {
		"Pacific Standard Time": "America/Los_Angeles",
		"Eastern Standard Time": "America/New_York",
		"Central Standard Time": "America/Chicago",
		"Mountain Standard Time": "America/Denver",
		"India Standard Time": "Asia/Kolkata",
	};
	const rawTz = (firstSchedule?.schedule as Record<string, unknown>)?.time_zone as string | undefined;
	const recurrenceTzValue = (firstSchedule as unknown as { schedule?: { recurrence?: { range?: { recurrenceTimeZone?: string } } } })?.schedule?.recurrence?.range?.recurrenceTimeZone;
	const eventTimeZone = rawTz || (recurrenceTzValue ? (windowsToIana[recurrenceTzValue] || recurrenceTzValue) : undefined);
	
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
					((dayMapping[meetingDay as keyof typeof dayMapping] + 7 - currentDate.getUTCDay()) % 7),
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
				// Build event start by interpreting run_time in the event's timezone on the base date
				const norm = ((): string => {
					const input = String(meetingTime || "00:00").trim();
					const extractTime = (val: string): string => {
						const timePart = val.includes("T") ? val.split("T")[1]?.replace(/Z|[+-]\d\d:\d\d$/, "") || "00:00:00" : val;
						const ampm = timePart.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])\s*$/);
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
						const h24 = timePart.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/);
						if (h24) {
							const hh = String(Math.max(0, Math.min(23, parseInt(h24[1] || "0", 10)))).padStart(2, "0");
							const mm = String(Math.max(0, Math.min(59, parseInt(h24[2] || "0", 10)))).padStart(2, "0");
							const ss = String(Math.max(0, Math.min(59, parseInt(h24[3] || "0", 10)))).padStart(2, "0");
							return `${hh}:${mm}:${ss}`;
						}
						return "00:00:00";
					};
					return extractTime(input);
				})();
				let eventStart: Date;
				if (eventTimeZone) {
					// Interpret the local time in the event's timezone on baseDate
					eventStart = zonedToUtc(`${baseDateStr} ${norm}`, eventTimeZone);
				} else {
					// Fallback: assume the time is UTC
					eventStart = new Date(`${baseDateStr}T${norm}Z`);
				}
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
							<div className="flex items-center gap-2">
								{graph.event_type === "document_writing" ? (
									<FileText size={14} />
								) : (
									<Video size={14} />
								)}
								{graph.name}
								<span className="text-xs opacity-80">{formatLocalTime(exceptionStart)}</span>
								<span className="text-xs bg-orange-100 text-orange-700 px-1 rounded">Moved</span>
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
			const norm = ((): string => {
				const input = String(meetingTime || "00:00").trim();
				const extractTime = (val: string): string => {
					const timePart = val.includes("T") ? val.split("T")[1]?.replace(/Z|[+-]\d\d:\d\d$/, "") || "00:00:00" : val;
					const ampm = timePart.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])\s*$/);
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
					const h24 = timePart.match(/^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/);
					if (h24) {
						const hh = String(Math.max(0, Math.min(23, parseInt(h24[1] || "0", 10)))).padStart(2, "0");
						const mm = String(Math.max(0, Math.min(59, parseInt(h24[2] || "0", 10)))).padStart(2, "0");
						const ss = String(Math.max(0, Math.min(59, parseInt(h24[3] || "0", 10)))).padStart(2, "0");
						return `${hh}:${mm}:${ss}`;
					}
					return "00:00:00";
				};
				return extractTime(input);
			})();
			let eventStart: Date;
			if (eventTimeZone) {
				eventStart = zonedToUtc(`${baseDateStr} ${norm}`, eventTimeZone);
			} else {
				eventStart = new Date(`${baseDateStr}T${norm}Z`);
			}
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
						{graph.name}
						<span className="text-xs opacity-80">{formatLocalTime(eventStart)}</span>
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
			if (hasZone) {
				eventStart = new Date(timeString);
			} else if (eventTimeZone) {
				// Interpret provided local datetime in the event's timezone
				eventStart = zonedToUtc(timeString.replace("T", " "), eventTimeZone);
			} else {
				// Assume UTC
				eventStart = new Date(`${timeString}Z`);
			}
		} else {
			// Time-only: prefer schedule.start's date if available; otherwise fallback to created_at
			const baseDateStr = scheduleStart ? scheduleStart.split("T")[0] : startDate.toISOString().split("T")[0];
			if (eventTimeZone) {
				eventStart = zonedToUtc(`${baseDateStr} ${timeString || "00:00"}`, eventTimeZone);
			} else {
				eventStart = new Date(`${baseDateStr}T${timeString || "00:00"}Z`);
			}
		}

		const eventEnd = new Date(eventStart);
		eventEnd.setHours(eventEnd.getHours() + 1);

		events.push({
			id: graph.id,
			title: (
				<div className="flex items-center gap-2">
					{graph.event_type === "document_writing" ? (
						<FileText size={14} />
					) : (
						<Video size={14} />
					)}
					{graph.name}
					<span className="text-xs opacity-80">{formatLocalTime(eventStart)}</span>
				</div>
			),
			start: eventStart,
			end: eventEnd,
			allDay: false,
			resource: graph,
		});
	}

	return events;
}, [formatLocalTime]);

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

	const eventPropGetter = (event: { resource: GraphData }): { style: React.CSSProperties } => ({
		style: {
			backgroundColor:
        event.resource.event_type === "document_writing"
        	? "#22c55e"
        	: "#fef08a",
			color:
        event.resource.event_type === "document_writing" ? "white" : "black",
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

	const EventComponent = ({ event }: { event: RbcEvent }): JSX.Element => {
		const handleMouseEnter = (e: React.MouseEvent): void => {
			// Clear any pending close timeout
			if (tooltipTimeoutRef.current) {
				clearTimeout(tooltipTimeoutRef.current);
				tooltipTimeoutRef.current = null;
			}
			
			const rect = e.currentTarget.getBoundingClientRect();
			setTooltip({
				event: event.resource,
				x: rect.left + rect.width / 2,
				y: rect.top - 5,
			});
		};
		
		const handleMouseLeave = (): void => {
			// Delay closing the tooltip to allow mouse to move to it
			tooltipTimeoutRef.current = setTimeout(() => {
				setTooltip(null);
			}, 100); // 100ms delay
		};
		
		return (
			<div 
				className="flex items-center gap-1 w-full h-full overflow-hidden cursor-pointer"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{event.resource.event_type === "document_writing" ? (
					<FileText className="flex-shrink-0" size={12} />
				) : (
					<Video className="flex-shrink-0" size={12} />
				)}
				<span className="text-xs font-medium truncate">{event.resource.name}</span>
				<span className="text-xs opacity-70 flex-shrink-0">{formatLocalTime(event.start)}</span>
			</div>
		);
	};

	return (
		<div style={{ height: "700px", position: "relative" }}>
			<Calendar
				components={{
					day: {
						event: EventComponent,
					},
					event: EventComponent,
					month: {
						event: EventComponent,
					},
					toolbar: CustomToolbar,
					week: {
						event: EventComponent,
					},
				}}
				date={date}
				endAccessor="end"
				eventPropGetter={eventPropGetter}
				events={events}
				formats={{
					eventTimeRangeFormat: () => "",
					timeGutterFormat: (date: Date) => formatLocalTime(date),
				}}
				localizer={localizer}
				onNavigate={setDate}
				onSelectEvent={handleSelectEvent}
				onView={setCalendarView}
				startAccessor="start"
				style={{ height: "100%" }}
				view={calendarView as View}
				views={["month", "week", "day", "agenda"]}
			/>
			{tooltip && (
				<div
					className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
					onMouseEnter={() => {
						// Clear any pending close timeout when entering tooltip
						if (tooltipTimeoutRef.current) {
							clearTimeout(tooltipTimeoutRef.current);
							tooltipTimeoutRef.current = null;
						}
					}}
					onMouseLeave={() => {
						// Close tooltip when leaving it
						tooltipTimeoutRef.current = setTimeout(() => {
							setTooltip(null);
						}, 100);
					}}
					style={{
						left: tooltip.x,
						top: tooltip.y,
						transform: "translateX(-50%) translateY(-100%) translateY(-8px)",
					}}
				>
					<div className="flex items-center gap-4 px-3 py-2">
						{/* Event Name */}
						<div className="flex items-center gap-2">
							{tooltip.event.event_type === "document_writing" ? (
								<FileText className="flex-shrink-0" size={14} />
							) : (
								<Video className="flex-shrink-0" size={14} />
							)}
							<span className="font-medium text-gray-900 truncate">{tooltip.event.name}</span>
						</div>
						{/* Separator */}
						<div className="h-6 w-px bg-gray-300" />
						{/* Action Buttons */}
						<div className="flex items-center gap-2">
							{onEditEvent && ["meeting", "document_writing", "custom"].includes(tooltip.event.event_type) && (
								<Button
									className="h-8 px-2 text-blue-600 hover:bg-blue-50"
									onClick={(e) => {
										e.stopPropagation();
										onEditEvent(tooltip.event);
										setTooltip(null);
									}}
									size="sm"
									variant="ghost"
								>
									<PencilIcon className="mr-1 h-4 w-4" />
									Edit
								</Button>
							)}
							<Button
								className="h-8 px-2 text-green-600 hover:bg-green-50"
								onClick={(e) => {
									e.stopPropagation();
									onSelectGraph(tooltip.event.id);
									setTooltip(null);
								}}
								size="sm"
								variant="ghost"
							>
								<ExternalLink className="mr-1 h-4 w-4" />
								Open
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
