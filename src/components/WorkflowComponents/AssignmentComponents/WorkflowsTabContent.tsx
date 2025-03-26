import React, { useState } from "react";
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	List,
	MessageSquare,
} from "lucide-react";
import {
	Card,
} from "@/components/ui/card";

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

	return (
		<div className="flex flex-row flex-1 flex-grow" style={{ maxHeight: "calc(100vh - 69px)" }}>
			<WorkflowSidebar />
			<Tabs
				className="p-4 flex-grow flex-1 flex flex-col gap-2"
				defaultValue="workflows"
				style={{ maxHeight: "calc(100vh -69px)" }}
			>
				<div>
					{currentResult && (
						<TabsList>
							<>
								<TabsTrigger value="workflows">
									<List className="h-4 w-4 mr-2" />
									Workflows
									{runningWorkflows.length > 0 && (
										<Badge className="ml-2" variant="secondary">
											{runningWorkflows.length}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="questions">
									<MessageSquare className="h-4 w-4 mr-2" />
									Questions
								</TabsTrigger>
							</>
						</TabsList>
				 )} 
				</div>
				<TabsContent
					className="mt-0"
					style={{ maxHeight: "calc(100% - 8px - 36px)" }}
					value="workflows"
				>
					<WorkflowContent />
				</TabsContent>
				<TabsContent value="questions">
					<ChatContent />
				</TabsContent>
			</Tabs>
		</div>
	);
};

const WorkflowSidebar = (): React.ReactNode => {
	const workflowStats = useWorkflow((state) => state.workflowStats());
	const completedWorkflows = useWorkflow((state) => state.completedWorkflows());
	const runningWorkflows = useWorkflow((state) => state.runningWorkflows());

	const { eventSchedule } = useWorkflow();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isButtonHovered, setIsButtonHovered] = useState(false);
	return (
		<div
			className={`relative h-full transition-all duration-300 bg-white border-r
        		${isCollapsed ? "w-6" : "w-64"}`}
		>
			<Tooltipped tooltip={`${isCollapsed ? "Expand" : "Collapse"} Sidebar`}>
				<Button
					className="absolute top-4 bg-white rounded-full shadow-md w-6 h-6 -right-[14px]"
					onClick={() => setIsCollapsed(!isCollapsed)}
					onMouseEnter={() => setIsButtonHovered(true)}
					onMouseLeave={() => setIsButtonHovered(false)}
					size="icon"
					variant={isButtonHovered ? "default" : "outline"}
				>
					{isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
				</Button>
			</Tooltipped>
			{(!isCollapsed) && (
				<div className="overflow-auto h-full">
					{runningWorkflows && runningWorkflows.length > 0 && (
						<>
							<div className="p-4">
								<h3 className="text-lg font-medium mb-2 flex items-center">
									<span>Running Workflows</span>
									{runningWorkflows && runningWorkflows.length > 0 && (
										<Badge className="ml-2" variant="secondary">
											{runningWorkflows.length}
										</Badge>
									)}
								</h3>
								{!eventSchedule || !runningWorkflows || runningWorkflows.length === 0 ? (
									<Card className="p-4 bg-muted">
										<p className="text-sm text-muted-foreground">
											No running workflows
										</p>
									</Card>
								) : (
									<ScrollArea>
										<EventScheduleList
											graphs={runningWorkflows}
										/>
									</ScrollArea>
								)}
							</div>
							<Separator />
						</>
					)}
					<div className="h-full flex flex-col">
						<h3 className="text-lg font-medium p-4 flex items-center">
							<span>Completed Workflows</span>
						</h3>
						{!eventSchedule || !completedWorkflows || completedWorkflows.length === 0 ? (
							<Card className="bg-muted mx-4 p-2">
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
							<div className="h-full flex-grow flex-1">
								<ScrollArea className="h-full flex-grow flex-1">
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
	);
};

const WorkflowContent = (): React.ReactNode => {
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
						currentResult={currentResult}
						key={currentResult.id}											
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
		</>
	);
};
