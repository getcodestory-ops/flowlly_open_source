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
		selectedMeetingTypeId: meetingWorkflowData?.meetingType?.id || currentGraph?.id || "",
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
		if (graphs) {
			return graphs.filter((graph: GraphData) => graph.event_type === "meeting");
		}
		
		if (!meetingsData) return [];
		return meetingsData
			.map((d: ProjectEvents) => d.project_events)
			.filter((graph: GraphData) => graph.event_type === "meeting");
	}, [graphs, meetingsData]);

	const selectedMeetingType = useMemo(() => {
		if (meetingWorkflowData?.meetingType) {
			return meetingWorkflowData.meetingType;
		}
		if (currentGraph && currentGraph.event_type === "meeting") {
			return currentGraph;
		}
		return availableMeetingTypes.find((meeting: GraphData) => meeting.id === formData.selectedMeetingTypeId);
	}, [meetingWorkflowData, currentGraph, availableMeetingTypes, formData.selectedMeetingTypeId]);

	const availableMeetingInstances = useMemo(() => {
		let instances: EventResult[] = [];
		
		if (!selectedMeetingType) {
			return instances;
		}
		
		if (meetingWorkflowData?.meetingInstance && 
			meetingWorkflowData.meetingType?.id === selectedMeetingType.id) {
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
		const workflowMeetingTypeId = meetingWorkflowData?.meetingType?.id || currentGraph?.id || "";
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
		const workflowMeetingTypeId = meetingWorkflowData?.meetingType?.id || currentGraph?.id;
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

		let context = ":::context\nYou have been provided with a meeting transcript and additional context for analysis:\n\n";

		context += `**Meeting Type: ${selectedMeetingType.name}**\n`;
		context += `**Meeting Instance: ${selectedMeetingInstance.name || "Meeting Instance"}**\n`;
		context += `**Date: ${selectedMeetingInstance.run_time ? new Date(selectedMeetingInstance.run_time).toLocaleDateString() : "Unknown date"}**\n\n`;

		const transcribeNode = selectedMeetingInstance.nodes?.find((node: NodeData) => node.id === "transcribe_meeting");
		const transcription = transcribeNode ? transcribeNode.output : "No transcription available";
		
		context += `**Transcript:**\n${transcription}\n\n`;

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
