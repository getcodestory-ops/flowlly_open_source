"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
	ArrowLeft,
	List,
	Info,
	MessageSquare,
	Play,
	AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import { GraphList } from "./GraphList";
import { EventScheduleList } from "./EventScheduleList";
import { ResultViewer } from "./ResultViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import type {
	GraphData,
	EventResult,
	EventSchedule,
	ProjectEvents,
} from "./types";

import { TriggerUI } from "./TriggerUI";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import PlatformChatComponent from "@/components/ChatInput/PlatformChat/PlatformChatComponent";
import CreateJob from "./CreateJob";
import { WorkflowViewModeSwitcher } from "./WorkflowViewModeSwitcher";
import { ViewMode } from "./types";

export default function AssignmentHome(): React.ReactNode {
	const [currentGraphId, setCurrentGraphId] = useState<string | null>(null);
	const [eventSchedule, setEventSchedule] = useState<EventSchedule[] | null>(
		null,
	);
	const [currentResult, setCurrentResult] = useState<EventResult | null>(null);
	const [graphs, setGraphs] = useState<GraphData[] | null>(null);
	const [currentGraph, setCurrentGraph] = useState<GraphData | null>(null);
	const [isLoadingResult, setIsLoadingResult] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);

	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const { data, isLoading, isError } = useQuery({
		queryKey: ["projectEvents"],
		queryFn: async() => {
			if (!session || !activeProject) return [];
			const result = await getProjectEvents({
				session: session,
				projectId: activeProject.project_id,
			});
			return result;
		},
		enabled: !!session && !!activeProject,
	});

	useEffect(() => {
		if (data) {
			setGraphs(data.map((d: ProjectEvents) => d.project_events));
		}
	}, [data]);

	useEffect(() => {
		if (graphs) {
			const graph = graphs?.find((g) => g.id === currentGraphId);
			setCurrentGraph(graph || null);

			// Check if there's any event_schedule data
			if (graph?.event_schedule && graph.event_schedule.length > 0) {
				setEventSchedule(graph.event_schedule);
			} else {
				setEventSchedule([]);
			}

			if (currentResult && currentResult.event_id !== currentGraphId) {
				setCurrentResult(null);
			}
		} else {
			setEventSchedule(null);
			setCurrentGraph(null);
			setCurrentResult(null);
		}
	}, [currentGraphId, graphs, currentResult]);

	// First, let's classify each event result to understand what we're working with
	const workflowStats = useMemo(() => {
		if (!eventSchedule || eventSchedule.length === 0) {
			return { completed: 0, running: 0, other: 0, total: 0 };
		}

		let completed = 0;
		let running = 0;
		let other = 0;
		let total = 0;

		eventSchedule.forEach((schedule) => {
			schedule.event_result.forEach((result) => {
				total++;

				// A workflow is considered completed if:
				// 1. It explicitly has status === "completed" OR
				// 2. It has status === null/undefined and no running indicators
				const isExplicitlyCompleted = !!result;
				const isImplicitlyCompleted =
          (result.status === null || result.status === undefined) &&
          !result.listen &&
          !result.workflow_id;

				const isCompleted = isExplicitlyCompleted || isImplicitlyCompleted;

				// A workflow is considered running if:
				// - It has status === "processing", OR
				// - It has listen === true, OR
				// - It has a workflow_id (meaning it's actively running) AND is not completed
				const isRunning =
          result.status === "processing" ||
          !!result.listen ||
          (!!result.workflow_id && !isCompleted);

				// Track workflows that are neither running nor completed
				const isOther = !isCompleted && !isRunning;

				if (isCompleted) completed++;
				if (isRunning) running++;
				if (isOther) other++;
			});
		});

		return { completed, running, other, total };
	}, [eventSchedule]);

	const completedWorkflows = useMemo(() => {
		if (!eventSchedule) {
			return [];
		}

		// A schedule is considered completed if ANY of its event_results:
		// 1. Has status === "completed" OR
		// 2. Has status === null/undefined and is not running
		return eventSchedule.filter((schedule) => {
			// Check for any results that should be considered "completed"
			const hasCompletedResult = schedule.event_result.some((result) => {
				// Explicitly completed
				const isExplicitlyCompleted = !!result;

				// Implicitly completed: has null status and no running indicators
				const isImplicitlyCompleted =
          (result.status === null || result.status === undefined) &&
          !result.listen &&
          !result.workflow_id;

				return isExplicitlyCompleted || isImplicitlyCompleted;
			});

			// Check if any result is actively running
			const hasRunningResult = schedule.event_result.some(
				(result) =>
					result.status === "processing" ||
          !!result.listen ||
          (!!result.workflow_id && result.status !== "completed"),
			);

			// Schedule is completed if it has at least one completed result and NO running results
			return hasCompletedResult && !hasRunningResult;
		});
	}, [eventSchedule]);

	const runningWorkflows = useMemo(() => {
		if (!eventSchedule) {
			return [];
		}

		// A schedule is considered running if ANY of its event_results is:
		// 1. In "processing" status OR
		// 2. Listening for input OR
		// 3. Has an active workflow_id but is not completed
		return eventSchedule.filter((schedule) =>
			schedule.event_result.some(
				(result) =>
					result.status === "processing" ||
          !!result.listen ||
          (!!result.workflow_id && result.status !== "completed"),
			),
		);
	}, [eventSchedule]);

	if (isLoading) {
		return <LoaderAnimation />;
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
				<AlertCircle className="h-12 w-12 text-destructive mb-4" />
				<h3 className="text-xl font-medium mb-2">Error loading workflows</h3>
				<p className="text-muted-foreground">
					There was a problem loading your workflows. Please try refreshing the
					page.
				</p>
			</div>
		);
	}

	if (!graphs) {
		return <LoaderAnimation />;
	}

	return (
		<div className="mx-auto h-full flex flex-col">
			{!currentGraph ? (
				<Card className="flex-1 border-0 shadow-none h-[100vh]">
					<CardHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white z-10">
						<div className="flex flex-row justify-between">
							<div className="">
								<CardTitle className="flex  gap-8 text-2xl font-bold">
									AI Workflows
								</CardTitle>
								<CardDescription>
									<div className="flex justify-between items-start">
										<div className="flex flex-col gap-2">
											Manage and run AI workflows for your project
										</div>
									</div>
								</CardDescription>
							</div>
							<div className="justify-end flex items-center h-full">
								<CreateJob />
							</div>
						</div>
					</CardHeader>
					<CardContent className="px-6 flex-1 overflow-y-auto">
						<GraphList
							graphs={graphs}
							onSelectGraph={setCurrentGraphId}
							setViewMode={setViewMode}
							viewMode={viewMode}
						/>
					</CardContent>
				</Card>
			) : (
				<WorkflowViewer
					completedWorkflows={completedWorkflows}
					currentGraph={currentGraph}
					currentGraphId={currentGraphId}
					currentResult={currentResult}
					eventSchedule={eventSchedule || []}
					isLoadingResult={isLoadingResult}
					runningWorkflows={runningWorkflows}
					setCurrentGraphId={setCurrentGraphId}
					setCurrentResult={setCurrentResult}
					setIsLoadingResult={setIsLoadingResult}
					workflowStats={workflowStats}
				/>
			)}
		</div>
	);
};

