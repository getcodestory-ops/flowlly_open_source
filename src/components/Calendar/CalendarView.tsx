import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Calendar, View } from "react-big-calendar";
import { FileText, X } from "lucide-react";
import { localizer, formatLocalTime, parseGraphDateTime } from "./calendar-utils";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarView.module.css";
import { useViewStore } from "@/utils/store";
import { MicrosoftCalendarEvent } from "@/types/calendar";
import type { EventResult } from "../WorkflowComponents/types";
import type { GraphData } from "../WorkflowComponents/types";
import CustomToolbar from "./ToolBar";
import { DEFAULT_SCROLL_TIME } from "./const";
import { useCalendarHook } from "./useCalendarHook";
import type { RbcEvent } from "@/types/calendar";
import { ResultViewer } from "../WorkflowComponents/ResultViewer";
import { Button } from "@/components/ui/button";
import { MicrosoftEventDetailsModal } from "./MicrosoftEventDetailsModal";
import ProjectEventCreationForm from "../ProjectEvent/ProjectEventCreationForm";


interface CalendarViewProps {
  onEditEvent?: (eventData: MicrosoftCalendarEvent) => void;
}



export const CalendarView: React.FC<CalendarViewProps> = ({
  onEditEvent,
}) => {
  const { calendarView, setCalendarView } = useViewStore();
  const [date, setDate] = useState(new Date());
  const [selectedEventResult, setSelectedEventResult] = useState<EventResult | null>(null);
  const [selectedMicrosoftEvent, setSelectedMicrosoftEvent] = useState<MicrosoftCalendarEvent | null>(null);
  const [selectedGraphData, setSelectedGraphData] = useState<GraphData | null>(null);
  const { calendarData, isLoadingEvents, loadedDateRange, setLoadedDateRange, isLoadingMeetingEventResults, graphs, allEvents } = useCalendarHook();


  const handleRangeChange = useCallback((range: Date[] | { start: Date; end: Date }) => {
    if (isLoadingEvents) return;

    let viewStart: Date;
    let viewEnd: Date;

    if (Array.isArray(range)) {
      viewStart = range[0];
      viewEnd = range[range.length - 1];
    } else {
      viewStart = range.start;
      viewEnd = range.end;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setLoadedDateRange((currentRange) => {
      let newStart: Date;
      let newEnd: Date;

      newStart = new Date(viewStart.getFullYear(), viewStart.getMonth(), 1);
      newEnd = new Date(viewEnd.getFullYear(), viewEnd.getMonth() + 1, 0);


      if (
        newStart.getTime() !== currentRange.start.getTime() ||
        newEnd.getTime() !== currentRange.end.getTime()
      ) {
        return { start: newStart, end: newEnd };
      }

      return currentRange;
    });
  }, [isLoadingEvents, setLoadedDateRange]);


  const handleSelectEvent = (event: RbcEvent) => {
    if (event.resourceType === "eventResult" && event.resource) {
      setSelectedEventResult(event.resource as EventResult);
    } else if (event.resourceType === "microsoft" && event.resource) {
      setSelectedMicrosoftEvent(event.resource as MicrosoftCalendarEvent);
    } else if (event.resourceType === "graphData" && event.resource) {
      setSelectedGraphData(event.resource as GraphData);
    }
  };


  const eventPropGetter = (event: { resource: MicrosoftCalendarEvent | EventResult | GraphData; resourceType?: "microsoft" | "eventResult" | "graphData"; isReconciled?: boolean }): { style: React.CSSProperties } => {
    if ("nodes" in event.resource && event.resource.nodes) {
      return {
        style: {
          backgroundColor: "#bbf7d0", // Pastel green for events with nodes
          color: "#1f2937",
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
      };
    }

    // Handle Microsoft calendar events
    if (event.resourceType === "microsoft" && "type" in event.resource) {
      const microsoftEvent = event.resource as MicrosoftCalendarEvent;
      const isDocument = microsoftEvent.type === "singleInstance" && !microsoftEvent.isOnlineMeeting;
      const isException = microsoftEvent.type === "exception";

      const isReconciled = event.isReconciled === true;

      return {
        style: {
          backgroundColor: "#fef3c7",
          color: "#1f2937",
          padding: "4px 8px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: "bold",
          fontSize: "0.75rem",
          border: isReconciled ? "2px solid #c4b5fd" : "none", 
          outline: "none",
        },
      };
    }


    return {
      style: {
        backgroundColor: "#bfdbfe",  
        color: "#1f2937",
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
    };
  };



  return (
    <div style={{ height: "82vh", width: "95vw", position: "relative" }}>
      {(isLoadingEvents || isLoadingMeetingEventResults) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="text-sm text-gray-600">Loading ...</div>
        </div>
      )}
      <Calendar
        components={{
          toolbar: CustomToolbar,
        }}
        date={date}
        endAccessor="end"
        eventPropGetter={eventPropGetter}
        events={allEvents}
        formats={{
          eventTimeRangeFormat: () => "",
          timeGutterFormat: (date: Date) => formatLocalTime(date),
        }}
        localizer={localizer}
        onNavigate={setDate}
        onRangeChange={handleRangeChange}
        onSelectEvent={handleSelectEvent}
        onView={setCalendarView}
        scrollToTime={DEFAULT_SCROLL_TIME}
        startAccessor="start"
        style={{ height: "100%" }}
        view={calendarView as View}
        views={["month", "week", "day", "agenda"]}
      />

      {selectedEventResult && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-[95vw] h-[99vh] flex flex-col">

            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">
                {selectedEventResult.event_name || selectedEventResult.name || "Event Details"}
              </h2>
              <Button
                className="h-8 w-8 p-0"
                onClick={() => setSelectedEventResult(null)}
                size="icon"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResultViewer currentResult={selectedEventResult} />
            </div>
          </div>
        </div>
      )}

      <MicrosoftEventDetailsModal
        event={selectedMicrosoftEvent}
        onClose={() => setSelectedMicrosoftEvent(null)}
      />

      {selectedGraphData && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedGraphData(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-[90vw] h-[99vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Edit Meeting</h2>
              <Button
                className="h-8 w-8 p-0"
                onClick={() => setSelectedGraphData(null)}
                size="icon"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ProjectEventCreationForm
                editData={selectedGraphData}
                onClose={() => setSelectedGraphData(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
