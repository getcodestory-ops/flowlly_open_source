"use client";
import React, { useEffect } from "react";
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
import { EventListViewer } from "./EventListViewer";

import type {
	ProjectEvents,
} from "./types";

import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import CreateJob from "./CreateJob";
import { WorkflowViewer } from "./AssignmentComponents/WorkflowViewer";
import { useWorkflow } from "@/hooks/useWorkflow";

export default function AssignmentHome(): React.ReactNode {
	const {
		currentGraphId,
		setEventSchedule,
		currentResult,
		setCurrentResult,
		graphs,
		setGraphs,
		currentGraph,
		setCurrentGraph,
	} = useWorkflow();
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

	if (isLoading) {
		return <div className="flex flex-col items-center justify-center h-[100vh]"><LoaderAnimation /></div>;
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
						<EventListViewer />
					</CardContent>
				</Card>
			) : (
				<WorkflowViewer session={session} />
			)}
		</div>
	);
};
