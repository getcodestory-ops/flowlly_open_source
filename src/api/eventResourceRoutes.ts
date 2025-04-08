
import { Session } from "@supabase/supabase-js";
import axios from "axios";


interface EventResourceEntity {
    id: string;
    row: Record<string, string | number | boolean | null>;
    created_at: string;
    hidden: boolean;
    event_resource_id: string;
}


export const getEventResource = async(session: Session, eventResourceId: string) : Promise<EventResourceEntity[] | null> => {
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
