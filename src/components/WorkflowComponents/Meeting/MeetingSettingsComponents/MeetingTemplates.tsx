import React, { useState, useEffect } from "react";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import { getMeetingTemplate, MeetingResourceEntity, createUpdateEventResource } from "@/api/eventResourceRoutes";

export type TemplateType = "agenda_template" | "minutes_template";

export const MeetingTemplates: React.FC = () => {
	const { session } = useStore();
	const { currentGraphId } = useWorkflow();
	
	// Separate state for content and template IDs
	const [agendaContent, setAgendaContent] = useState<string>("");
	const [minutesContent, setMinutesContent] = useState<string>("");
	const [agendaTemplateId, setAgendaTemplateId] = useState<string | null>(null);
	const [minutesTemplateId, setMinutesTemplateId] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Load initial template content
	useEffect(() => {
		const loadTemplates = async() => {
			if (!session || !currentGraphId) return;

			setLoading(true);
			setError(null);

			try {
				// Load both templates in parallel
				const [agendaData, minutesData] = await Promise.all([
					getMeetingTemplate(session, currentGraphId, "agenda_template"),
					getMeetingTemplate(session, currentGraphId, "minutes_template"),
				]);
				
				// Set template IDs and content separately
				if (agendaData) {
					setAgendaTemplateId(agendaData.id);
					setAgendaContent(agendaData.metadata.content || "");
				} else {
					setAgendaTemplateId(null);
					setAgendaContent("");
				}

				if (minutesData) {
					setMinutesTemplateId(minutesData.id);
					setMinutesContent(minutesData.metadata.content || "");
				} else {
					setMinutesTemplateId(null);
					setMinutesContent("");
				}
			} catch (err) {
				setError("Failed to load meeting templates");
				console.error("Error loading templates:", err);
			} finally {
				setLoading(false);
			}
		};

		loadTemplates();
	}, [session, currentGraphId]);

	// Save functions - these will be called by the editor's save button
	const saveAgendaTemplate = async(content: string) => {
		if (!session || !currentGraphId) {
			setError("Missing required data for saving template");
			return;
		}
		setAgendaContent(content);

		try {
			if (!agendaTemplateId) {
				// Create new template
				const templateData = {
					id: crypto.randomUUID(),
					event_id: currentGraphId,
					metadata: {
						name: "agenda_template" as const,
						content: content,
					},
				};
				const newTemplate = await createUpdateEventResource(session, currentGraphId, templateData);
				if (newTemplate) {
					setAgendaTemplateId(newTemplate.id);
				}
			} else {
				// Update existing template
				const templateData = {
					id: agendaTemplateId,
					event_id: currentGraphId,
					metadata: {
						name: "agenda_template" as const,
						content: content,
					},
				};
				await createUpdateEventResource(session, currentGraphId, templateData);
			}
		} catch (err) {
			setError("Failed to save agenda template");
			console.error("Error saving agenda template:", err);
			throw err; // Re-throw so the editor can handle the error
		}
	};

	const saveMinutesTemplate = async(content: string) => {
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
					<h2 className="text-2xl font-semibold text-gray-900 mb-1">Meeting Templates</h2>
					<p className="text-sm text-gray-600">Create templates for your meeting agendas and minutes</p>
				</div>
				<div className="flex items-center justify-center h-48">
					<div className="text-gray-500">Loading templates...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold text-gray-900 mb-1">Meeting Templates</h2>
				<p className="text-sm text-gray-600">Create templates for your meeting agendas and minutes</p>
			</div>
			{error && (
				<Alert className="border-red-200 bg-red-50">
					<AlertDescription className="text-red-800">{error}</AlertDescription>
				</Alert>
			)}
			<Tabs className="h-full flex flex-col" defaultValue="minutes">
				<TabsList className="h-10 p-1 bg-gray-100 w-fit">
					<TabsTrigger className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm" value="minutes">
						Meeting Minutes Template
					</TabsTrigger>
					<TabsTrigger className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm" value="agenda">
						Agenda Template
					</TabsTrigger>
				</TabsList>
				<TabsContent className="flex-1 mt-6 space-y-4" value="minutes">
					<ContentEditor 
						content={minutesContent}
						documentType="Minutes of the meeting"
						saveFunction={saveMinutesTemplate}
					/>
				</TabsContent>
				<TabsContent className="flex-1 mt-6 space-y-4" value="agenda">
					<ContentEditor 
						content={agendaContent}
						documentType="Agenda"
						saveFunction={saveAgendaTemplate}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}; 