import React, { useState, useEffect, useMemo } from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	Loader2,
	Video,
	Mic,
	Edit3,
	List,
	FileText,
	MessageSquare,
	LogsIcon,
	CheckCircle2,
	AlertCircle,
	Clock,
	ArrowRight,
} from "lucide-react";
import ActionItemViewer from "@/components/AiActions/ActionItemViewer";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import { renderJsonValue } from "./utils";
import { Button } from "@/components/ui/button";
import type { NodeData, ActionData, EventResult } from "./types";
import { useStore } from "@/utils/store";

import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";

import WorkflowInputForm from "./WorkflowInputform";
import { ScrollArea } from "@/components/ui/scroll-area";
interface ResultViewerProps {
  currentResult: EventResult;
  cacheId?: string;
  activeTab?: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
	currentResult,
	cacheId,
	activeTab,
}) => {
	const projectId = useStore((state) => state.activeProject?.project_id);
	const session = useStore((state) => state.session);
	

	// Update how we determine if a workflow is running
	// A workflow is running if:
	// 1. It has a workflow_id AND status is not "completed", OR
	// 2. It has the listen flag set (waiting for input)
	const isWorkflowRunning =
    (!!currentResult?.workflow_id && currentResult.status !== "completed") ||
    !!currentResult?.listen;

	const [pendingEvent, setPendingEvent] = useState(true);
	const [showLogs, setShowLogs] = useState(false);

	// Get the current node based on activeTab
	const detailView = useMemo(() => {
		if (!activeTab || !currentResult?.nodes) return null;
		
		// Handle synthetic meeting_recording tab
		if (activeTab === "meeting_recording") {
			const videoNode = currentResult.nodes.find((node) => 
				node.id.toLowerCase().includes("record_meeting"),
			);
			const transcriptionNode = currentResult.nodes.find((node) => 
				node.id.toLowerCase().includes("transcribe_meeting"),
			);
			
			// Create synthetic meeting recording node
			return {
				id: "meeting_recording",
				title: "Meeting Recording",
				status: videoNode?.status || transcriptionNode?.status || "pending",
				output: null,
				videoNode,
				transcriptionNode,
			} as any;
		}
		
		return currentResult.nodes.find((node) => node.id === activeTab) || null;
	}, [activeTab, currentResult?.nodes]);

	return (
		<>
			{/* Workflow Status Summary */}
			<div className="flex flex-col w-full ">
				{currentResult?.listen && (
					<div className="p-4 mb-6 border-2 border-yellow-500 bg-yellow-50 rounded-lg">
						{currentResult.workflow_id && projectId && (
							<>
								{pendingEvent	? (
									<WorkflowInputForm
										cacheId={cacheId}
										eventId={currentResult.event_id}
										projectId={projectId}
										resultId={currentResult.id}
										setPendingEvent={setPendingEvent}
									/>
								) : (
									<div className="flex items-center gap-2 text-gray-500">
										<Loader2 className="h-4 w-4 animate-[heartbeat_1.5s_ease-in-out_infinite]" />
										<span>
										Reading through attached files and your instructions
										</span>
									</div>
								)}
							</>
						)}
					</div>
				)}
				{session?.access_token && currentResult?.streaming && (
					<div className="mb-6">
						<div className="border rounded-lg overflow-hidden relative border-l-green-500 border-l-4">
							<div className="relative">
				
								<div className="p-4 flex items-center justify-between bg-white">
									<div className="flex items-center gap-2">
										<LogsIcon className="h-5 w-5 text-gray-600" />
										<h3 className="font-medium">Logs</h3>
									</div>
									<Button
										className="h-7 px-2"
										onClick={() => setShowLogs(!showLogs)}
										size="sm"
										variant="outline"
									>
										{showLogs ? "Hide Logs" : "Show Logs"}
									</Button>
								</div>
							</div>
							{showLogs && (
								<div className="border-t">
									<div className="max-h-[80vh] overflow-y-auto p-4">
										<StreamComponent
											authToken={session.access_token}
											streamingKey={currentResult.id}
										/>
									</div>
								</div>
							)}
							<div className="h-1 w-full bg-gray-100 overflow-hidden">
								<div
									className="h-1 w-full bg-gradient-to-r from-blue-100 to-purple-200 absolute"
									style={{
										animation: "progressLine 10s ease-in-out infinite",
									}}
								/>
							</div>
						</div>
	
					</div>
				)}
			</div>
			{/* Workflow Details */}
			{!currentResult?.listen && !currentResult?.streaming && <div className="h-full min-h-0 overflow-hidden">
				{/* Node Details - Full Width */}
				<div className="w-full h-full min-h-0">
					{detailView ? (
						<div className="animate-fadeIn h-full min-h-0 overflow-hidden p-3">
							<div className="h-full overflow-auto">
								{renderNodeContent(detailView)}
							</div>
						</div>
					) : (
						<div className="h-full flex items-center justify-center text-gray-500 p-8">
							<div className="text-center">
								<FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
								<p>Select a step from the timeline to view details</p>
							</div>
						</div>
					)}
				</div>
			</div> }
		</>
	);
};









