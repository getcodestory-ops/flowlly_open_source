import React, { useState, useMemo } from "react";
import { Calendar, View } from "react-big-calendar";
import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";
import { dayMapping, localizer } from "./calendar-utils";
import type { GraphData } from "./types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useViewStore } from "@/utils/store";

interface CalendarViewProps {
  graphs: GraphData[];
  onSelectGraph: (graphId: string) => void;
}

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToCurrent = () => {
    toolbar.onNavigate("TODAY");
  };

  return (
    <div className="flex items-center justify-between p-2 bg-background border-b">
      <div className="space-x-2">
        <Button variant="ghost" size="sm" onClick={goToBack}>
          Back
        </Button>
        <Button variant="ghost" size="sm" onClick={goToCurrent}>
          Today
        </Button>
        <Button variant="ghost" size="sm" onClick={goToNext}>
          Next
        </Button>
      </div>
      <div className="text-sm font-medium">{toolbar.label}</div>
      <div className="space-x-2">
        {["month", "week", "day", "agenda"].map((viewOption) => (
          <Button
            key={viewOption}
            variant={toolbar.view === viewOption ? "default" : "ghost"}
            size="sm"
            onClick={() => toolbar.onView(viewOption)}
            className="capitalize"
          >
            {viewOption}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  graphs,
  onSelectGraph,
}) => {
  const { calendarView, setCalendarView } = useViewStore();
  const [date, setDate] = useState(new Date());

  const generateRecurringEvents = (graph: GraphData) => {
    const events = [];
    const startDate = new Date(graph.created_at);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 84);

    const frequency = graph.metadata.frequency;
    const meetingDay = graph.metadata.recurrence_day?.toLowerCase();
    const meetingTime = graph.metadata.time;

    if (frequency === "weekly" && meetingDay && meetingTime) {
      let currentDate = new Date(startDate);
      currentDate.setDate(
        currentDate.getDate() +
          ((dayMapping[meetingDay as keyof typeof dayMapping] +
            7 -
            currentDate.getDay()) %
            7)
      );
      const [hours, minutes] = meetingTime.split(":").map(Number);

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
      const eventStart = new Date(startDate);
      const [hours, minutes] = (graph.metadata.time || "00:00")
        .split(":")
        .map(Number);
      eventStart.setHours(hours, minutes);

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
          </div>
        ),
        start: eventStart,
        end: eventEnd,
        allDay: false,
        resource: graph,
      });
    }

    return events;
  };

  const events = useMemo(() => {
    return graphs.flatMap(generateRecurringEvents);
  }, [graphs]);

  const handleSelectEvent = (event: any) => {
    const eventResult = event.resource;
    onSelectGraph(eventResult.id);
  };

  const eventPropGetter = (event: any) => ({
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
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "week", "day", "agenda"]}
        view={calendarView as View}
        onView={setCalendarView}
        onSelectEvent={handleSelectEvent}
        date={date}
        onNavigate={(date: any) => setDate(date)}
        eventPropGetter={eventPropGetter}
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};
