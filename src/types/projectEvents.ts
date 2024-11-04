export interface TimeConfig {
  run_time: string;
  delivery_time?: string;
}

export interface RunConfig {
  day: number[];
  start: string;
  end?: string;
  time: TimeConfig[];
  time_zone: string;
  auto_join?: boolean;
}

export enum ProjectEventType {
  MEETING = "meeting",
  SAFETY_INSPECTION = "safety_inspection",
}

export interface ProjectEventMetadata {
  online_link?: string;
  location?: string;
  frequency?: string;
  duration?: number;
  recurrence_day: string;
  time: string;
  search_query?: string;
  write_prompt?: string;
  selected_items?: {};
  output_folder_id?: string | null;
}

export interface ProjectEvent {
  id?: string;
  created_at?: string;
  created_by?: string;
  name: string;
  event_type: "meeting" | "safety_inspection" | "document_writing";
  metadata: ProjectEventMetadata;
}

export interface EventAccess {
  project_id: string;
  event_id: string;
}

export enum EventAccessRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

export enum IdentificationType {
  USER_ID = "user_id",
  EMAIL = "email",
  DIRECTORY_ID = "directory_id",
  PHONE_NUMBER = "phone_number",
  PROJECT_ACCESS_ID = "project_access_id",
  METADATA = "metadata",
}

export interface EventParticipantMetadata {
  role: "owner" | "admin" | "member" | "guest";
  identification:
    | "user_id"
    | "email"
    | "directory_id"
    | "phone_number"
    | "project_access_id"
    | "metadata";
  metadata: Record<string, any>;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  participantMetadata: EventParticipantMetadata[];
}

export enum EventFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  WEEKDAYS = "weekdays",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

export interface EventSchedule {
  id: string;
  event_id: string;
  schedule: RunConfig;
  run_frequency?: "daily" | "weekly" | "weekdays" | "monthly" | "yearly";
}

export interface CreateEvent {
  project_event: ProjectEvent;
  event_participants: EventParticipantMetadata[];
  auto_join?: boolean;
  duration?: number;
  end_date?: string;
  start_date?: string;
  start_time?: string;
  is_recording?: boolean;
  recurrence?: string;
  participation_link?: string;
  join_now?: boolean;
  time_zone?: string;
}
