import type { EventResult } from "@/components/WorkflowComponents/types";
import type { GraphData } from "@/components/WorkflowComponents/types";
export interface CalendarOrganizer {
  name: string;
  email: string;
}

export interface CalendarAttendee {
  name: string;
  email: string;
  response_status: "accepted" | "declined" | "tentative" | "not_responded";
}

export interface CalendarRecurrencePattern {
  type: string;
  interval?: number;
  month?: number;
  dayOfMonth?: number;
  daysOfWeek?: string[];
  firstDayOfWeek?: string;
  index?: string;
}

export interface CalendarRecurrence {
  pattern: CalendarRecurrencePattern;
  range: {
    type: string;
    start_date: string;
    end_date?: string;
    number_of_occurrences?: number;
  };
}

export interface FormattedCalendarEvent {
  id: string;
  subject: string;
  start?: string; // ISO datetime string
  end?: string;   // ISO datetime string
  timezone: string;
  location: string;
  online_meeting_url?: string;
  is_online_meeting: boolean;
  organizer?: CalendarOrganizer;
  attendees: CalendarAttendee[];
  type: "singleInstance" | "occurrence" | "exception" | "seriesMaster";
  series_master_id?: string;
  occurrence_id?: string;
  original_start?: string; // For exceptions
  recurrence?: CalendarRecurrence;
  body_preview: string;
  last_modified?: string;
}

export interface CalendarEventsResponse {
  events: FormattedCalendarEvent[];
  total_count: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface ImportCalendarEventsRequest {
  resource_ids: string[]; // List of calendar event resource IDs to import
}

export interface ImportCalendarEventsResponse {
  success: boolean;
  imported_count: number;
  failed_count: number;
  message: string;
}

export type MicrosoftCalendarEvent = {
	id: string;
	subject: string;
	start: {
		dateTime: string;
		timeZone: string;
	};
	end: {
		dateTime: string;
		timeZone: string;
	};
	type: "singleInstance" | "occurrence" | "exception" | "seriesMaster";
	seriesMasterId?: string;
	occurrenceId?: string;
	originalStart?: string;
	isOnlineMeeting: boolean;
	location?: {
		displayName?: string;
		locationType?: string;
		uniqueId?: string;
		uniqueIdType?: string;
		address?: Record<string, unknown>;
		coordinates?: Record<string, unknown>;
	};
	attendees?: Array<{
		type?: string;
		status?: {
			response?: string;
			time?: string;
		};
		emailAddress?: {
			name?: string;
			address?: string;
		};
	}>;
	organizer?: {
		emailAddress?: {
			name?: string;
			address?: string;
		};
	};
	recurrence?: Record<string, unknown> | null;
	body?: {
		contentType?: string;
		content?: string;
	};
	lastModifiedDateTime?: string;
};

export type RbcEvent = {
	id: string;
	title: React.ReactNode;
	start: Date;
	end: Date;
	allDay?: boolean;
	resource: MicrosoftCalendarEvent | EventResult | GraphData;
	resourceType: "microsoft" | "eventResult" | "graphData";
	graphName?: string; 
	isReconciled?: boolean; 
  };