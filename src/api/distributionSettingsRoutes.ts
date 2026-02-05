import { Session } from "@supabase/supabase-js";
import axios from "axios";
import type { 
	DistributionSettings, 
	CreateDistributionSettingsRequest,
	UpdateDistributionSettingsRequest 
} from "@/components/WorkflowComponents/Meeting/distributionTypes";

const BASE_URL = process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL;

/**
 * Get distribution settings by meeting name and project access ID
 */
export const getDistributionSettings = async (
	session: Session,
	projectAccessId: string,
	meetingName: string
): Promise<DistributionSettings | null> => {
	if (!session.access_token) return null;
	
	try {
		const response = await axios.get(
			`${BASE_URL}/distribution-settings/meeting`,
			{
				params: {
					project_access_id: projectAccessId,
					meeting_name: meetingName,
				},
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
			}
		);
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return null; // Settings not found - this is expected for new meetings
		}
		throw error;
	}
};

/**
 * Create new distribution settings
 */
export const createDistributionSettings = async (
	session: Session,
	request: CreateDistributionSettingsRequest
): Promise<DistributionSettings> => {
	if (!session.access_token) {
		throw new Error("No access token");
	}
	
	const response = await axios.post(
		`${BASE_URL}/distribution-settings`,
		request,
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		}
	);
	return response.data;
};

/**
 * Update distribution settings by ID
 */
export const updateDistributionSettings = async (
	session: Session,
	settingsId: string,
	updates: UpdateDistributionSettingsRequest
): Promise<DistributionSettings> => {
	if (!session.access_token) {
		throw new Error("No access token");
	}
	
	const response = await axios.put(
		`${BASE_URL}/distribution-settings/${settingsId}`,
		updates,
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		}
	);
	return response.data;
};

/**
 * Delete distribution settings by ID
 */
export const deleteDistributionSettings = async (
	session: Session,
	settingsId: string
): Promise<void> => {
	if (!session.access_token) {
		throw new Error("No access token");
	}
	
	await axios.delete(
		`${BASE_URL}/distribution-settings/${settingsId}`,
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		}
	);
};
