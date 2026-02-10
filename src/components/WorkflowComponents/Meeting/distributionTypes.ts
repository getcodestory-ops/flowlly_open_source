/**
 * Distribution Settings Types - Matches backend models
 */

export type TemplateId = "notion" | "executive" | "detailed" | "minimal" | "custom";

export interface DistributionSettingsMetadata {
	attachment_ids?: string[];
}

/**
 * Full distribution settings from backend (snake_case to match API)
 */
export interface DistributionSettings {
	id: string;
	meeting_name: string;
	project_id: string;
	template_id: TemplateId;
	subject: string;
	selected_recipients?: string[];
	custom_prompt?: string | null;
	metadata?: DistributionSettingsMetadata | null;
	created_at?: string;
	updated_at?: string;
	created_by?: string;
}

/**
 * Request body for creating distribution settings
 */
export interface CreateDistributionSettingsRequest {
	meeting_name: string;
	project_access_id: string;
	template_id: TemplateId;
	subject: string;
	selected_recipients?: string[];
	custom_prompt?: string | null;
	metadata?: DistributionSettingsMetadata | null;
}

/**
 * Request body for updating distribution settings (all fields optional)
 */
export interface UpdateDistributionSettingsRequest {
	meeting_name?: string;
	template_id?: TemplateId;
	subject?: string;
	selected_recipients?: string[];
	custom_prompt?: string | null;
	metadata?: DistributionSettingsMetadata | null;
}
