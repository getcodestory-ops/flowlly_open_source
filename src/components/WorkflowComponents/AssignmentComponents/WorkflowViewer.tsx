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
import { TriggerUI } from "../TriggerUI";
import { Tooltipped } from "@/components/Common/Tooltiped";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useWorkflow } from "@/hooks/useWorkflow";

export const WorkflowViewer = (): React.ReactNode => {
	const {
		setCurrentGraphId,
		setCurrentResult,
		currentGraph,
	} = useWorkflow();
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
							<TriggerWorkflowContent />
						</PopoverContent>
					</Popover>
				)
				}
			</div>
			<WorkflowsTabContent />
		</div>
	);
};

const TriggerWorkflowContent = (): React.ReactNode => {
	const {
		currentGraphId,
		setCurrentResult,
		currentGraph,
	} = useWorkflow();
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