
import { Session } from "@supabase/supabase-js";
import axios from "axios";


interface EventResourceRow {
    id: string;
    row: Record<string, string | number | boolean | null>;
    created_at: string;
    hidden: boolean;
    event_resource_id: string;
}

interface EventResourceEntity {
    id: string;
	created_at: string;
	event_id: string;
	metadata: Record<string, string | number | boolean | null>;
    event_resource_rows: EventResourceRow[];
}



export const getEventResourceRows = async(session: Session, eventResourceId: string) : Promise<EventResourceRow[] | null> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/resource/event_resource/${eventResourceId}`;
	try {
		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error in getEventResource", error);
		return null;
	}
};


export const getEventResoucesByEventId = async(session: Session, eventId: string) : Promise<EventResourceEntity[] | null> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/resource/event_resource/event/${eventId}`;
	try {
		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error in getEventResoucesByEventId", error);
		return null;
	}
};
