import { RbcEvent } from "@/types/calendar";


const normalizeTitle = (title: React.ReactNode): string => {
    if (typeof title === "string") {
        return title.trim();
    }
    if (typeof title === "number") {
        return title.toString();
    }

    return String(title).trim();
};

export const reconcileFlowllyMicrosoftEvents = (FlowllyCalendarEvents: RbcEvent[], MicrosofotCalendarEvents: RbcEvent[]): RbcEvent[] => {
    const reconciledEvents: RbcEvent[] = [];
    
    const flowllyEventsMap = new Map<string, RbcEvent>();
    FlowllyCalendarEvents.forEach(event => {
        const key = `${normalizeTitle(event.title)}_${event.start.getTime()}`;
        flowllyEventsMap.set(key, event);
    });
    

    MicrosofotCalendarEvents.forEach(microsoftEvent => {
        const key = `${normalizeTitle(microsoftEvent.title)}_${microsoftEvent.start.getTime()}`;

        if (flowllyEventsMap.has(key)) {
            reconciledEvents.push(microsoftEvent);
            flowllyEventsMap.delete(key);
        } else {
            reconciledEvents.push(microsoftEvent);
        }
    });
    
    flowllyEventsMap.forEach(event => {
        reconciledEvents.push(event);
    });
    
    return reconciledEvents;
};