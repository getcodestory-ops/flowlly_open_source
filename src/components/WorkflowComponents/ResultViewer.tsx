import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import ActionItemViewer from "@/components/AiActions/ActionItemViewer";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import { renderJsonValue } from "./utils";
import { Button } from "@/components/ui/button";
import type { NodeData, ActionData, EventResult } from "./types";
import { useStore } from "@/utils/store";

import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
import {  triggerWorkflowNode } from "@/api/taskQueue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";
import PdfLoader from "./PdfLoader";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import WorkflowInputForm from "./WorkflowInputform";
interface ResultViewerProps {
  currentResult: EventResult;
  cacheId?: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
	currentResult,
	cacheId,
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
	const [detailView, setDetailView] = useState<NodeData | null>(null);

	// Add useEffect to select last node on mount
	useEffect(() => {
		if (currentResult?.nodes && currentResult.nodes.length > 0) {
			// First try to find save_minutes_in_project_documents node
			const saveMinutesNode = currentResult.nodes.find(
				(node) => node.id.toLowerCase() === "save_minutes_in_project_documents",
			);
			
			// If found, use it, otherwise fall back to last node
			const nodeToSelect = saveMinutesNode || currentResult.nodes[currentResult.nodes.length - 1];
			setDetailView(nodeToSelect);
		}
	}, [currentResult?.id]);

