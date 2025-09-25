import React, { useState, useMemo, useCallback } from "react";
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
					variant="ghost"
				>
          Back
				</Button>
				<Button
					onClick={goToCurrent}
					size="sm"
					variant="ghost"
				>
          Today
				</Button>
				<Button
					onClick={goToNext}
					size="sm"
					variant="ghost"
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
	const { calendarView, setCalendarView } = useViewStore();
	const [date, setDate] = useState(new Date());

	const extractHoursMinutes = useCallback((timeString?: string): { hours: number; minutes: number } => {
		if (!timeString) {
			return { hours: 0, minutes: 0 };
		}
		if (timeString.includes("T")) {
			const parsed = new Date(timeString);
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
	const startDate = new Date(graph.created_at);
	const endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + 84);

	const frequency = graph.metadata.frequency || "once";
	const meetingDay = graph.metadata.recurrence_day?.toLowerCase();
	const meetingTime = graph.metadata.time;

	if (frequency === "weekly" && meetingDay && meetingTime) {
		let currentDate = new Date(startDate);
		currentDate.setDate(
			currentDate.getDate() +
				((dayMapping[meetingDay as keyof typeof dayMapping] + 7 - currentDate.getDay()) % 7),
		);
		const { hours, minutes } = extractHoursMinutes(meetingTime);

		while (currentDate <= endDate) {
			const eventStart = new Date(currentDate);
			eventStart.setHours(hours, minutes);
			const eventEnd = new Date(eventStart);
			eventEnd.setHours(eventEnd.getHours() + 1);

			events.push({
				id: `${graph.id}-${currentDate.toISOString()}`,
				title: (
					<div className="flex items-center gap-2">
						{graph.event_type === "document_writing" ? (
							<FileText size={14} />
						) : (
							<Video size={14} />
						)}
						<span className="text-xs opacity-80">{formatLocalTime(eventStart)}</span>
						{graph.name}
					</div>
				),
				start: eventStart,
				end: eventEnd,
				allDay: false,
				resource: graph,
			});

			currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
		}
	} else if (frequency === "once") {
		const timeString = graph.metadata.time;
		let eventStart: Date;

		if (timeString && timeString.includes("T")) {
			const parsed = new Date(timeString);
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
			eventStart = new Date(startDate);
			const { hours, minutes } = extractHoursMinutes(timeString);
			eventStart.setHours(hours, minutes);
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
					<span className="text-xs opacity-80">{formatLocalTime(eventStart)}</span>
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

	const eventPropGetter = (event: { resource: GraphData }): { style: React.CSSProperties } => ({
		style: {
			backgroundColor:
        event.resource.event_type === "document_writing"
        	? "#22c55e"
        	: "#facc15",
			color:
        event.resource.event_type === "document_writing" ? "white" : "black",
			padding: "4px 8px",
			borderRadius: "4px",
			display: "flex",
			alignItems: "center",
			gap: "4px",
		},
	});

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
				localizer={localizer}
				onNavigate={(date: Date) => setDate(date)}
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
