import { type Session } from "@supabase/supabase-js";
import axios from "axios";
import { EventResult } from "@/components/WorkflowComponents/types";


export const getMeetingEventResults = async(
	session: Session,
	projectAccessId: string,
	startDate: string,
	endDate: string,
): Promise<{ id: string, created_at: string, schedule_id: string, result: EventResult }[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/meeting_events/results/${projectAccessId}`;
	const response = await axios.get(url, {
		params: {
			start_date: startDate,
			end_date: endDate,
		},
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};