import React, { useState, useEffect } from "react";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import { getMeetingTemplate, createUpdateEventResource } from "@/api/eventResourceRoutes";

export type TemplateType = "minutes_template";

export const MeetingTemplates: React.FC = () => {
	const { session } = useStore();
	const { currentGraphId } = useWorkflow();
	
	// State for minutes template only
	const [minutesContent, setMinutesContent] = useState<string>("");
	const [minutesTemplateId, setMinutesTemplateId] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Load initial template content
	useEffect(() => {
		const loadTemplate = async(): Promise<void> => {
			if (!session || !currentGraphId) return;

			setLoading(true);
			setError(null);

			try {
				// Load minutes template
				const minutesData = await getMeetingTemplate(session, currentGraphId, "minutes_template");
				
				// Set template ID and content
				if (minutesData) {
					setMinutesTemplateId(minutesData.id);
					setMinutesContent(minutesData.metadata.content || "");
				} else {
					setMinutesTemplateId(null);
					setMinutesContent("");
				}
			} catch (err) {
				setError("Failed to load meeting template");
				console.error("Error loading template:", err);
			} finally {
				setLoading(false);
			}
		};

		loadTemplate();
	}, [session, currentGraphId]);

	// Save function - this will be called by the editor's save button
	const saveMinutesTemplate = async(content: string): Promise<void> => {
		if (!session || !currentGraphId) {
			setError("Missing required data for saving template");
			return;
		}
		setMinutesContent(content);
		try {
			if (!minutesTemplateId) {
				// Create new template
				const templateData = {
					id: crypto.randomUUID(),
					event_id: currentGraphId,
					metadata: {
						name: "minutes_template" as const,
						content: content,
					},
				};
				const newTemplate = await createUpdateEventResource(session, currentGraphId, templateData);
				if (newTemplate) {
					setMinutesTemplateId(newTemplate.id);
				}
			} else {
				// Update existing template
				const templateData = {
					id: minutesTemplateId,
					event_id: currentGraphId,
					metadata: {
						name: "minutes_template" as const,
						content: content,
					},
				};
				await createUpdateEventResource(session, currentGraphId, templateData);
			}
		} catch (err) {
			setError("Failed to save minutes template");
			console.error("Error saving minutes template:", err);
			throw err; // Re-throw so the editor can handle the error
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-semibold text-gray-900 mb-1">Meeting Minutes Template</h2>
					<p className="text-sm text-gray-600">Create a template for your meeting minutes</p>
				</div>
				<div className="flex items-center justify-center h-48">
					<div className="text-gray-500">Loading template...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold text-gray-900 mb-1">Meeting Minutes Template</h2>
				<p className="text-sm text-gray-600">Create a template for your meeting minutes</p>
			</div>
			{error && (
				<Alert className="border-red-200 bg-red-50">
					<AlertDescription className="text-red-800">{error}</AlertDescription>
				</Alert>
			)}
			<div className="space-y-4 h-[80vh] overflow-y-auto">
				<ContentEditor 
					content={minutesContent}
					documentType="Minutes of the meeting"
					saveFunction={saveMinutesTemplate}
				/>
			</div>
		</div>
	);
}; 