	return (
		<>
			{/* Workflow Status Summary */}
			<div className="flex flex-col w-full ">
				{currentResult?.listen && (
					<Card className="p-4 mb-6 border-2 border-yellow-500 shadow-md rounded-lg">
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
					</Card>
				)}
				{session?.access_token && currentResult?.streaming && (
					<div className="mb-6">
						<div className="border rounded-lg overflow-hidden relative border-l-green-500 border-l-4 shadow-sm">
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
									<div className="max-h-[400px] overflow-y-auto p-4">
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
			{!currentResult?.listen && !currentResult?.streaming && <div className="flex flex-row gap-6 h-full items-start">
				{/* Node Details */}
				<div className="w-full rounded-lg border shadow-sm h-full flex-1 flex-grow">
					{detailView ? (
						<div className="animate-fadeIn h-full">
							<div className="flex items-center justify-between p-4 border-b">
								<div className="flex items-center gap-2">
									{getNodeIcon(detailView)}
									<h3 className="font-medium text-lg">{detailView.title}</h3>
									<StatusBadge status={detailView.status} />
								</div>
								<NodeActions
									isWorkflowRunning={isWorkflowRunning}
									node={detailView}
									workflowId={currentResult.workflow_id || ""}
								/>
							</div>
							<div className="h-full flex-grow flex-1 overflow-auto p-0" style={{ maxHeight: "calc(100% - 65px)" }}>
								{renderNodeContent(detailView)}
							</div>
						</div>
					) : (
						<div className="h-full flex items-center justify-center text-gray-500 p-8 flex-1 flex-grow">
							<div className="text-center">
								<FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
								<p>Select a step from the timeline to view details</p>
							</div>
						</div>
					)}
				</div>
				{/* Workflow Steps Timeline */}
				<div className="rounded-lg border shadow-sm p-4 gap-4 flex flex-col" style={{ maxHeight: "100%" }}>
					<h3 className="text-lg font-medium px-2">Workflow Timeline</h3>
					<div className="flex-1 pl-4 overflow-y-auto">
						<Timeline
							currentResult={currentResult}
							detailView={detailView}
							isWorkflowRunning={isWorkflowRunning}
							setDetailView={setDetailView}
						/>
					</div>
				</div>
			</div> }
		</>
	);
};

interface TimelineProps {
	currentResult: EventResult;
	isWorkflowRunning: boolean;
	setDetailView: (_: NodeData) => void;
	detailView: NodeData | null;
}

const Timeline = ({ currentResult, isWorkflowRunning, setDetailView, detailView }: TimelineProps): React.ReactNode => {
	const nodes = currentResult?.nodes || [];
	return nodes.length > 0 ? nodes.map((node, index) => (
		<TimelineNode
			isFirst={index === 0}
			isLast={index === nodes.length - 1}
			isSelected={detailView?.id === node.id}
			isWorkflowRunning={isWorkflowRunning}
			key={node.id}
			node={node}
			onClick={() => setDetailView(node)}
			workflowId={currentResult.workflow_id || ""}
		/>
	)) : (
		<div className="text-center py-8 text-gray-500">
			<p>No workflow steps available</p>
		</div>
	);
};
{/* <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<div className="bg-purple-100 p-2 rounded-full">
									<FileText className="h-5 w-5 text-purple-800" />
								</div>
								<h2 className="text-xl font-semibold">
									{currentResult.name || "Workflow Result"}
								</h2>
							</div>
							<div className="flex items-center gap-3">
								<Badge
									className={cn(
										"px-3 py-1 text-sm font-medium rounded-full",
										isWorkflowRunning
											? "bg-purple-100 text-purple-800 border-purple-200"
											: "bg-green-100 text-green-800 border-green-200",
									)}
									variant="outline"
								>
									{isWorkflowRunning ? (
										<span className="flex items-center gap-1.5">
											<span className="relative flex h-2 w-2">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
											</span>
											Running
										</span>
									) : (
										<span className="flex items-center gap-1.5">
											<CheckCircle2 className="h-3.5 w-3.5" />
											Completed
										</span>
									)}
								</Badge>
								<div className="text-sm">
									{isWorkflowRunning ? (
										<span className="text-gray-600">
											{progressPercentage}% in progress
										</span>
									) : ((currentResult.status === "completed" || isImplicitlyCompleted) && (
										<span className="text-green-600 font-medium">
											100% complete
										</span>
									))}
								</div>
							</div>
						</div>
						<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
							<div
								className={`h-full ${
									hasFailedNodes
										? "bg-red-500"
										: isWorkflowRunning
											? "bg-blue-500"
											: "bg-green-500"
								}`}
								style={{
									width: `${isWorkflowRunning ? progressPercentage : 100}%`,
									transition: "width 0.5s ease-in-out",
								}}
							/>
						</div>
					</div> */}

interface TimelineNodeProps {
  node: NodeData;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onClick: () => void;
  workflowId: string;
  isWorkflowRunning: boolean;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({
	node,
	isLast,
	isSelected,
	onClick,
}) => {
	const getStatusIcon = (status: string) : React.ReactNode => {
		switch (status) {
			case "completed":
				return <CheckCircle2 className="h-5 w-5 text-green-600" />;
			case "failed":
				return <AlertCircle className="h-5 w-5 text-red-600" />;
			case "running":
				return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
			case "pending":
				return <Clock className="h-5 w-5 text-yellow-600" />;
			default:
				return <Clock className="h-5 w-5 text-gray-400" />;
		}
	};

	return (
		<div
			className={cn(
				"relative pl-10 pr-4 py-3 border-l-2 cursor-pointer",
				isSelected
					? "bg-blue-50 border-blue-500"
					: node.status === "completed"
						? "border-green-500"
						: node.status === "failed"
							? "border-red-500"
							: node.status === "running"
								? "border-blue-500"
								: "border-gray-300",
				!isLast && "pb-5",
				"hover:bg-gray-50 transition-colors duration-200",
			)}
			onClick={onClick}
		>
			{/* Status Circle */}
			<div
				className={cn(
					"absolute left-[-8px] w-4 h-4 rounded-full border-2",
					node.status === "completed"
						? "bg-green-100 border-green-500"
						: node.status === "failed"
							? "bg-red-100 border-red-500"
							: node.status === "running"
								? "bg-blue-100 border-blue-500"
								: "bg-gray-100 border-gray-300",
				)}
			/>
			{/* Content */}
			<div className="flex justify-between items-start gap-2">
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						{getStatusIcon(node.status)}
						<span className="font-medium">{node.title}</span>
					</div>
					<span className="text-xs text-gray-500 mt-1">
						{node.status.charAt(0).toUpperCase() + node.status.slice(1)}
					</span>
				</div>
				<ArrowRight
					className={cn("h-4 w-4 text-gray-400 mt-1", isSelected && "text-blue-500")}
				/>
			</div>
			{/* Connecting line to next node */}
			{!isLast && (
				<div className="absolute left-[-6px] top-7 h-full border-l-2 border-dashed border-gray-300" />
			)}
		</div>
	);
};

interface NodeActionsProps {
  node: NodeData;
  workflowId: string;
  isWorkflowRunning: boolean;
}

const NodeActions: React.FC<NodeActionsProps> = ({
	node,
	workflowId,
	isWorkflowRunning,
}) => {
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const queryClient = useQueryClient();

	const { mutate: rerunNode, isPending: isRerunning } = useMutation({
		mutationFn: async() => {
			if (!session || !activeProject) throw new Error("No session or project");
			return triggerWorkflowNode({
				session,
				projectId: activeProject.project_id,
				workflowId,
				nodeId: node.id,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["eventResult"] });
		},
	});

	const canRerun =
    isWorkflowRunning &&
    (node.status === "failed" || (node.status === "completed" && workflowId));

	if (!canRerun) return null;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						className="h-8 px-3"
						disabled={isRerunning}
						onClick={() => rerunNode()}
						size="sm"
						variant="outline"
					>
						{isRerunning ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
						) : (
							<span className="flex items-center gap-1.5">
								<Loader2 className="h-3.5 w-3.5" />
								Rerun Step
							</span>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Reprocess this step with the same inputs</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const StatusBadge = ({ status }: { status: string }): React.ReactNode => {
	const getStatusColor = (): string => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			case "failed":
				return "bg-red-100 text-red-800 border-red-200";
			case "running":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<Badge
			className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor()}`}
			variant="outline"
		>
			{status}
		</Badge>
	);
};

// Returns an appropriate icon for the node based on its ID.
const getNodeIcon = (node: NodeData): React.ReactNode => {
	const nodeId = node.id.toLowerCase();
	switch (nodeId) {
		case "record_meeting":
			return <Video className="h-5 w-5 text-gray-600" />;
		case "transcribe_meeting":
			return <Mic className="h-5 w-5 text-gray-600" />;
		case "write_meeting_minutes":
			return <Edit3 className="h-5 w-5 text-gray-600" />;
		case "determine_action_items":
			return <List className="h-5 w-5 text-gray-600" />;
		case "save_document":
		case "save_minutes_in_project_documents":
			return <FileText className="h-5 w-5 text-gray-600" />;
		case "user_input":
			return <MessageSquare className="h-5 w-5 text-gray-600" />;
		case "report_generation":
			return <FileText className="h-5 w-5 text-gray-600" />;
		default:
			return <FileText className="h-5 w-5 text-gray-600" />;
	}
};

const renderNodeContent = (node: NodeData): React.ReactNode => {
	const nodeId = node.id.toLowerCase();
	switch (nodeId) {
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

		case "write_meeting_minutes":
			return <ContentEditor content={node.output} />;
		case "determine_action_items":
			return <ActionItemViewer results={node.output as ActionData} />;
		case "save_document":
		case "save_minutes_in_project_documents":
			return <ResourceTextViewer resource_id={node.output?.resource_id} />;
		case "workflow_logs":
		default:
			if (
				node.output &&
				typeof node.output === "object" &&
				"drawings" in node.output
			) {
				const drawings = node.output.drawings;
				const body = node.output.body || "";
				return Array.isArray(drawings) ? (
					<>
						<p className="text-sm text-gray-700 whitespace-pre-line my-2">
							{body}
						</p>
						<PdfLoader drawings={drawings} />
					</>
				) : (
					<div className="text-sm text-gray-700">Invalid drawings format</div>
				);
			}

			return typeof node.output === "string" ? (
				<div className="text-sm text-gray-700 whitespace-pre-line">
					<MarkDownDisplay content={node.output} />
				</div>
			) : node.output?.report_path || node.output?.resource_id ? (
				<ResourceTextViewer
					key={node.output?.report_path || node.output?.resource_id}
					resource_id={node.output?.report_path || node.output?.resource_id}
				/>
			) : (
				<div className="bg-gray-50">{renderJsonValue(node.output)}</div>
			);
	}
};
