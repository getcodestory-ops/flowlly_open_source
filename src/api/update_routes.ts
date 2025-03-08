import { type Session } from "@supabase/supabase-js";
import { UpdateProperties } from "@/types/updates";
import axios from "axios";

export const getUpdates = async(
	session: Session,
	project_access_id: string,
): Promise<UpdateProperties[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/updates/daily/${project_access_id}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const getNotifications = async(session: Session, projectId: string) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/updates/notifications/${projectId}`;
	const response = await axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const getNodeTraces = async(
	session: Session,
	projectId: string,
	nodeId: string,
): Promise<UpdateProperties> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/trace/${projectId}/${nodeId}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};
