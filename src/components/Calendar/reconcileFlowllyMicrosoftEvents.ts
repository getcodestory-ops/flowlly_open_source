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

const getEventKey = (event: RbcEvent): string => {
    // For resultAsEvents, prefer graphName if available (more reliable than React component title)
    const name = event.graphName || normalizeTitle(event.title);
    return `${name}_${event.start.getTime()}`;
};

export const reconcileFlowllyMicrosoftEvents = (resultAsEvents: RbcEvent[], calendarData: RbcEvent[], graphEvents: RbcEvent[]): RbcEvent[] => {
    const reconciledEvents: RbcEvent[] = [];
    
    const addedKeys = new Set<string>();
    
    resultAsEvents.forEach(resultEvent => {
        const key = getEventKey(resultEvent);
        reconciledEvents.push(resultEvent);
        addedKeys.add(key);
    });
    

    calendarData.forEach(calendarEvent => {
        const key = getEventKey(calendarEvent);
        if (!addedKeys.has(key)) {
            reconciledEvents.push(calendarEvent);
            addedKeys.add(key);
        }
    });
    

    graphEvents.forEach(graphEvent => {
        const key = getEventKey(graphEvent);
        if (!addedKeys.has(key)) {
            reconciledEvents.push(graphEvent);
            addedKeys.add(key);
        }
    });
    
    return reconciledEvents;
};