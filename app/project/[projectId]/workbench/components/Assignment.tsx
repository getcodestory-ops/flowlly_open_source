"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
	AlertCircle,
} from "lucide-react";
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

import type {
	GraphData,
	EventResult,
	EventSchedule,
	ProjectEvents,
} from "./types";

import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import CreateJob from "./CreateJob";
import { ViewMode } from "./types";
import { WorkflowViewer } from "./AssignmentComponents/WorkflowViewer";

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
		<div className="mx-auto h-[100vh] flex flex-col">
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
