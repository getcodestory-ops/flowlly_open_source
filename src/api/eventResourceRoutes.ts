
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


export interface MeetingResourceEntity {
    id: string;
    created_at: string;
    event_id: string;
    metadata: {
		"name": "agenda_template" | "minutes_template";
		"content": string;
	};
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

export const getEventResourceDashboard = async(session: Session, projectId: string, eventResourceId: string) : Promise<string | null> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/resource/dashboard/${projectId}`;
	try {
		const response = await axios.get(url, {
			params: {
				resource_id: eventResourceId,
			},	
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error in getEventResourceDashboard", error);
		return null;
	}
};


export const getEventResourceByResourceName = async(session: Session, eventResourceId: string, resourceName: string) : Promise<MeetingResourceEntity | null> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/event_resource/${eventResourceId}/${resourceName}`;
	try {
		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error in getEventResourceByResourceName", error);
		return null;
	}
};



export const updateEventResource = async(session: Session, eventResourceId: string, resource: EventResourceEntity | MeetingResourceEntity) : Promise< EventResourceEntity | MeetingResourceEntity | null> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/event_resource/${eventResourceId}`;
	try {
		const response = await axios.put(url, resource, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error in updateEventResource", error);
		return null;
	}
};

// Meeting Template Functions
export const createUpdateEventResource = async(session: Session, eventId: string, resource: Partial<MeetingResourceEntity>) : Promise<MeetingResourceEntity | null> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/event_resource/${eventId}`;
	try {
		const newResource: Partial<MeetingResourceEntity> = {
			id: crypto.randomUUID(),
			event_id: eventId,
			...resource,
		};
		const response = await axios.put(url, newResource, {
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error in createEventResource", error);
		return null;
	}
};

export const getMeetingTemplate = async(
	session: Session, 
	eventId: string, 
	templateType: "agenda_template" | "minutes_template",
) : Promise<MeetingResourceEntity | null> => {
	try {
		const content = await getEventResourceByResourceName(session, eventId, templateType);
		return content as MeetingResourceEntity;
	} catch (error) {
		console.error("Error in getMeetingTemplate", error);
		return null;
	}
};


