import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CornerDownLeft, Loader2, X, Paperclip, MessageSquare, Calendar } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import clsx from "clsx";
import type { ProjectEvents, EventResult, EventSchedule, NodeData } from "@/components/WorkflowComponents/types";
import type { GraphData } from "@/components/WorkflowComponents/types";

interface MeetingChatProps {
	isPending?: boolean;
	isWaitingForResponse?: boolean;
	setChatInput: (value: string) => void;
	handleSubmit: () => void;
	loadDocumentPanel: () => React.ReactNode;
}

export interface MeetingChatFormData {
	selectedMeetingTypeId: string;
	selectedMeetingInstanceId: string;
	meetingQuestion: string;
}

interface DocumentSectionProps {
	label: string;
	sectionKey: string;
	isOptional?: boolean;
	isPending: boolean;
	loadDocumentPanel: (sectionKey: string) => React.ReactNode;
	getSelectedDocuments: (sectionKey: string) => Array<{ id: string; name: string; extension: string; }>;
	removeDocument: (docId: string, sectionKey: string) => void;
}

const DocumentSection = React.memo(({ 
	label, 
	sectionKey,
	isOptional = false,
	isPending,
	loadDocumentPanel,
	getSelectedDocuments,
	removeDocument,
}: DocumentSectionProps): React.JSX.Element => {
	const selectedDocuments = getSelectedDocuments(sectionKey);
	
	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium text-gray-700">
				{label} {isOptional && <span className="text-gray-400">(optional)</span>}
			</Label>
			<div className="flex gap-3 items-start">
				<div className="flex-shrink-0">
					{loadDocumentPanel(sectionKey)}
				</div>
				<div className="flex-1 space-y-2">
					{selectedDocuments.length > 0 && (
						<div className="space-y-2">
							{selectedDocuments.map((doc) => (
								<div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border border-blue-200" key={doc.id}>
									<FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
									<span className="text-sm text-blue-900 truncate flex-1" title={doc.name}>
										{doc.name}
									</span>
									<Button
										className="h-6 w-6 p-0 hover:bg-blue-200"
										disabled={isPending}
										onClick={() => removeDocument(doc.id, sectionKey)}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-3 w-3 text-blue-600" />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

DocumentSection.displayName = "DocumentSection";

export default function MeetingChat({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
	loadDocumentPanel: _loadDocumentPanel,
}: MeetingChatProps): React.JSX.Element {
	const { selectedContexts, setSelectedContexts, setSidePanel, setCollapsed, setChatContext, setMeetingChatTags, selectedMeetingId, setSelectedMeetingId, isFromMeetingInstance, meetingWorkflowData } = useChatStore();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));
	
	// Get workflow state and actions
	const { 
		graphs, 
		eventSchedule, 
		currentGraph, 
		currentResult, 
		setCurrentGraph, 
		setCurrentResult,
	} = useWorkflow((state) => ({
		graphs: state.graphs,
		eventSchedule: state.eventSchedule,
		currentGraph: state.currentGraph,
		currentResult: state.currentResult,
		setCurrentGraph: state.setCurrentGraph,
		setCurrentResult: state.setCurrentResult,
	}));

	// Form state - initialize with current workflow selections or meetingWorkflowData
	const [formData, setFormData] = useState<MeetingChatFormData>({
		selectedMeetingTypeId: meetingWorkflowData?.meetingType?.id || currentGraph?.id || "",
		selectedMeetingInstanceId: meetingWorkflowData?.meetingInstance?.id || currentResult?.id || selectedMeetingId || "",
		meetingQuestion: "",
	});

	// Generate a unique form ID for this meeting chat instance
	const [formId] = useState(() => `meeting_chat_directive_${Date.now()}_${Math.random().toString(36)
		.substr(2, 9)}`);

	// Helper function to get section-specific context ID
	const getSectionContextId = useCallback((sectionKey: string) => {
		return `${formId}_${sectionKey}`;
	}, [formId]);

	// Helper function to get selected documents for a specific section
	const getSelectedDocuments = useCallback((sectionKey: string) => {
		const contextId = getSectionContextId(sectionKey);
		return selectedContexts[contextId] || [];
	}, [selectedContexts, getSectionContextId]);

	// Document panel component with section-specific configuration
	const loadDocumentPanelWithSection = useCallback((sectionKey: string) => {
		const contextId = getSectionContextId(sectionKey);
		const sectionDocuments = selectedContexts[contextId] || [];
		
		return (
			<Button
				className={clsx(
					"text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2",
					sectionDocuments.length > 0 && "text-indigo-500 bg-indigo-50/50",
				)}
				disabled={isPending}
				onClick={() => {
					setCollapsed(true);
					setSidePanel({
						isOpen: true,
						type: "folder",
						resourceId: contextId,
						contextId: contextId,
						title: `Select files for: ${sectionKey.replace("_", " ")}`,
					});
				}}
				size="sm"
				title={sectionDocuments.length > 0 ? `${sectionDocuments.length} file(s) selected` : "Add files"}
				type="button"
				variant="ghost"
			>
				<Paperclip className="h-4 w-4" />
			</Button>
		);
	}, [selectedContexts, setCollapsed, setSidePanel, getSectionContextId, isPending]);

	const removeDocument = useCallback((docId: string, sectionKey: string) => {
		const contextId = getSectionContextId(sectionKey);
		const sectionDocuments = selectedContexts[contextId] || [];
		const newContexts = sectionDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(contextId, newContexts);
	}, [selectedContexts, setSelectedContexts, getSectionContextId]);

	// Fetch available meetings - fallback to API query if not in workflow
	const { data: meetingsData, isLoading: isLoadingMeetings } = useQuery({
		queryKey: ["projectEvents"],
		queryFn: async() => {
			if (!session || !activeProject) return [];
			const result = await getProjectEvents({
				session: session,
				projectId: activeProject.project_id,
			});
			return result;
		},
		enabled: !!session && !!activeProject && !graphs, // Only query if graphs not available in workflow
	});

	// Use workflow graphs when available, fallback to API data
	const availableMeetingTypes = useMemo(() => {
		if (graphs) {
			// Use workflow graphs and filter for meetings
			return graphs.filter((graph: GraphData) => graph.event_type === "meeting");
		}
		
		// Fallback to API data
		if (!meetingsData) return [];
		return meetingsData
			.map((d: ProjectEvents) => d.project_events)
			.filter((graph: GraphData) => graph.event_type === "meeting");
	}, [graphs, meetingsData]);

	// isFromMeetingInstance is now managed by the chat store and set by MeetingChatFromMeetingInstance

	// Use meetingWorkflowData, currentGraph from workflow, or selected meeting type when available
	const selectedMeetingType = useMemo(() => {
		if (meetingWorkflowData?.meetingType) {
			return meetingWorkflowData.meetingType;
		}
		if (currentGraph && currentGraph.event_type === "meeting") {
			return currentGraph;
		}
		return availableMeetingTypes.find((meeting: GraphData) => meeting.id === formData.selectedMeetingTypeId);
	}, [meetingWorkflowData, currentGraph, availableMeetingTypes, formData.selectedMeetingTypeId]);

	// Use eventSchedule from workflow when available
	const availableMeetingInstances = useMemo(() => {
		let instances: EventResult[] = [];
		
		// Only proceed if we have a selected meeting type
		if (!selectedMeetingType) {
			return instances;
		}
		
		// If we have meetingWorkflowData with a specific meeting instance, prioritize that
		if (meetingWorkflowData?.meetingInstance && 
			meetingWorkflowData.meetingType?.id === selectedMeetingType.id) {
			instances.push(meetingWorkflowData.meetingInstance);
		}
		
		// First, try to get instances from the selected meeting type's event schedule
		if (selectedMeetingType.event_schedule) {
			selectedMeetingType.event_schedule.forEach((schedule: EventSchedule) => {
				if (schedule.event_result) {
					schedule.event_result.forEach((result) => {
						// Only add if not already present (to avoid duplicate from meetingWorkflowData)
						if (!instances.find((instance) => instance.id === result.id)) {
							instances.push(result);
						}
					});
				}
			});
		}
		
		// If we have a currentResult from workflow and it belongs to the selected meeting type, add it
		if (currentResult && 
			currentResult.event_id === selectedMeetingType.id && 
			!instances.find((instance) => instance.id === currentResult.id)) {
			instances.push(currentResult);
		}
		
		// If we have eventSchedule from workflow, merge those instances but only for the selected meeting type
		if (eventSchedule) {
			eventSchedule.forEach((schedule: EventSchedule) => {
				if (schedule.event_result) {
					schedule.event_result.forEach((result) => {
						// Only add if it belongs to the selected meeting type and is not already present
						if (result.event_id === selectedMeetingType.id && 
							!instances.find((instance) => instance.id === result.id)) {
							instances.push(result);
						}
					});
				}
			});
		}
		
		// Sort by run_time descending (most recent first)
		return instances.sort((a, b) => new Date(b.run_time).getTime() - new Date(a.run_time).getTime());
	}, [meetingWorkflowData, eventSchedule, selectedMeetingType, currentResult]);

	// Use meetingWorkflowData, currentResult from workflow, or selected meeting instance when available
	const selectedMeetingInstance = useMemo(() => {
		if (meetingWorkflowData?.meetingInstance) {
			return meetingWorkflowData.meetingInstance;
		}
		if (currentResult) {
			return currentResult;
		}
		return availableMeetingInstances.find((instance) => instance.id === formData.selectedMeetingInstanceId);
	}, [meetingWorkflowData, currentResult, availableMeetingInstances, formData.selectedMeetingInstanceId]);

	// Sync formData with workflow state when workflow state or meetingWorkflowData changes
	useEffect(() => {
		const workflowMeetingTypeId = meetingWorkflowData?.meetingType?.id || currentGraph?.id || "";
		const workflowMeetingInstanceId = meetingWorkflowData?.meetingInstance?.id || currentResult?.id || "";
		
		// Update form data if workflow state differs from current form state
		if (workflowMeetingTypeId !== formData.selectedMeetingTypeId || 
			workflowMeetingInstanceId !== formData.selectedMeetingInstanceId) {
			setFormData((prev) => ({
				...prev,
				selectedMeetingTypeId: workflowMeetingTypeId,
				selectedMeetingInstanceId: workflowMeetingInstanceId,
			}));
		}
	}, [currentGraph, currentResult, meetingWorkflowData, formData.selectedMeetingTypeId, formData.selectedMeetingInstanceId, availableMeetingInstances.length]);

	// Reset meeting instance selection when meeting type changes (only when manually changed)
	useEffect(() => {
		// Only reset if the meeting type changed manually (not from workflow sync) and not coming from meeting instance
		const workflowMeetingTypeId = meetingWorkflowData?.meetingType?.id || currentGraph?.id;
		const workflowMeetingInstanceId = meetingWorkflowData?.meetingInstance || currentResult;
		
		if (formData.selectedMeetingTypeId && 
			formData.selectedMeetingTypeId !== workflowMeetingTypeId &&
			!workflowMeetingInstanceId && 
			!isFromMeetingInstance) {
			setFormData((prev) => ({ ...prev, selectedMeetingInstanceId: "" }));
			// Clear workflow result and store when meeting type changes manually
			setCurrentResult(null);
			setSelectedMeetingId(null);
		}
	}, [formData.selectedMeetingTypeId, meetingWorkflowData, currentGraph?.id, currentResult, isFromMeetingInstance, setCurrentResult, setSelectedMeetingId]);

	// Generate the meeting context (without user question)
	const getMeetingContext = useCallback(() => {
		if (!selectedMeetingInstance || !selectedMeetingType) {
			return "";
		}

		let context = ":::context\nYou have been provided with a meeting transcript and additional context for analysis:\n\n";

		// Add meeting info
		context += `**Meeting Type: ${selectedMeetingType.name}**\n`;
		context += `**Meeting Instance: ${selectedMeetingInstance.name || "Meeting Instance"}**\n`;
		context += `**Date: ${selectedMeetingInstance.run_time ? new Date(selectedMeetingInstance.run_time).toLocaleDateString() : "Unknown date"}**\n\n`;

		// Find and add the transcript from meeting nodes
		const transcribeNode = selectedMeetingInstance.nodes?.find((node: NodeData) => node.id === "transcribe_meeting");
		const transcription = transcribeNode ? transcribeNode.output : "No transcription available";
		
		context += `**Transcript:**\n${transcription}\n\n`;

		// Add additional documents if any
		const additionalDocuments = getSelectedDocuments("additional");
		if (additionalDocuments.length > 0) {
			context += "**Additional Documents:**\n";
			additionalDocuments.forEach((doc) => {
				const attachment = {
					uuid: doc.id,
					name: doc.name,
					specialInstructions: "Please analyze this document in context of the meeting discussion.",
				};
				context += `\n::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		context += "**Please analyze the meeting content and answer questions based on the transcript and any additional documents provided.**\n:::\n";

		return context;
	}, [selectedMeetingInstance, selectedMeetingType, getSelectedDocuments]);

	const handleInputChange = useCallback((field: keyof MeetingChatFormData, value: string) => {
		// Don't allow changes to meeting selection when coming from meeting instance (but allow question input)
		if (isFromMeetingInstance && (field === "selectedMeetingTypeId" || field === "selectedMeetingInstanceId")) {
			return;
		}
		
		setFormData((prev) => ({ ...prev, [field]: value }));
		
		// Update workflow state when selections change
		if (field === "selectedMeetingTypeId") {
			const selectedGraph = availableMeetingTypes.find((graph: GraphData) => graph.id === value);
			setCurrentGraph(selectedGraph || null);
		}
		
		if (field === "selectedMeetingInstanceId") {
			const selectedInstance = availableMeetingInstances.find((instance) => instance.id === value);
			setCurrentResult(selectedInstance || null);
			setSelectedMeetingId(value || null);
		}
	}, [isFromMeetingInstance, setSelectedMeetingId, availableMeetingTypes, availableMeetingInstances, setCurrentGraph, setCurrentResult]);

	const handleFormSubmit = useCallback(() => {
		if (!selectedMeetingInstance || !selectedMeetingType || !formData.meetingQuestion.trim()) {
			return;
		}

		// Set meeting-specific tags
		setMeetingChatTags(selectedMeetingType.name);

		// Set the meeting context (without user question)
		const context = getMeetingContext();
		setChatContext(context);
		
		// Set just the user's question as the chat input
		setChatInput(formData.meetingQuestion.trim());

		// Submit the form
		handleSubmit();
	}, [selectedMeetingInstance, selectedMeetingType, formData.meetingQuestion, getMeetingContext, setChatContext, setChatInput, handleSubmit, setMeetingChatTags]);

	// Calculate total selected documents
	const totalSelectedDocuments = useMemo(() => {
		return getSelectedDocuments("additional").length;
	}, [getSelectedDocuments]);

	const isFormValid = formData.selectedMeetingTypeId && formData.selectedMeetingInstanceId && formData.meetingQuestion.trim();

	return (
		<ScrollArea className="container space-y-6 bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-full max-w-2xl mx-auto">
			<div className="text-center mb-6 ">
				<div className="flex items-center justify-center gap-2 mb-3">
					<MessageSquare className="h-8 w-8 " />
				</div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Meeting Assistant
				</h3>
				<p className="text-sm text-gray-600 mb-2">
					{isFromMeetingInstance 
						? "Ask questions about this meeting's transcript and discussion"
						: "Select a meeting and ask questions about the transcript and discussion"
					}
				</p>
				{totalSelectedDocuments > 0 && (
					<p className="text-xs text-blue-600 mt-2">
						{totalSelectedDocuments} additional document{totalSelectedDocuments !== 1 ? "s" : ""} selected
					</p>
				)}
			</div>
			<div className="space-y-6 p-2">
				{/* Meeting Type Selection */}
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						{isFromMeetingInstance ? "Selected Meeting" : "Select Meeting"} <span className="text-red-500">*</span>
					</Label>
					<Select
						disabled={isPending || isLoadingMeetings || isFromMeetingInstance}
						onValueChange={(value) => handleInputChange("selectedMeetingTypeId", value)}
						value={formData.selectedMeetingTypeId}
					>
						<SelectTrigger
							className={clsx(
								"w-full",
								isFromMeetingInstance && "bg-gray-50 cursor-not-allowed",
							)}
						>
							<SelectValue placeholder={isLoadingMeetings ? "Loading meeting types..." : "Choose a meeting "} />
						</SelectTrigger>
						<SelectContent>
							{availableMeetingTypes.map((meetingType: GraphData) => (
								<SelectItem key={meetingType.id} value={meetingType.id}>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-green-600" />
										<div>
											<div className="font-medium">{meetingType.name}</div>
											<div className="text-xs text-gray-500">
												{meetingType.description || "Meeting series"}
											</div>
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{selectedMeetingType && <div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						{isFromMeetingInstance ? "Selected Meeting Date" : "Select Meeting Date"} <span className="text-red-500">*</span>
					</Label>
					<Select
						disabled={isPending || availableMeetingInstances.length === 0 || isFromMeetingInstance}
						onValueChange={(value) => handleInputChange("selectedMeetingInstanceId", value)}
						value={formData.selectedMeetingInstanceId}
					>
						<SelectTrigger
							className={clsx(
								"w-full",
								isFromMeetingInstance && "bg-gray-50 cursor-not-allowed",
							)}
						>
							<SelectValue 
								placeholder={
									availableMeetingInstances.length === 0 
										? "No meeting instances available" 
										: "Choose a specific meeting instance"
								} 
							/>
						</SelectTrigger>
						<SelectContent>
							{availableMeetingInstances.map((instance) => (
								<SelectItem key={instance.id} value={instance.id}>
									<div className="flex items-center gap-2">
										<MessageSquare className="h-4 w-4 text-blue-600" />
										<div>
											<div className="font-medium">
												{instance.name || `Meeting from ${new Date(instance.run_time).toLocaleDateString()}`}
											</div>
											<div className="text-xs text-gray-500">
												{new Date(instance.run_time).toLocaleDateString()} • Status: {instance.status}
											</div>
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>}
				{selectedMeetingInstance && selectedMeetingType && <div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<MessageSquare className="h-4 w-4 text-green-600" />
						<Label className="text-sm font-medium text-green-800">
								Meeting Selected: {selectedMeetingType.name}
						</Label>
					</div>
					<p className="text-xs text-green-700 mb-2">
						<strong>Instance:</strong> {selectedMeetingInstance.name || "Meeting Instance"} ({new Date(selectedMeetingInstance.run_time).toLocaleDateString()})
					</p>
					<p className="text-xs text-green-700">
							Meeting transcript and context will be automatically loaded for your questions.
					</p>
				</div>}
				<DocumentSection
					getSelectedDocuments={getSelectedDocuments}
					isOptional
					isPending={isPending}
					label="Additional documents to analyze with the meeting transcript"
					loadDocumentPanel={loadDocumentPanelWithSection}
					removeDocument={removeDocument}
					sectionKey="additional"
				/>
				<div className="space-y-3">
					<Label className="text-sm font-medium text-gray-700">
						Your question about the meeting <span className="text-red-500">*</span>
					</Label>
					<Textarea
						className="min-h-20 resize-none"
						disabled={isPending}
						onChange={(e) => handleInputChange("meetingQuestion", e.target.value)}
						placeholder="Ask a question about the meeting transcript, action items, decisions made, or any other aspect of the meeting..."
						value={formData.meetingQuestion}
					/>
				</div>
			</div>
			<div className="flex justify-end pt-4 border-t border-gray-100">
				<Button
					className="bg-indigo-500 hover:bg-indigo-600 text-white px-6"
					disabled={isWaitingForResponse || !isFormValid}
					onClick={handleFormSubmit}
				>
					{isWaitingForResponse ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Processing...
						</>
					) : (
						<>
							Ask Question
							<CornerDownLeft className="h-4 w-4 ml-2" />
						</>
					)}
				</Button>
			</div>
		</ScrollArea>
	);
}