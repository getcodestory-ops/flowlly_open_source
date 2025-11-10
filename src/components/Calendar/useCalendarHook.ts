import { useState, useEffect } from "react";
import { useViewStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useIntegrationStore } from "@/hooks/useIntegrationStore";
import { useQuery } from "@tanstack/react-query";
import { getCalendarEvents } from "@/api/integration_routes";

import { format } from "date-fns";
import { MicrosoftCalendarEvent } from "@/types/calendar";
import { useStore } from "@/utils/store";
import { parseGraphDateTime } from "./calendar-utils";
import type { RbcEvent } from "@/types/calendar";
import { getCalendarViewDataFromGraphData } from "./graphDataToEvent";
import { getCalendarResultViewFromGraphData } from "./resultToEvent";
import { reconcileFlowllyMicrosoftEvents } from "./reconcileFlowllyMicrosoftEvents";
import { getMeetingEventResults } from "@/api/meeting_events";
import { EventResult } from "../WorkflowComponents/types";

export const useCalendarHook = () => {
    const { calendarView, setCalendarView } = useViewStore();
    const session = useStore((state) => state.session);
    const activeProject = useStore((state) => state.activeProject);
    const { graphs } = useWorkflow();
    const microsoftCalendarWebhook = useIntegrationStore((state) => state.microsoftCalendarWebhook);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    
    const [loadedDateRange, setLoadedDateRange] = useState<{ start: Date; end: Date }>(() => {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        const end = new Date();
        end.setMonth(end.getMonth() + 1); 
        return { start, end };
    });

    const graphEvents = getCalendarViewDataFromGraphData(graphs, today, loadedDateRange.end);
    

    const convertCalendarDataToRbcEvent = (calendarData: MicrosoftCalendarEvent[]): RbcEvent[] => {
        const events = calendarData.filter((event) => {
            if (!event.start?.dateTime || !event.end?.dateTime) return false;
            return true;
        });
        const eventmap = events.map((event) => {
            return {
                id: event.id,
                title: event.subject,
                start: new Date(event.start.dateTime + 'Z'),
                end: new Date(event.end.dateTime + 'Z'),
                allDay: false,
                resource: event,
                resourceType: "microsoft" as const,
            };
        });
        return eventmap;
    };


    const { data: meetingEventResults = [], isLoading: isLoadingMeetingEventResults } = useQuery<EventResult[]>({
        queryKey: ["meetingEventResults", activeProject?.project_id, format(loadedDateRange.start, "yyyy-MM-dd"), format(today, "yyyy-MM-dd")],
        queryFn: async () => {
            if (!session || !activeProject?.project_id) {
                return [];
            }
            const startDateUtc = new Date(Date.UTC(
                loadedDateRange.start.getFullYear(),
                loadedDateRange.start.getMonth(),
                loadedDateRange.start.getDate(),
                0, 0, 0, 0
            ));
            const startDateFormatted = startDateUtc.toISOString().replace('.000Z', '+00:00');
            const events = await getMeetingEventResults(session, activeProject.project_id, startDateFormatted, today.toISOString().replace('.000Z', '+00:00'));
            
            return Array.isArray(events) ? events.map((event) => (event.result)) : [];
        },
        enabled: !!session && !!activeProject?.project_id && !!loadedDateRange.start && !!loadedDateRange.end && loadedDateRange.start < today,
    });

    const resultAsEvents = getCalendarResultViewFromGraphData(meetingEventResults);

    const { data: calendarData = [], isLoading: isLoadingEvents } = useQuery<RbcEvent[]>({
        queryKey: ["calendarEvents", activeProject?.project_id, format(today, "yyyy-MM-dd"), format(loadedDateRange.end, "yyyy-MM-dd")],
        queryFn: async () => {
            try {
                if (!session || !activeProject?.project_id) {
                    return [];
                }
                const response = await getCalendarEvents(
                    session,
                    activeProject.project_id,
                    format(today, "yyyy-MM-dd"),
                    format(loadedDateRange.end, "yyyy-MM-dd"),
                );

                return Array.isArray(response) ? convertCalendarDataToRbcEvent(response) : [];
            } catch (error) {
                return [];
            }
        },
        enabled: !!session && !!activeProject?.project_id && !!microsoftCalendarWebhook  && loadedDateRange.end > today  });
        
        const reconciledEvents = reconcileFlowllyMicrosoftEvents(graphEvents, calendarData);

    const allEvents = [...(resultAsEvents || []) ,...(reconciledEvents || [])];


	return {
		calendarView,
		setCalendarView,
		graphs,
		microsoftCalendarWebhook,
		calendarData,
		isLoadingEvents,
		isLoadingMeetingEventResults,
		loadedDateRange,
		setLoadedDateRange,
		allEvents,
	};
};