interface WorkflowViewerProps {
	currentGraphId: string | null;
	setCurrentGraphId: (_: string | null) => void;
	currentResult: EventResult | null;
	setCurrentResult: (_: EventResult | null) => void;
	runningWorkflows: EventSchedule[];
	completedWorkflows: EventSchedule[];
	eventSchedule: EventSchedule[];
	setIsLoadingResult: (_: boolean) => void;
	currentGraph: GraphData | null;
	workflowStats: { completed: number, running: number, other: number, total: number };
	isLoadingResult: boolean;

}
const WorkflowViewer = ({ currentGraphId, setCurrentGraphId, currentResult, setCurrentResult, runningWorkflows, completedWorkflows, eventSchedule, setIsLoadingResult, currentGraph, workflowStats, isLoadingResult }: WorkflowViewerProps): React.ReactNode => {
	return (
		<div className="flex flex-col flex-1">
			<div className="flex items-center gap-4 p-4 border-b">
				<Button
					className="p-2"
					onClick={() => {
						setCurrentGraphId(null);
						setCurrentResult(null);
					}}
					variant="ghost"
				>
					<ArrowLeft className="h-5 w-5 mr-2" />
					Back to Workflows
				</Button>
				<h2 className="text-xl font-semibold">{currentGraph?.name}</h2>
				<Badge className="ml-auto" variant="outline">
					{currentGraph?.event_type}
				</Badge>
			</div>
			<Tabs
				className="flex-1 flex flex-col"
				defaultValue="workflows"
			>
				<div className="border-b px-4">
					<TabsList className="h-12">
						<TabsTrigger
							className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
							value="workflows"
						>
							<List className="h-4 w-4 mr-2" />
							Workflows
							{runningWorkflows.length > 0 && (
								<Badge className="ml-2" variant="secondary">
									{runningWorkflows.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger
							className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
							value="results"
						>
							<Info className="h-4 w-4 mr-2" />
							Results
							{currentResult && (
								<Badge className="ml-2" variant="secondary">
									1
								</Badge>
							)}
						</TabsTrigger>
						{currentGraph?.event_trigger &&
							currentGraph?.event_trigger.length > 0 && (
							<TabsTrigger
								className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
								value="trigger"
							>
								<Play className="h-4 w-4 mr-2" />
								Trigger Workflow
							</TabsTrigger>
						)}
						<TabsTrigger
							className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
							value="questions"
						>
							<MessageSquare className="h-4 w-4 mr-2" />
							Questions
						</TabsTrigger>
					</TabsList>
				</div>
				<div className="flex-1 overflow-hidden">
					<TabsContent className="flex-1 h-full mt-0" value="workflows">
						<div className="grid grid-cols-1 lg:grid-cols-6 h-full">
							<div className="p-4 overflow-auto border-r">
								<div className="mb-4">
									<h3 className="text-lg font-medium mb-2 flex items-center">
										<span>Running Workflows</span>
										{runningWorkflows && runningWorkflows.length > 0 && (
											<Badge className="ml-2" variant="secondary">
												{runningWorkflows.length}
											</Badge>
										)}
									</h3>
									{!eventSchedule ||
										!runningWorkflows ||
										runningWorkflows.length === 0 ? (
											<Card className="p-4 bg-muted">
												<p className="text-sm text-muted-foreground">
													No running workflows
												</p>
											</Card>
										) : (
											<ScrollArea className="h-[200px]">
												<EventScheduleList
													compact
													eventId={currentGraphId || ""}
													graphs={runningWorkflows}
													onSelectGraph={(result) => {
														setCurrentResult(result);
													}}
													setIsLoadingResult={setIsLoadingResult}
												/>
											</ScrollArea>
										)}
								</div>
								<Separator className="my-4" />
								<div>
									<h3 className="text-lg font-medium mb-2 flex items-center">
										<span>Completed Workflows</span>
										{completedWorkflows &&
											completedWorkflows.length > 0 && (
											<Badge className="ml-2" variant="secondary">
												{completedWorkflows.length}
											</Badge>
										)}
									</h3>
									{!eventSchedule ||
										!completedWorkflows ||
										completedWorkflows.length === 0 ? (
											<Card className="p-4 bg-muted">
												<p className="text-sm text-muted-foreground">
													No completed workflows
												</p>
												{eventSchedule && eventSchedule.length > 0 && (
													<div className="text-xs text-blue-600 mt-2">
														<p>Diagnostic Info:</p>
														<p>
															Total event schedules: {eventSchedule.length}
														</p>
														<p>Total results: {workflowStats.total}</p>
														<p>
															Explicitly completed:{" "}
															{
																eventSchedule.filter((s) =>
																	s.event_result.some(
																		(r) => r.status === "completed",
																	),
																).length
															}
														</p>
														<p>
															Implicitly completed:{" "}
															{
																eventSchedule.filter((s) =>
																	s.event_result.some(
																		(r) =>
																			(r.status === null ||
																				r.status === undefined) &&
																			!r.listen &&
																			!r.workflow_id,
																	),
																).length
															}
														</p>
														<p>
															Running:{" "}
															{
																eventSchedule.filter((s) =>
																	s.event_result.some(
																		(r) =>
																			r.status === "processing" ||
																			!!r.listen ||
																			(!!r.workflow_id &&
																			r.status !== "completed"),
																	),
																).length
															}
														</p>
														<p>
															Stats: {workflowStats.completed} completed,{" "}
															{workflowStats.running} running,{" "}
															{workflowStats.other} other
														</p>
													</div>
												)}
											</Card>
										) : (
											<ScrollArea className="h-[calc(100vh-500px)]">
												<EventScheduleList
													compact
													eventId={currentGraphId || ""}
													graphs={completedWorkflows}
													onSelectGraph={(result) => {
														setCurrentResult(result);
													}}
													setIsLoadingResult={setIsLoadingResult}
												/>
											</ScrollArea>
										)}
								</div>
							</div>
							<div className="col-span-5 p-4 h-full overflow-auto">
								{currentResult ? (
									isLoadingResult ? (
										<div className="flex h-full items-center justify-center">
											<LoaderAnimation />
										</div>
									) : (
										<ResultViewer
											currentResult={currentResult}											
										/>
									)
								) : (
									<div className="flex flex-col items-center justify-center h-full text-center">
										<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
										<h3 className="text-xl font-medium mb-2">
											No workflow selected
										</h3>
										<p className="text-muted-foreground">
											Select a workflow from the left panel to view its
											details
										</p>
									</div>
								)}
							</div>
						</div>
					</TabsContent>
					<TabsContent
						className="flex-1 h-full mt-0 p-4 overflow-auto"
						value="results"
					>
						{currentResult ? (
							<ResultViewer
								currentResult={currentResult}
							/>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-center">
								<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-xl font-medium mb-2">
									No results to display
								</h3>
								<p className="text-muted-foreground">
									Select a workflow from the Workflows tab to view its results
								</p>
							</div>
						)}
					</TabsContent>
					<TabsContent className="flex-1 h-full mt-0 p-4" value="trigger">
						{currentGraph?.event_trigger &&
							currentGraph?.event_trigger.length > 0 &&
							currentGraph?.event_trigger[0].trigger_by === "ui" && (
							<Card>
								<CardHeader>
									<CardTitle>Trigger Workflow</CardTitle>
									<CardDescription>
										Start a new workflow run
									</CardDescription>
								</CardHeader>
								<CardContent>
									<TriggerUI
										eventId={currentGraphId || ""}
										onTrigger={(result) => {
											setCurrentResult(result);
										}}
									/>
								</CardContent>
							</Card>
						)}
					</TabsContent>
					<TabsContent className="flex-1 h-full mt-0 p-4" value="questions">
						<Card className="h-full flex flex-col border-0 shadow-none">
							<CardHeader>
								<CardTitle>Ask about this workflow</CardTitle>
								<CardDescription>
									Get help and information about this workflow
								</CardDescription>
							</CardHeader>
							<CardContent className="flex-1 pb-6">
								{currentResult ? (
									<div className="h-[full] border rounded-md">
										<PlatformChatComponent
											chatTarget="workflow"
											folderId={currentResult.id}
											folderName={currentGraph?.name || ""}
										/>
									</div>
								) : (
									<div className="bg-muted p-4 rounded-lg">
										<p className="text-muted-foreground">
											No workflow selected to answer questions about
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
};
