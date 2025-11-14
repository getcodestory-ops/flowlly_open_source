import { GraphData } from "../WorkflowComponents/types";
import { RbcEvent } from "@/types/calendar";
import { dayMapping } from "./calendar-utils";
import { fromZonedTime } from "date-fns-tz";

const WINDOWS_TO_IANA: Record<string, string> = {
	"Pacific Standard Time": "America/Los_Angeles",
	"Eastern Standard Time": "America/New_York",
	"Central Standard Time": "America/Chicago",
	"Mountain Standard Time": "America/Denver",
	"India Standard Time": "Asia/Kolkata",
};

interface ScheduleMetadata {
	meetingTime: string | undefined;
	eventTimeZone: string | undefined;
	frequency: string;
	meetingDays: string[];
	interval: number;
	exceptionMap: Map<string, Record<string, unknown>>;
	scheduleStart: string | undefined;
}


const zonedToUtc = (dateInput: string, tz: string): Date => {
	const localDate = new Date(dateInput);
	return fromZonedTime(localDate, tz);
};

const normalizeTimeString = (meetingTime: string | undefined): string => {
	const input = String(meetingTime || "00:00").trim();
	
	const extractTime = (val: string): string => {
		const timePart = val.includes("T") 
			? val.split("T")[1]?.replace(/Z|[+-]\d\d:\d\d$/, "") || "00:00:00" 
			: val;
		
		// Handle AM/PM format
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
		
		// Handle 24-hour format
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
};

const parseDateTime = (
	timeStr: string,
	baseDateStr: string,
	timezone: string | undefined
): Date => {
	if (timeStr.includes("T")) {
		const hasZone = /Z|[+-]\d\d:\d\d$/.test(timeStr);
		if (hasZone) {
			return new Date(timeStr);
		} else if (timezone) {
			return zonedToUtc(timeStr.replace("T", " "), timezone);
		} else {
			return new Date(`${timeStr}Z`);
		}
	} else {
		// Time-only string
		if (timezone) {
			return zonedToUtc(`${baseDateStr} ${timeStr}`, timezone);
		} else {
			return new Date(`${baseDateStr}T${timeStr}Z`);
		}
	}
};

const resolveTimezone = (
	rawTz: string | undefined,
	recurrenceTzValue: string | undefined
): string | undefined => {
	if (rawTz) return rawTz;
	if (recurrenceTzValue) {
		return WINDOWS_TO_IANA[recurrenceTzValue] || recurrenceTzValue;
	}
	return undefined;
};


const buildExceptionMap = (
	exceptions: Array<Record<string, unknown>>
): Map<string, Record<string, unknown>> => {
	const exceptionMap = new Map();
	
	exceptions.forEach((exception: Record<string, unknown>) => {
		if (exception.original_occurrence_time) {
			const originalDate = new Date(exception.original_occurrence_time as string);
			const dateKey = originalDate.toISOString().split("T")[0];
			exceptionMap.set(dateKey, exception);
		}
	});
	
	return exceptionMap;
};

const handleException = (
	exception: Record<string, unknown>,
	graph: GraphData,
	currentDate: Date,
	eventTimeZone: string | undefined
): RbcEvent | null => {
	if (exception.exception_type === "cancelled") {
		return null;
	}
	
	if (exception.exception_type === "moved" && exception.new_start_time && exception.new_end_time) {
		const exceptionTzRaw = (exception as Record<string, unknown>)?.timezone || 
							   (exception as Record<string, unknown>)?.time_zone;
		const exceptionTimeZone = exceptionTzRaw 
			? (WINDOWS_TO_IANA[exceptionTzRaw as string] || exceptionTzRaw) 
			: eventTimeZone;
		
		const newStartTimeStr = String(exception.new_start_time);
		const newEndTimeStr = String(exception.new_end_time);
		
		const hasStartZone = /Z|[+-]\d\d:\d\d$/.test(newStartTimeStr);
		const hasEndZone = /Z|[+-]\d\d:\d\d$/.test(newEndTimeStr);
		
		let exceptionStart: Date;
		let exceptionEnd: Date;
		
		if (hasStartZone) {
			exceptionStart = new Date(newStartTimeStr);
		} else if (exceptionTimeZone) {
			exceptionStart = zonedToUtc(newStartTimeStr.replace("T", " "), exceptionTimeZone as string);
		} else {
			exceptionStart = new Date(
				newStartTimeStr.includes("T") 
					? `${newStartTimeStr}Z` 
					: `${newStartTimeStr}T00:00:00Z`
			);
		}
		
		if (hasEndZone) {
			exceptionEnd = new Date(newEndTimeStr);
		} else if (exceptionTimeZone) {
			exceptionEnd = zonedToUtc(newEndTimeStr.replace("T", " "), exceptionTimeZone as string);
		} else {
			exceptionEnd = new Date(
				newEndTimeStr.includes("T") 
					? `${newEndTimeStr}Z` 
					: `${newEndTimeStr}T00:00:00Z`
			);
		}
		
		return {
			id: `${graph.id}-${currentDate.toISOString()}-exception`,
			title: graph.name,
			start: exceptionStart,
			end: exceptionEnd,
			allDay: false,
			resource: graph,
			resourceType: "graphData",
		};
	}
	
	return null;
};



const extractScheduleMetadata = (graph: GraphData): ScheduleMetadata => {
	const firstSchedule = graph.event_schedule;
	const scheduleStart = firstSchedule?.schedule?.start as string | undefined;
	const scheduleTime = firstSchedule?.schedule?.time as Record<string, unknown> | Array<Record<string, unknown>>;
	const scheduleRunTime = Array.isArray(scheduleTime) 
		? scheduleTime?.[0]?.run_time 
		: scheduleTime?.run_time;
	const meetingTime = (scheduleRunTime || graph.metadata.time) as string | undefined;
	
	// Resolve timezone
	const rawTz = (firstSchedule?.schedule as Record<string, unknown>)?.time_zone as string | undefined;
	const recurrenceTzValue = (firstSchedule as unknown as { 
		schedule?: { recurrence?: { range?: { recurrenceTimeZone?: string } } } 
	})?.schedule?.recurrence?.range?.recurrenceTimeZone;
	const eventTimeZone = resolveTimezone(rawTz, recurrenceTzValue);
	
	// Check for Microsoft recurrence structure
	const msRecurrence = firstSchedule?.schedule?.recurrence;
	
	// Determine frequency and days
	let frequency: string;
	let meetingDays: string[];
	let interval = 1;
	
	if (msRecurrence?.pattern) {
		frequency = msRecurrence.pattern.type;
		interval = msRecurrence.pattern.interval || 1;
		meetingDays = msRecurrence.pattern.daysOfWeek?.map((day: string) => day.toLowerCase()) || [];
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
	const exceptionMap = buildExceptionMap(exceptions);
	
	return {
		meetingTime,
		eventTimeZone,
		frequency,
		meetingDays,
		interval,
		exceptionMap,
		scheduleStart,
	};
};



const generateWeeklyEvents = (
	graph: GraphData,
	metadata: ScheduleMetadata,
	startDate: Date,
	endDate: Date
): RbcEvent[] => {
	const events: RbcEvent[] = [];
	const { meetingTime, eventTimeZone, meetingDays, interval, exceptionMap } = metadata;
	
	if (meetingDays.length === 0 || !meetingTime) {
		return events;
	}
	
	meetingDays.forEach((meetingDay) => {
		let currentDate = new Date(startDate);
		currentDate.setDate(
			currentDate.getDate() +
			((dayMapping[meetingDay as keyof typeof dayMapping] + 7 - currentDate.getUTCDay()) % 7)
		);
		
		while (currentDate <= endDate) {
			const baseDateStr = currentDate.toISOString().split("T")[0];
			const exception = exceptionMap.get(baseDateStr);
			
			if (exception) {
				const exceptionEvent = handleException(exception, graph, currentDate, eventTimeZone);
				if (exceptionEvent) {
					events.push(exceptionEvent);
				}
				currentDate = new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
				continue;
			}
			
			// Regular occurrence
			const normalizedTime = normalizeTimeString(meetingTime);
			const eventStart = eventTimeZone
				? zonedToUtc(`${baseDateStr} ${normalizedTime}`, eventTimeZone)
				: new Date(`${baseDateStr}T${normalizedTime}Z`);
			const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);
			
			// Only add event if it starts within the date range
			if (eventStart <= endDate) {
				events.push({
					id: `${graph.id}-${currentDate.toISOString()}-${meetingDay}`,
					title: graph.name,
					start: eventStart,
					end: eventEnd,
					allDay: false,
					resource: graph,
					resourceType: "graphData",
				});
			}
			
			currentDate = new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
		}
	});
	
	return events;
};

const generateDailyEvents = (
	graph: GraphData,
	metadata: ScheduleMetadata,
	startDate: Date,
	endDate: Date
): RbcEvent[] => {
	const events: RbcEvent[] = [];
	const { meetingTime, eventTimeZone, interval, exceptionMap } = metadata;
	
	if (!meetingTime) {
		return events;
	}
	
	let currentDate = new Date(startDate);
	
	while (currentDate <= endDate) {
		const baseDateStr = currentDate.toISOString().split("T")[0];
		const exception = exceptionMap.get(baseDateStr);
		
		if (exception) {
			const exceptionEvent = handleException(exception, graph, currentDate, eventTimeZone);
			if (exceptionEvent) {
				events.push(exceptionEvent);
			}
			currentDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
			continue;
		}
		
		// Regular occurrence
		const normalizedTime = normalizeTimeString(meetingTime);
		const eventStart = eventTimeZone
			? zonedToUtc(`${baseDateStr} ${normalizedTime}`, eventTimeZone)
			: new Date(`${baseDateStr}T${normalizedTime}Z`);
		const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);
		
		// Only add event if it starts within the date range
		if (eventStart <= endDate) {
			events.push({
				id: `${graph.id}-${currentDate.toISOString()}`,
				title: graph.name,
				start: eventStart,
				end: eventEnd,
				allDay: false,
				resource: graph,
				resourceType: "graphData",
			});
		}
		
		currentDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
	}
	
	return events;
};

