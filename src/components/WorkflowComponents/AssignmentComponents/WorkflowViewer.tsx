"use client";
import React from "react";
import {
	ArrowLeft,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkflowsTabContent } from "./WorkflowsTabContent";

import type {
	GraphData,
	EventResult,
	EventSchedule,
} from "../types";

import { TriggerUI } from "../TriggerUI";
import { Tooltipped } from "@/components/Common/Tooltiped";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
export const WorkflowViewer = ({ currentGraphId, setCurrentGraphId, currentResult, setCurrentResult, runningWorkflows, completedWorkflows, eventSchedule, setIsLoadingResult, currentGraph, workflowStats, isLoadingResult }: WorkflowViewerProps): React.ReactNode => {
	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex items-center gap-4 p-4 border-b">
				<Tooltipped
					tooltip="Back to Workflows"
				>
					<Button
						onClick={() => {
							setCurrentGraphId(null);
							setCurrentResult(null);
						}}
						size="icon"
						variant="ghost"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Tooltipped>
				<h2 className="text-xl font-semibold">{currentGraph?.name}</h2>
				<Badge variant="outline">
					{currentGraph?.event_type}
				</Badge>
				{currentGraph?.event_trigger &&
				currentGraph?.event_trigger.length > 0 && (
					<Popover>
						<PopoverTrigger asChild className="ml-auto">
							<Button variant="default">
								<Play className="h-4 w-4 mr-2" />
								Trigger Workflow
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80">
							<TriggerWorkflowContent
								currentGraph={currentGraph}
								currentGraphId={currentGraphId}
								setCurrentResult={setCurrentResult}
							/>
						</PopoverContent>
					</Popover>
				)
				}
			</div>
			<WorkflowsTabContent
				completedWorkflows={completedWorkflows}
				currentGraph={currentGraph}
				currentGraphId={currentGraphId}
				currentResult={currentResult}
				eventSchedule={eventSchedule}
				isLoadingResult={isLoadingResult}
				runningWorkflows={runningWorkflows}
				setCurrentResult={setCurrentResult}
				setIsLoadingResult={setIsLoadingResult}
				workflowStats={workflowStats}
			/>
		</div>
	);
};

interface TriggerWorkflowContentProps {
	currentGraphId: string | null;
	setCurrentResult: (_: EventResult | null) => void;
	currentGraph: GraphData | null;
}

const TriggerWorkflowContent = ({ currentGraphId, setCurrentResult, currentGraph }: TriggerWorkflowContentProps): React.ReactNode => {
	return (
		<>
			{currentGraph?.event_trigger &&
			currentGraph?.event_trigger.length > 0 &&
			currentGraph?.event_trigger[0].trigger_by === "ui" && (
				<Card className="border-0 shadow-none overflow-hidden">
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
		</>
	);
};