import { type Session } from "@supabase/supabase-js";
import { UpdateProperties } from "@/types/updates";
import { ImportCalendarEventsRequest, ImportCalendarEventsResponse, MicrosoftCalendarEvent } from "@/types/calendar";
import axios from "axios";

export const integrateApi = async(
	session: Session,
	project_access_id: string,
	apiKey: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integrate/microsoft/${project_access_id}`;
	const response = await axios.post(
		url,
		{
			api_key: apiKey,
		},
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);

	return response.data;
};

export const getApiIntegration = async(
	session: Session,
	project_access_id: string,
	integration_type: string = "microsoft",
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integration/${integration_type}/${project_access_id}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const createExcelSheet = async(
	session: Session,
	project_access_id: string,
	file_name: string,
	table_headers: string[],
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/onedrive/create_table/${project_access_id}`;
	const response = await axios.post(
		url,
		{
			file_name,
			table_headers,
		},
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);

	return response.data;
};

export const registerOutlookCalendarWebhook = async(
	session: Session,
	project_access_id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/microsoft/calendar/webhook/${project_access_id}`;
	const response = await axios.post(
		url,
		{}, // empty body since the endpoint doesn't require additional data
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);

	return response.data;
};

export const registerOutlookMailWebhook = async(
	session: Session,
	project_access_id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/microsoft/mail/webhook/${project_access_id}`;
	const response = await axios.post(
		url,
		{},
		{ headers: { Authorization: `Bearer ${session.access_token}` } },
	);
	return response.data;
};

export const getMicrosoftWebhook = async(
	session: Session,
	project_access_id: string,
	subscription_type: "events" | "messages",
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integration/microsoft/webhook/${subscription_type}/${project_access_id}`;
	const response = await axios.get(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	return response.data;
};

export const getMicrosoftMailWebhook = async(
	session: Session,
	project_access_id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integration/microsoft/mail/webhook/${project_access_id}`;
	const response = await axios.get(url, {
		headers: { Authorization: `Bearer ${session.access_token}` },
	});
	return response.data;
};

export const getProcoreProjects = async(
	session: Session,
	project_access_id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/procore/projects/${project_access_id}`;
	const response = await axios.get(url, {
		headers: { Authorization: `Bearer ${session.access_token}` },
	});
	return response.data;
};

export const getCalendarEvents = async(
	session: Session,
	project_access_id: string,
	start_date: string,
	end_date: string,
): Promise<MicrosoftCalendarEvent[]> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/microsoft/calendar/events/${project_access_id}`;
	const response = await axios.get(url, {
		params: {
			start_date,
			end_date,
		},
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const importCalendarEvents = async(
	session: Session,
	project_access_id: string,
	import_request: ImportCalendarEventsRequest,
): Promise<ImportCalendarEventsResponse> => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/microsoft/calendar/import/${project_access_id}`;
	const response = await axios.post(
		url,
		import_request,
		{
			headers: {
				Authorization: `Bearer ${session.access_token}`,
			},
		},
	);
	return response.data;
};

export const deleteCalendarWebhook = async(
	session: Session,
	project_access_id: string,
	subscription_id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/microsoft/calendar/webhook/${project_access_id}`;
	const response = await axios.delete(url, {
		params: {
			subscription_id,
		},
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};

export const deleteMicrosoftIntegration = async(
	session: Session,
	project_access_id: string,
) => {
	const url = `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/integrate/microsoft/${project_access_id}`;
	const response = await axios.delete(url, {
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});
	return response.data;
};