import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CornerDownLeft, Loader2, MessageSquare, Calendar } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore, useViewStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import { DocTextArea, DocRefButton, InlineDocRef } from "./DocComponents";
import ModelSelector from "../../../../components/ModelSelector";
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

export default function MeetingChat({
	isPending = false,
	isWaitingForResponse = false,
	setChatInput,
	handleSubmit,
}: MeetingChatProps): React.JSX.Element {
	const { selectedContexts, setSelectedContexts, setSidePanel, setCollapsed, setChatContext, setMeetingChatTags, selectedMeetingId, setSelectedMeetingId, isFromMeetingInstance, meetingWorkflowData } = useChatStore();
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));
	const { preferredModel, setPreferredModel, preferredAgentType } = useViewStore();
	
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

	const [formData, setFormData] = useState<MeetingChatFormData>({
		selectedMeetingTypeId: meetingWorkflowData?.meetingType?.id || currentGraph?.id || meetingWorkflowData?.meetingInstance?.event_id || currentResult?.event_id || "",
		selectedMeetingInstanceId: meetingWorkflowData?.meetingInstance?.id || currentResult?.id || selectedMeetingId || "",
		meetingQuestion: "",
	});



	const [formId] = useState(() => `meeting_chat_directive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

	const getSectionContextId = useCallback((sectionKey: string) => {
		return `${formId}_${sectionKey}`;
	}, [formId]);

	const getSelectedDocuments = useCallback((sectionKey: string) => {
		const contextId = getSectionContextId(sectionKey);
		return selectedContexts[contextId] || [];
	}, [selectedContexts, getSectionContextId]);

	const openDocumentPanel = useCallback((sectionKey: string, title: string) => {
		const contextId = getSectionContextId(sectionKey);
		setCollapsed(true);
		setSidePanel({
			isOpen: true,
			type: "folder",
			resourceId: contextId,
			contextId: contextId,
			title: title,
		});
	}, [setCollapsed, setSidePanel, getSectionContextId]);

	const removeDocument = useCallback((docId: string, sectionKey: string) => {
		const contextId = getSectionContextId(sectionKey);
		const sectionDocuments = selectedContexts[contextId] || [];
		const newContexts = sectionDocuments.filter((doc) => doc.id !== docId);
		setSelectedContexts(contextId, newContexts);
	}, [selectedContexts, setSelectedContexts, getSectionContextId]);

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
		enabled: !!session && !!activeProject && !graphs,
	});

	const availableMeetingTypes = useMemo(() => {
		let meetingTypes: GraphData[] = [];
		
		// Include meeting type from meetingWorkflowData if available (from ResultViewer)
		if (meetingWorkflowData?.meetingType) {
			meetingTypes.push(meetingWorkflowData.meetingType);
		} else if (meetingWorkflowData?.meetingInstance?.event_id) {
			// If meetingType is null but we have meetingInstance, construct a minimal meeting type
			// This happens when coming from ResultViewer and graphs is not populated
			const instance = meetingWorkflowData.meetingInstance;
			const minimalMeetingType = {
				id: instance.event_id,
				name: instance.event_name || instance.name || "Meeting",
				event_type: "meeting" as const,
				description: "",
			} as GraphData;
			meetingTypes.push(minimalMeetingType);
		}
		
		if (graphs) {
			const graphMeetings = graphs.filter((graph: GraphData) => graph.event_type === "meeting");
			// Add graphs that aren't already in the list
			graphMeetings.forEach((graph) => {
				if (!meetingTypes.find((m) => m.id === graph.id)) {
					meetingTypes.push(graph);
				}
			});
			return meetingTypes;
		}
		
		if (meetingsData) {
			const dataMeetings = meetingsData
				.map((d: ProjectEvents) => d.project_events)
				.filter((graph: GraphData) => graph.event_type === "meeting");
			// Add meetings that aren't already in the list
			dataMeetings.forEach((graph: GraphData) => {
				if (!meetingTypes.find((m) => m.id === graph.id)) {
					meetingTypes.push(graph);
				}
			});
		}
		
		return meetingTypes;
	}, [graphs, meetingsData, meetingWorkflowData?.meetingType, meetingWorkflowData?.meetingInstance]);

	const selectedMeetingType = useMemo(() => {
		if (meetingWorkflowData?.meetingType) {
			return meetingWorkflowData.meetingType;
		}
		if (currentGraph && currentGraph.event_type === "meeting") {
			return currentGraph;
		}
		// Try to find by formData.selectedMeetingTypeId first
		const byFormId = availableMeetingTypes.find((meeting: GraphData) => meeting.id === formData.selectedMeetingTypeId);
		if (byFormId) return byFormId;
		
		// Fallback: try to find by currentResult.event_id (useful when coming from ResultViewer)
		if (currentResult?.event_id) {
			const byEventId = availableMeetingTypes.find((meeting: GraphData) => meeting.id === currentResult.event_id);
			if (byEventId) return byEventId;
		}
		
		// Fallback: try to find by meetingWorkflowData.meetingInstance.event_id
		if (meetingWorkflowData?.meetingInstance?.event_id) {
			const byInstanceEventId = availableMeetingTypes.find((meeting: GraphData) => meeting.id === meetingWorkflowData.meetingInstance.event_id);
			if (byInstanceEventId) return byInstanceEventId;
		}
		
		return undefined;
	}, [meetingWorkflowData, currentGraph, availableMeetingTypes, formData.selectedMeetingTypeId, currentResult?.event_id]);

	const availableMeetingInstances = useMemo(() => {
		let instances: EventResult[] = [];
		
		if (!selectedMeetingType) {
			return instances;
		}
		
		// Include instance from meetingWorkflowData if it matches the selected meeting type
		// Check both meetingType.id and meetingInstance.event_id since meetingType might be null
		if (meetingWorkflowData?.meetingInstance && 
			(meetingWorkflowData.meetingType?.id === selectedMeetingType.id ||
			 meetingWorkflowData.meetingInstance.event_id === selectedMeetingType.id)) {
			instances.push(meetingWorkflowData.meetingInstance);
		}
		
		if (selectedMeetingType.event_schedule) {
			const schedule = selectedMeetingType.event_schedule;
				if (schedule.event_result) {
					schedule.event_result.forEach((result: EventResult) => {
						instances.push(result);
					});
				}
		}
		
		if (currentResult && 
			currentResult.event_id === selectedMeetingType.id && 
			!instances.find((instance) => instance.id === currentResult.id)) {
			instances.push(currentResult);
		}
		
		if (eventSchedule) {
			eventSchedule.forEach((schedule: EventSchedule) => {
				if (schedule.event_result) {
					schedule.event_result.forEach((result) => {
						if (result.event_id === selectedMeetingType.id && 
							!instances.find((instance) => instance.id === result.id)) {
							instances.push(result);
						}
					});
				}
			});
		}
		
		return instances.sort((a, b) => new Date(b.run_time).getTime() - new Date(a.run_time).getTime());
	}, [meetingWorkflowData, eventSchedule, selectedMeetingType, currentResult]);

	const selectedMeetingInstance = useMemo(() => {
		if (meetingWorkflowData?.meetingInstance) {
			return meetingWorkflowData.meetingInstance;
		}
		if (currentResult) {
			return currentResult;
		}
		return availableMeetingInstances.find((instance) => instance.id === formData.selectedMeetingInstanceId);
	}, [meetingWorkflowData, currentResult, availableMeetingInstances, formData.selectedMeetingInstanceId]);

	useEffect(() => {
		// Use event_id from currentResult or meetingInstance as fallback when meetingWorkflowData.meetingType and currentGraph are not available
		const workflowMeetingTypeId = meetingWorkflowData?.meetingType?.id || currentGraph?.id || meetingWorkflowData?.meetingInstance?.event_id || currentResult?.event_id || "";
		const workflowMeetingInstanceId = meetingWorkflowData?.meetingInstance?.id || currentResult?.id || "";
		
		if (workflowMeetingTypeId !== formData.selectedMeetingTypeId || 
			workflowMeetingInstanceId !== formData.selectedMeetingInstanceId) {
			setFormData((prev) => ({
				...prev,
				selectedMeetingTypeId: workflowMeetingTypeId,
				selectedMeetingInstanceId: workflowMeetingInstanceId,
			}));
		}
	}, [currentGraph, currentResult, meetingWorkflowData, formData.selectedMeetingTypeId, formData.selectedMeetingInstanceId, availableMeetingInstances.length]);

	useEffect(() => {
		const workflowMeetingTypeId = meetingWorkflowData?.meetingType?.id || currentGraph?.id || currentResult?.event_id;
		const workflowMeetingInstanceId = meetingWorkflowData?.meetingInstance || currentResult;
		
		if (formData.selectedMeetingTypeId && 
			formData.selectedMeetingTypeId !== workflowMeetingTypeId &&
			!workflowMeetingInstanceId && 
			!isFromMeetingInstance) {
			setFormData((prev) => ({ ...prev, selectedMeetingInstanceId: "" }));
			setCurrentResult(null);
			setSelectedMeetingId(null);
		}
	}, [formData.selectedMeetingTypeId, meetingWorkflowData, currentGraph?.id, currentResult, isFromMeetingInstance, setCurrentResult, setSelectedMeetingId]);

	const getMeetingContext = useCallback(() => {
		if (!selectedMeetingInstance || !selectedMeetingType) {
			return "";
		}

		// Get transcript - prioritize raw_transcript_data from record_meeting node
		const recordingNode = selectedMeetingInstance.nodes?.find((node: NodeData) => 
			node.id.toLowerCase().includes("record_meeting")
		);
		const rawTranscriptData = recordingNode?.output?.raw_transcript_data;
		
		let transcription = "No transcription available";
		
		if (rawTranscriptData && Array.isArray(rawTranscriptData) && rawTranscriptData.length > 0) {
			// Format raw transcript data into readable text
			const formattedTranscript: string[] = [];
			let currentParticipant = "";
			let currentText: string[] = [];
			
			rawTranscriptData.forEach((entry: any) => {
				const participantName = entry.participant?.name || "Unknown";
				const words = entry.words?.map((w: any) => w.text || w.word || "").join(" ") || "";
				
				if (participantName !== currentParticipant) {
					if (currentParticipant && currentText.length > 0) {
						formattedTranscript.push(`${currentParticipant}: ${currentText.join(" ")}`);
					}
					currentParticipant = participantName;
					currentText = [words];
				} else {
					currentText.push(words);
				}
			});
			
			if (currentParticipant && currentText.length > 0) {
				formattedTranscript.push(`${currentParticipant}: ${currentText.join(" ")}`);
			}
			
			transcription = formattedTranscript.join(" | ");
		} else {
			// Fallback to transcribe_meeting node output
			const transcribeNode = selectedMeetingInstance.nodes?.find((node: NodeData) => 
				node.id.toLowerCase().includes("transcribe_meeting")
			);
			if (transcribeNode?.output) {
				if (typeof transcribeNode.output === "string") {
					transcription = transcribeNode.output;
				} else if (transcribeNode.output.text) {
					transcription = transcribeNode.output.text;
				} else if (transcribeNode.output.transcript) {
					transcription = transcribeNode.output.transcript;
				}
			}
		}

		// Build context using :::context for collapsible UI - keep it on minimal lines
		const meetingDate = selectedMeetingInstance.run_time ? new Date(selectedMeetingInstance.run_time).toLocaleDateString() : "Unknown date";
		let context = `:::context\nMeeting "${selectedMeetingType.name}" - "${selectedMeetingInstance.name || "Meeting Instance"}" on ${meetingDate}. Transcript: ${transcription}\n:::\n\n`;

		// Add additional documents as attachments OUTSIDE the :::context block
		const additionalDocuments = getSelectedDocuments("additional");
		if (additionalDocuments.length > 0) {
			additionalDocuments.forEach((doc) => {
				const attachment = {
					uuid: doc.id,
					name: doc.name,
					specialInstructions: "Please analyze this document in context of the meeting discussion.",
				};
				context += `::attachments[[${JSON.stringify(attachment)}]]\n`;
			});
		}

		return context;
	}, [selectedMeetingInstance, selectedMeetingType, getSelectedDocuments]);

	const handleInputChange = useCallback((field: keyof MeetingChatFormData, value: string) => {
		if (isFromMeetingInstance && (field === "selectedMeetingTypeId" || field === "selectedMeetingInstanceId")) {
			return;
		}
		
		setFormData((prev) => ({ ...prev, [field]: value }));
		
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

		setMeetingChatTags(selectedMeetingType.name);

		const context = getMeetingContext();
		setChatContext(context);
		
		setChatInput(formData.meetingQuestion.trim());

		handleSubmit();
	}, [selectedMeetingInstance, selectedMeetingType, formData.meetingQuestion, getMeetingContext, setChatContext, setChatInput, handleSubmit, setMeetingChatTags]);

	const totalSelectedDocuments = useMemo(() => {
		return getSelectedDocuments("additional").length;
	}, [getSelectedDocuments]);

	const isFormValid = formData.selectedMeetingTypeId && formData.selectedMeetingInstanceId && formData.meetingQuestion.trim();

	return (
		<div className="max-w-[816px] mx-auto bg-white shadow-sm border border-gray-200 min-h-[900px]">
			{/* Document content */}
			<div className="px-12 py-10 lg:px-16 lg:py-12">
				{/* Document Title */}
				<div className="flex items-center gap-3 mb-4">
					<MessageSquare className="h-8 w-8 text-slate-600" />
					<h1 className="text-3xl font-normal text-gray-900">
						Meeting Assistant
					</h1>
				</div>

				{/* Description */}
				<p className="text-gray-600 mb-10 leading-relaxed">
					{isFromMeetingInstance 
						? "Ask questions about this meeting's transcript and discussion"
						: "Select a meeting and ask questions about the transcript and discussion"
					}
				</p>

				{/* Meeting Type Selection */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						{isFromMeetingInstance ? "Selected Meeting" : "Select Meeting"}
					</h2>
					{meetingWorkflowData?.meetingInstance && (
						<div className="mb-4">
							<p className="text-sm text-gray-500">
								Selected Meeting Instance: {meetingWorkflowData.meetingInstance.name}
							</p>
						</div>
					)}
					<Select
						disabled={isPending || isLoadingMeetings || isFromMeetingInstance}
						onValueChange={(value) => handleInputChange("selectedMeetingTypeId", value)}
						value={formData.selectedMeetingTypeId}
					>
						<SelectTrigger className={clsx(
							"w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 shadow-none px-0",
							isFromMeetingInstance && "bg-gray-50 cursor-not-allowed"
						)}>
							<SelectValue placeholder={isLoadingMeetings ? "Loading meeting types..." : "Choose a meeting"} />
						</SelectTrigger>
						<SelectContent>
							{availableMeetingTypes.map((meetingType: GraphData) => (
								<SelectItem key={meetingType.id} value={meetingType.id}>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-slate-600" />
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

				{/* Meeting Instance Selection */}
				{selectedMeetingType && (
					<div className="mb-8">
						<h2 className="text-base font-semibold italic text-gray-900 mb-4">
							{isFromMeetingInstance ? "Selected Meeting Date" : "Select Meeting Date"}
						</h2>
						<Select
							disabled={isPending || availableMeetingInstances.length === 0 || isFromMeetingInstance}
							onValueChange={(value) => handleInputChange("selectedMeetingInstanceId", value)}
							value={formData.selectedMeetingInstanceId}
						>
							<SelectTrigger className={clsx(
								"w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 shadow-none px-0",
								isFromMeetingInstance && "bg-gray-50 cursor-not-allowed"
							)}>
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
											<MessageSquare className="h-4 w-4 text-slate-600" />
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
					</div>
				)}

				{/* Meeting Selected Info */}
				{selectedMeetingInstance && selectedMeetingType && (
					<div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded">
						<div className="flex items-center gap-2 mb-2">
							<MessageSquare className="h-4 w-4 text-slate-600" />
							<span className="text-sm font-medium text-slate-800">
								Meeting Selected: {selectedMeetingType.name}
							</span>
						</div>
						<p className="text-xs text-slate-700 mb-1">
							<strong>Instance:</strong> {selectedMeetingInstance.name || "Meeting Instance"} ({new Date(selectedMeetingInstance.run_time).toLocaleDateString()})
						</p>
						<p className="text-xs text-slate-600">
							Meeting transcript and context will be automatically loaded for your questions.
						</p>
					</div>
				)}

				{/* Additional Documents */}
				<div className="mb-8">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Additional documents to analyze <span className="text-gray-400 font-normal">(optional)</span>
					</h2>
					<div className="flex items-start gap-2">
					<DocRefButton
						onClick={() => openDocumentPanel("additional", "Select Additional Documents")}
						hasDocuments={totalSelectedDocuments > 0}
						disabled={isPending}
						label="Select documents"
						colorTheme="slate"
					/>
				</div>
				<InlineDocRef
					documents={getSelectedDocuments("additional")}
					onRemove={(id) => removeDocument(id, "additional")}
					disabled={isPending}
					colorTheme="slate"
					layout="stacked"
				/>
				</div>

				{/* Question Input */}
				<div className="mb-12">
					<h2 className="text-base font-semibold italic text-gray-900 mb-4">
						Your question about the meeting
					</h2>
				<DocTextArea
					value={formData.meetingQuestion}
					onChange={(value) => handleInputChange("meetingQuestion", value)}
					placeholder="Ask a question about the meeting transcript, action items, decisions made, or any other aspect of the meeting..."
					disabled={isPending}
					minHeight={60}
					rows={2}
				/>
				</div>

				{/* Status and submit */}
				<div className="pt-6 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-500">
							{totalSelectedDocuments > 0 && (
								<span>{totalSelectedDocuments} additional document{totalSelectedDocuments !== 1 ? "s" : ""} selected</span>
							)}
						</div>
						<div className="flex items-center gap-3">
							<ModelSelector 
								selectedModel={preferredModel}
								onModelChange={setPreferredModel}
								selectedAgentType={preferredAgentType}
							/>
							<Button
								onClick={handleFormSubmit}
								disabled={isWaitingForResponse || !isFormValid}
								className="bg-slate-600 hover:bg-slate-700 text-white px-6"
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
					</div>
				</div>
			</div>
		</div>
	);
}
