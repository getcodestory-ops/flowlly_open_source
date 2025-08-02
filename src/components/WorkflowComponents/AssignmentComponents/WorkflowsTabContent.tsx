import React, { useState, useEffect } from "react";
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	List,
	MessageSquare,
	ArrowLeft,
	Menu,
	Video,
	Mic,
	FileText,
} from "lucide-react";


import { EventScheduleList } from "../EventScheduleList";
import { ResultViewer } from "../ResultViewer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import { Button } from "@/components/ui/button";
import { Tooltipped } from "@/components/Common/Tooltiped";
import { ChatContent } from "./ChatContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkflow } from "@/hooks/useWorkflow";

export const WorkflowsTabContent = (): React.ReactNode => {
	const runningWorkflows = useWorkflow((state) => state.runningWorkflows());
	const { currentResult } = useWorkflow();
	const [activeTab, setActiveTab] = useState<string>("");

	// Initialize active tab when currentResult changes
	useEffect(() => {
		if (currentResult?.nodes && currentResult.nodes.length > 0) {
			const allowedNodeIds = [
				"join_meeting",
				"record_meeting", 
				"transcribe_meeting",
				"save_minutes_in_project_documents",
				"determine_action_items",
				"distribute_meeting_minutes",
			];
			
			const filteredNodes = currentResult.nodes.filter((node) => 
				allowedNodeIds.some((allowedId) => node.id.toLowerCase().includes(allowedId.toLowerCase())),
			);
			
			const resultNodes = getFilteredNodes();
			if (resultNodes.length > 0) {
				// Default to meeting_recording if available, then save_minutes_in_project_documents, or first available
				const meetingRecordingNode = resultNodes.find((node) => node.id === "meeting_recording");
				const saveMinutesNode = resultNodes.find(
					(node) => node.id.toLowerCase() === "save_minutes_in_project_documents",
				);
				setActiveTab((meetingRecordingNode || saveMinutesNode || resultNodes[0]).id);
			}
		}
	}, [currentResult?.id]);

	// Get filtered nodes for tabs
	const getFilteredNodes = () => {
		if (!currentResult?.nodes) return [];
		const allowedNodeIds = [
			"join_meeting",
			"record_meeting", 
			"transcribe_meeting",
			"save_minutes_in_project_documents",
			"determine_action_items",
			"distribute_meeting_minutes",
		];
		
		const filteredNodes = currentResult.nodes.filter((node) => 
			allowedNodeIds.some((allowedId) => node.id.toLowerCase().includes(allowedId.toLowerCase())),
		);
		
		// Create combined meeting recording tab if we have either video or transcription
		const videoNode = filteredNodes.find((node) => node.id.toLowerCase().includes("record_meeting"));
		const transcriptionNode = filteredNodes.find((node) => node.id.toLowerCase().includes("transcribe_meeting"));
		
		const resultNodes = [];
		
		// Add join meeting if exists
		const joinNode = filteredNodes.find((node) => node.id.toLowerCase().includes("join_meeting"));
		if (joinNode) {
			resultNodes.push({
				...joinNode,
				title: getNodeTitle(joinNode.id),
			});
		}
		
		// Add combined meeting recording tab if we have video or transcription
		if (videoNode || transcriptionNode) {
			resultNodes.push({
				id: "meeting_recording",
				title: "Meeting Recording",
				status: videoNode?.status || transcriptionNode?.status || "pending",
				videoNode,
				transcriptionNode,
			});
		}
		
		// Add other workflow steps
		const otherNodes = filteredNodes.filter((node) => 
			!node.id.toLowerCase().includes("record_meeting") && 
			!node.id.toLowerCase().includes("transcribe_meeting") &&
			!node.id.toLowerCase().includes("join_meeting"),
		);
		
		otherNodes.forEach((node) => {
			resultNodes.push({
				...node,
				title: getNodeTitle(node.id),
			});
		});
		
		// Add Questions tab at the end
		resultNodes.push({
			id: "questions",
			title: "Questions",
			status: "completed", // Always show as available
		});
		
		return resultNodes;
	};

	const getNodeTitle = (nodeId: string) => {
		const id = nodeId.toLowerCase();
		switch (id) {
			case "join_meeting":
				return "Join Meeting";
			case "record_meeting":
				return "Meeting Video";
			case "transcribe_meeting":
				return "Transcription";
			case "save_minutes_in_project_documents":
				return "Minutes";
			case "determine_action_items":
				return "Action Items";
			case "distribute_meeting_minutes":
				return "Distribute";
			default:
				return nodeId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
		}
	};

	const getNodeIcon = (nodeId: string) => {
		const id = nodeId.toLowerCase();
		switch (id) {
			case "join_meeting":
				return <Video className="h-4 w-4" />;
			case "meeting_recording":
				return <Video className="h-4 w-4" />;
			case "record_meeting":
				return <Video className="h-4 w-4" />;
			case "transcribe_meeting":
				return <Mic className="h-4 w-4" />;
			case "determine_action_items":
				return <List className="h-4 w-4" />;
			case "save_minutes_in_project_documents":
				return <FileText className="h-4 w-4" />;
			case "distribute_meeting_minutes":
				return <MessageSquare className="h-4 w-4" />;
			case "questions":
				return <MessageSquare className="h-4 w-4" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	// Adjust margin based on whether sidebar should be showing
	const sidebarMargin = !currentResult ? "ml-64" : "ml-12";

	return (
		<div className="flex flex-row flex-1 flex-grow h-screen overflow-hidden">
			<WorkflowSidebar />
			<div
				className={`flex-grow flex-1 flex flex-col transition-all duration-300 ${sidebarMargin} min-h-0`}
				style={{ maxHeight: "100vh" }}
			>
				{currentResult ? (<div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
					{/* Single panel - Meeting Tabs including Questions */}
					<div className="flex-1 flex flex-col min-h-0">
						<Tabs 
							className="flex-1 flex flex-col min-h-0" 
							onValueChange={setActiveTab} 
							value={activeTab}
						>
							<div className="px-4 pt-3 pb-2 flex-shrink-0">
								<TabsList className="inline-flex">
									{getFilteredNodes().map((node) => (
										<TabsTrigger 
											className="flex items-center gap-1 text-xs px-2 py-2" 
											key={node.id}
											value={node.id}
										>
											{getNodeIcon(node.id)}
											<span className="hidden sm:inline truncate">{node.title}</span>
											{node.id !== "questions" && (
												<div 
													className={`w-2 h-2 rounded-full ml-1 ${
														node.status === "completed" ? "bg-green-500" :
															node.status === "running" ? "bg-blue-500" :
																node.status === "failed" ? "bg-red-500" :
																	"bg-gray-400"
													}`} 
												/>
											)}
										</TabsTrigger>
									))}
								</TabsList>
							</div>
							<div className="flex-1 min-h-0 overflow-hidden">
								{getFilteredNodes().map((node) => (
									<TabsContent 
										className="h-full m-0 p-0 overflow-hidden" 
										key={node.id} 
										value={node.id}
									>
										{node.id === "questions" ? (
											<div className="h-full overflow-auto p-4">
												<ChatContent />
											</div>
										) : (
											<WorkflowContent activeTab={node.id} />
										)}
									</TabsContent>
								))}
							</div>
						</Tabs>
					</div>
				</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-xl font-medium mb-2">
							No Meeting selected
						</h3>
						<p className="text-muted-foreground">
							Select a meeting from the left panel to view its details
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

const WorkflowSidebar = (): React.ReactNode => {
	const completedWorkflows = useWorkflow((state) => state.completedWorkflows());
	const {
		eventSchedule,
		setCurrentGraphId,
		setCurrentResult,
		currentGraph,
		currentResult,
	} = useWorkflow();
	
	const [isHovered, setIsHovered] = useState(false);
	
	// Show sidebar by default if no current result, or when hovered
	const shouldShowSidebar = !currentResult || isHovered;

	return (
		<div className="relative h-full">
			{/* Fixed width trigger area */}
			<div 
				className="absolute left-0 top-0 w-12 h-full z-30 flex items-start justify-center pt-4"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Tooltipped tooltip="Workflow Sidebar">
					<div className="bg-white rounded-md p-2 border cursor-pointer">
						<Menu className="text-muted-foreground" size={16} />
					</div>
				</Tooltipped>
			</div>
			<div
				className={`absolute left-0 top-0 h-full bg-white border-r transition-all duration-300 z-50
					${shouldShowSidebar ? "w-64 opacity-100" : "w-0 opacity-0"}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				style={{ 
					pointerEvents: shouldShowSidebar ? "auto" : "none",
					overflow: shouldShowSidebar ? "visible" : "hidden",
				}}
			>
				{shouldShowSidebar && (
					<div className="h-full flex flex-col ">
						{/* Back button and header */}
						<div className="flex items-center gap-2 p-4 border-b">
							<Tooltipped tooltip="Back to all Meetings">
								<Button
									className="shrink-0"
									onClick={() => {
										setCurrentGraphId(null);
										setCurrentResult(null);
									}}
									size="icon"
									variant="ghost"
								>
									<ArrowLeft className="h-4 w-4" />
								</Button>
							</Tooltipped>
							<div className="min-w-0 flex-1">
								<h3 className="text-sm font-medium truncate">
									{currentGraph ? currentGraph.name : "Completed Workflows"}
								</h3>
								{currentGraph && (
									<Badge className="text-xs mt-1" variant="outline">
										{currentGraph.event_type}
									</Badge>
								)}
							</div>
						</div>
						<div className="flex-1 overflow-hidden">
							{!eventSchedule || !completedWorkflows || completedWorkflows.length === 0 ? (
								<div className="mx-4 mt-4 p-2">
									<p className="text-sm text-muted-foreground">
										No Meetings to show
									</p>
								</div>
							) : (
								<div className="h-full flex-1 pt-2">
									<ScrollArea className="h-full">
										<EventScheduleList
											graphs={completedWorkflows}
										/>
									</ScrollArea>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const WorkflowContent = ({ activeTab }: { activeTab: string }): React.ReactNode => {
	const { currentResult, isLoadingResult } = useWorkflow();

	return (
		<>
			{currentResult ? (
				isLoadingResult ? (
					<div className="flex flex-grow flex-1 h-full items-center justify-center">
						<LoaderAnimation />
					</div>
				) : (
					<ResultViewer
						activeTab={activeTab}
						currentResult={currentResult}
						key={currentResult.id}											
					/>
				)
			) : (
				<div className="flex flex-col items-center justify-center h-full text-center">
					<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-xl font-medium mb-2">
						No Meeting selected
					</h3>
					<p className="text-muted-foreground">
						Select a meeting from the left panel to view its
						details
					</p>
				</div>
			)}
		</>
	);
};
