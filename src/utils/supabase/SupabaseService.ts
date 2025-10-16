import { createClient } from "./client";

// Define the Type for the returned data
export interface MeetingEvent {
	event_name: string;
	meeting_date: string;
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