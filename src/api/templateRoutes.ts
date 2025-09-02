import { Session } from "@supabase/supabase-js";

export interface StorageResourceEntity {
	id: string;
	file_name: string;
	metadata: {
		template_name?: string;
		use_case?: string;
		icon?: string;
		content?: string;
		style?: string;
		header?: string;
		[key: string]: any;
	};
	created_at: string;
	updated_at: string;
}

export interface CreateTemplateRequest {
	template_name: string;
	content: string;
	// Support both 'header' (legacy in viewers) and 'headers' (request payload)
	headers?: string;
	style?: string;
	use_case: string;
}

export interface TemplatePreview {
	id: string;
	name: string;
	useCase: string;
	icon?: string;
	description?: string;
}

/**
 * Fetch all available templates for a project
 */
export const fetchProjectTemplates = async(
	session: Session,
	projectId: string,
): Promise<StorageResourceEntity[]> => {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/templates/${projectId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch templates: ${response.statusText}`);
		}

		const templates: StorageResourceEntity[] = await response.json();
		return templates;
	} catch (error) {
		console.error("Error fetching project templates:", error);
		throw error;
	}
};

/**
 * Create a new template in the project
 */
export const createProjectTemplate = async(
	session: Session,
	projectId: string,
	templateRequest: CreateTemplateRequest,
): Promise<StorageResourceEntity> => {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/storage/templates/${projectId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.access_token}`,
			},
			body: JSON.stringify(templateRequest),
		});

		if (!response.ok) {
			throw new Error(`Failed to create template: ${response.statusText}`);
		}

		const template: StorageResourceEntity = await response.json();
		return template;
	} catch (error) {
		console.error("Error creating template:", error);
		throw error;
	}
};

/**
 * Transform StorageResourceEntity to TemplatePreview for UI
 */
export const transformToTemplatePreview = (resource: StorageResourceEntity): TemplatePreview => {
	return {
		id: resource.id,
		name: resource.metadata.template_name || resource.file_name.replace(".template", ""),
		useCase: resource.metadata.use_case || "general",
		icon: resource.metadata.icon,
		description: `Template for ${resource.metadata.use_case || "general use"}`,
	};
};

/**
 * Get template content for preview (using InteractiveChatPanel)
 */
export const getTemplateForPreview = (resource: StorageResourceEntity) => {
	return {
		id: resource.id,
		filename: resource.file_name,
		type: "sources" as const,
		resourceId: resource.id,
		title: resource.metadata.template_name || resource.file_name,
		isTemplate: true,
	};
};