const generateOnceEvent = (
	graph: GraphData,
	metadata: ScheduleMetadata,
	startDate: Date,
	endDate: Date
): RbcEvent[] => {
	const { meetingTime, eventTimeZone, scheduleStart } = metadata;
	const timeString = String(meetingTime || "");
	
	let eventStart: Date;
	
	if (timeString && timeString.includes("T")) {
		const hasZone = /Z|[+-]\d\d:\d\d$/.test(timeString);
		if (hasZone) {
			eventStart = new Date(timeString);
		} else if (eventTimeZone) {
			eventStart = zonedToUtc(timeString.replace("T", " "), eventTimeZone);
		} else {
			eventStart = new Date(`${timeString}Z`);
		}
	} else {
		// Time-only: use schedule.start's date if available; otherwise use startDate
		const baseDateStr = scheduleStart 
			? scheduleStart.split("T")[0] 
			: startDate.toISOString().split("T")[0];
		eventStart = eventTimeZone
			? zonedToUtc(`${baseDateStr} ${timeString || "00:00"}`, eventTimeZone)
			: new Date(`${baseDateStr}T${timeString || "00:00"}Z`);
	}
	
	const eventEnd = new Date(eventStart);
	eventEnd.setHours(eventEnd.getHours() + 1);
	

	if (eventStart >= startDate && eventStart <= endDate) {
		return [{
			id: graph.id,
			title: graph.name,
			start: eventStart,
			end: eventEnd,
			allDay: false,
			resource: graph,
			resourceType: "graphData",
		}];
	}
	
	return [];
};



const graphDataToEvent = (graph: GraphData, startDate: Date, endDate: Date): RbcEvent[] => {
	const metadata = extractScheduleMetadata(graph);
	
	switch (metadata.frequency) {
		case "weekly":
			return generateWeeklyEvents(graph, metadata, startDate, endDate);
		case "daily":
			return generateDailyEvents(graph, metadata, startDate, endDate);
		case "once":
			return generateOnceEvent(graph, metadata, startDate, endDate);
		default:
			return [];
	}
};

export const getCalendarViewDataFromGraphData = (
	graphs: GraphData[] | null,
	startDate: Date,
	endDate: Date
): RbcEvent[] => {
	if (!graphs) return [];
	
	const events: RbcEvent[] = [];
	graphs.forEach((graph) => {
		// Exclude graphs that have calendar_event_id
		if (graph.metadata.calendar_event_id) {
			return;
		}
		events.push(...graphDataToEvent(graph, startDate, endDate));
	});
	
	return events;
};