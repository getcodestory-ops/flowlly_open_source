import { createClient } from "./client";

// Define the Type for the returned data
export interface MeetingEvent {
	event_name: string;
	meeting_date: string;
	event_count: number;
	latest_event_id: string;
}

export interface SimilarEventResult {
	result_id: string;
	is_recording_successful: boolean;
	meeting_timestamp: string | null; // Add the timestamp (can be null if not found)
}

// Initialize Supabase client
const supabase = createClient();

/**
 * Fetches the latest successful meeting events using a project access ID.
 * @param {string} projectAccessId - The UUID from the project_access table.
 * @returns {Promise<MeetingEvent[] | null>} A promise that resolves to an array of event objects.
 */
export async function fetchLatestMeetingEvents(
	projectAccessId: string,
): Promise<MeetingEvent[] | null> {
	if (!projectAccessId) {
		console.error("Project Access ID is required.");
		return null;
	}

	// eslint-disable-next-line no-console
	console.log("SupabaseService: Calling RPC with project_access_id_param:", projectAccessId);

	// First, let's check the current user
	const { data: { user }, error: userError } = await supabase.auth.getUser();
	// eslint-disable-next-line no-console
	console.log("SupabaseService: Current user:", user);
	// eslint-disable-next-line no-console
	console.log("SupabaseService: User error:", userError);

	// Use the new parameter name that matches the SQL function
	const { data, error } = await supabase.rpc(
		"get_latest_successful_meeting_events",
		{
			project_access_id_param: projectAccessId,
		},
	);

	// eslint-disable-next-line no-console
	console.log("SupabaseService: RPC response - data:", data);
	// eslint-disable-next-line no-console
	console.log("SupabaseService: RPC response - error:", error);

	if (error) {
		console.error("Error fetching latest meeting events:", error.message);
		console.error("Error details:", error);
		return null;
	}

	// eslint-disable-next-line no-console
	console.log("SupabaseService: Returning data:", data);
	return data;
}

/**
 * Fetches similar event results for a given event ID.
 * @param {string} eventId - The source event ID.
 * @returns {Promise<SimilarEventResult[] | null>} A promise that resolves to an array of similar event results.
 */
export async function fetchSimilarEventResults(
	eventId: string,
): Promise<SimilarEventResult[] | null> {
	if (!eventId) {
		console.error("Source event ID is required.");
		return null;
	}

	// eslint-disable-next-line no-console
	console.log("SupabaseService: Calling RPC get_results_for_similar_events with eventId:", eventId);

	const { data, error } = await supabase.rpc(
		"get_results_for_similar_events",
		{
			source_event_id: eventId,
		},
	);

	// eslint-disable-next-line no-console
	console.log("SupabaseService: RPC response - data:", data);
	// eslint-disable-next-line no-console
	console.log("SupabaseService: RPC response - error:", error);

	if (error) {
		console.error("Error fetching similar event results:", error.message);
		console.error("Error details:", error);
		return null;
	}

	// eslint-disable-next-line no-console
	console.log("SupabaseService: Returning similar event results:", data);
	return data as SimilarEventResult[] | null;
}