const renderMeetingRecording = (combinedNode: any): React.ReactNode => {
	const hasVideo = combinedNode.videoNode && combinedNode.videoNode.output?.url;
	const hasTranscription = combinedNode.transcriptionNode && combinedNode.transcriptionNode.output;
	
	if (!hasVideo && !hasTranscription) {
		return (
			<div className="flex items-center justify-center h-full text-gray-500">
				<div className="text-center">
					<Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
					<p>Meeting recording not available</p>
				</div>
			</div>
		);
	}
	
	return (
		<div className="flex flex-col h-full">
			{hasVideo && (
				<div className="flex-shrink-0 mb-4">
					<h3 className="text-lg font-medium mb-3">Meeting Video</h3>
					<div className="max-w-2xl mx-auto">
						<AspectRatio className="bg-gray-100 rounded-lg overflow-hidden" ratio={16 / 9}>
							<video className="w-full h-full" controls>
								<source src={combinedNode.videoNode.output.url} type="video/mp4" />
								Your browser does not support the video tag
							</video>
						</AspectRatio>
					</div>
				</div>
			)}
			{hasTranscription && (
				<ScrollArea className="flex-1 h-32">
					<h3 className="text-lg font-medium mb-3">Transcription</h3>
					<div className="bg-gray-50 rounded-lg p-3 h-full overflow-auto">
						{typeof combinedNode.transcriptionNode.output === "string" ? (
							<MarkDownDisplay content={combinedNode.transcriptionNode.output} />
						) : (
							<div>{renderJsonValue(combinedNode.transcriptionNode.output)}</div>
						)}
					</div>
				</ScrollArea>
			)}
		</div>
	);
};

const renderNodeContent = (node: NodeData): React.ReactNode => {
	const nodeId = node.id.toLowerCase();
	switch (nodeId) {
		case "join_meeting":
			return typeof node.output === "string" ? (
				<div className="h-full overflow-auto">
					<div className="text-sm text-gray-700 whitespace-pre-line">
						<MarkDownDisplay content={node.output} />
					</div>
				</div>
			) : (
				<div className="h-full overflow-auto">
					<div className="bg-gray-50 p-4 rounded-lg">{renderJsonValue(node.output)}</div>
				</div>
			);

		case "meeting_recording":
			return renderMeetingRecording(node as any);

		case "record_meeting":
			return (
				typeof node.output === "object" && node.output?.url && (
					<AspectRatio className="m-4" ratio={16 / 9}>
						<video className="rounded-lg" controls>
							<source src={node.output.url} type="video/mp4" />
							Your browser does not support the video tag
						</video>
					</AspectRatio>
				)
			);

		case "transcribe_meeting":
			return typeof node.output === "string" ? (
				<div className="text-sm text-gray-700 whitespace-pre-line">
					<MarkDownDisplay content={node.output} />
				</div>
			) : (
				<div className="bg-gray-50">{renderJsonValue(node.output)}</div>
			);

		case "determine_action_items":
			return (
				<div className="h-full overflow-auto">
					<ActionItemViewer results={node.output as ActionData} />
				</div>
			);

		case "save_minutes_in_project_documents":
			return (
				<div className="h-full overflow-auto">
					<ResourceTextViewer resource_id={node.output?.resource_id} showComments />
				</div>
			);

		case "distribute_meeting_minutes":
			return typeof node.output === "string" ? (
				<div className="h-full overflow-auto">
					<div className="text-sm text-gray-700 whitespace-pre-line">
						<MarkDownDisplay content={node.output} />
					</div>
				</div>
			) : node.output?.resource_id ? (
				<div className="h-full overflow-auto">
					<ResourceTextViewer resource_id={node.output.resource_id} />
				</div>
			) : (
				<div className="h-full overflow-auto">
					<div className="bg-gray-50 p-4 rounded-lg">{renderJsonValue(node.output)}</div>
				</div>
			);

		default:
			return typeof node.output === "string" ? (
				<div className="h-full overflow-auto">
					<div className="text-sm text-gray-700 whitespace-pre-line">
						<MarkDownDisplay content={node.output} />
					</div>
				</div>
			) : (
				<div className="h-full overflow-auto">
					<div className="bg-gray-50 p-4 rounded-lg">{renderJsonValue(node.output)}</div>
				</div>
			);
	}
};
