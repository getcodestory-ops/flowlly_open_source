"use client";
import { useEffect } from "react";
import { useWorkflowStack, Workflow } from "@/hooks/useWorkflowStack";
import { useStore } from "@/utils/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Loader2, Info, CheckCircle, AlertCircle, ChevronDown, ChevronRight, TriangleAlert, ExternalLink, Pause } from "lucide-react";
import { useState } from "react";
import { WorkflowStatus } from "@/hooks/useWorkflowStack";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Progress } from "../ui/progress";
import { getInProgressWorkflows } from "@/api/taskQueue";
import { clearWorkflowProcess } from "@/api/taskQueue";
import { getInprogressWorkflowResult } from "@/api/taskQueue";
import { ResultViewer } from "../WorkflowComponents/ResultViewer";
import { useToast } from "@/components/ui/use-toast";
import type { EventResult } from "../WorkflowComponents/types";

//Work in progress
export const WorkflowStack = (): React.ReactNode => {
	const { toast } = useToast();
	const { workflows, addWorkflow } = useWorkflowStack();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const session = useStore((state) => state.session);
	const projectId = useStore((state) => state.activeProject?.project_id);

	useEffect(() => {
		if (session && projectId) {
			getInProgressWorkflows({ session, projectId }).then(
				(data)=>{
					if (data) {
						data.forEach((workflow) => {
							addWorkflow(workflow, session);
						});
					}
					else {
						toast({
							title: "Error",
							variant: "destructive",
							description: "Something went wrong while fetching running workflows",
						});
					}
				},
			);
		}
	}, [session, projectId]);

	const workflowKeys = Object.keys(workflows);
	if (workflowKeys.length === 0) return null;



	return (
		<div className="fixed bottom-4 left-16 z-50 w-[360px] shadow-lg rounded-lg overflow-hidden">
			<WorkflowStackHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
			{!isCollapsed && (
				<div className="py-1 bg-white border border-gray-200 rounded-b-lg border-t-0 w-full">
					<div className="max-h-[400px] overflow-auto w-full">
						{workflowKeys.reverse().map((workflowId) => {
							const workflow = workflows[workflowId];
							return (
                				<Card
                					className="p-2 flex items-center justify-between shadow-none rounded-none w-full gap-1"
									key={workflow.id}
                				>
                					<StausIcon status={workflow.status} />
									<div className="flex flex-col flex-1 min-w-0 gap-0">
										<span className=" flex-1 min-w-0 group text-sm flex-1 truncate overflow-hidden whitespace-nowrap">{workflow.name}</span>
										<div className="text-xs flex-1 truncate overflow-hidden whitespace-nowrap gap-1 flex items-center text-gray-500 px-0">{workflow.message}</div>
									</div>
									<div className="flex items-center">
										<OpenWorkflowButton workflow={workflow} />
										<CloseWorkflowButton workflow={workflow} />
									</div>
                				</Card>
                	        );
						})}
					</div>
				</div>
			)}
		</div>
	);
};

const WorkflowStackHeader = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (_: boolean) => void }): React.ReactNode => {
	const { workflows } = useWorkflowStack();
	const workflowKeys = Object.keys(workflows);

	const isWaitingUserInput = workflowKeys.some((key) => workflows[key].status === WorkflowStatus.PENDING);
	const isRunning = workflowKeys.some((key) => workflows[key].status === WorkflowStatus.RUNNING || workflows[key].status === WorkflowStatus.PENDING);
	const totalSuccess = workflowKeys.filter((key) => workflows[key].status === WorkflowStatus.SUCCESS).length;
	const totalWorkflows = workflowKeys.length;
	return (
		<div className="px-1 h-[48px] flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-500 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
			<div className="flex items-center gap-1 flex-1">
				<WorkflowHeaderIcon isRunning={isRunning} isWaitingUserInput={isWaitingUserInput} />
				<div className="font-medium text-sm flex-1 flex flex-col gap-1">
					<div className="flex justify-between items-center text-white">
						<div>{isWaitingUserInput ? "Waiting for input..." : isRunning ? "Processing..." : "Completed!"}</div>
						<div className="text-xs text-gray-300">{totalSuccess} of {totalWorkflows}</div>
					</div>
					<div className="relative w-full h-[3px] overflow-hidden rounded-full bg-white/20">
						{isWaitingUserInput ? (
							<div className="absolute inset-0 w-full h-full">
								 <div className="h-full w-1/3 bg-yellow-400 animate-shimmer" />
							</div>
						) : (
							<Progress className="w-full h-[3px] rounded-full bg-white/20" value={totalSuccess / totalWorkflows * 100} />
						)}
					</div>
				</div>
			</div>
			<div className="flex items-center space-x-2">
				<Button size="icon" variant="link">
					{isCollapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
				</Button>
			</div>
		</div>
	);
};


const WorkflowHeaderIcon = ({ isWaitingUserInput, isRunning }: { isWaitingUserInput: boolean, isRunning: boolean }): React.ReactNode => {
	return (
		<div className="flex items-center gap-2">
			{isWaitingUserInput ? 
				<StausIcon status={WorkflowStatus.PENDING} /> :
				isRunning ? 
					<StausIcon status={WorkflowStatus.RUNNING} /> :
					<StausIcon status={WorkflowStatus.SUCCESS} />
			}
		</div>
	);
};

const StausIcon = ({ status }: {status: WorkflowStatus}):  React.ReactNode  => {
	switch (status) {
		case WorkflowStatus.RUNNING:
			return <Loader2 className="animate-spin text-gray-200 w-4 h-4 m-2" />;
		case WorkflowStatus.PENDING:
			return <TriangleAlert className="text-yellow-500 w-4 h-4 m-2" />;
		case WorkflowStatus.ERROR:
			return <AlertCircle className="text-red-500 w-4 h-4 m-2" />;
		case WorkflowStatus.SUCCESS:
			return <CheckCircle className="text-green-500 w-4 h-4 m-2" />;
		case WorkflowStatus.PAUSED:
			return <Pause className="text-gray-500 w-4 h-4 m-2" />;
		default:
			return <Info className="text-gray-500 w-4 h-4 m-2" />;
	}
};


const OpenWorkflowButton = ({ workflow }: {workflow: Workflow}): React.ReactNode => {
	return <Dialog>
		<DialogTrigger asChild>
			<div className="gap-1 flex items-center text-gray-500 px-0 py-0 hover:text-gray-700 cursor-pointer hover:underline text-xs">
				<span>{openMessage(workflow.status)}</span> <ExternalLink className="w-3 h-3" />
			</div>
		</DialogTrigger>
		<DialogContent className="max-w-4xl py-12">
			<SteamingWorkflowEvents workflow={workflow} />
		</DialogContent>
	</Dialog>;
};

const openMessage = (status: WorkflowStatus): string => {
	switch (status) {
		case WorkflowStatus.RUNNING:
			return "View logs";
		case WorkflowStatus.PENDING:
			return "Input required";
		case WorkflowStatus.SUCCESS:
			return "View results";
		case WorkflowStatus.ERROR:
			return "View errors";
		case WorkflowStatus.PAUSED:
			return "View logs";
		default:
			return "View logs";
	}
};

const CloseWorkflowButton = ({ workflow }: {workflow: Workflow}): React.ReactNode => {
	const session = useStore((state) => state.session);
	const projectId = useStore((state) => state.activeProject?.project_id);
	const { removeWorkflow } = useWorkflowStack();
	const clearProcess = (	) : void=> {
		if (session && projectId && workflow.workflowId) {
			clearWorkflowProcess({ session, projectId, workflowId: workflow.workflowId }).then(() => {
				removeWorkflow(workflow.id);
			});
		}
	};
	
	return workflow.status === WorkflowStatus.SUCCESS || workflow.status === WorkflowStatus.ERROR ?  
		<Button 
			onClick={clearProcess}
			size="icon"
			variant="ghost"
		>
			<CloseButton />
		</Button> : 
		<ConfirmCancelModal workflow={workflow} />;
};

const CloseButton = (): React.ReactNode => <X className="text-gray-500 w-4 h-4" />;

const ConfirmCancelModal = ({ workflow }: {workflow: Workflow}): React.ReactNode => {
	const session = useStore((state) => state.session);
	const projectId = useStore((state) => state.activeProject?.project_id);
	const { removeWorkflow } = useWorkflowStack();
	const clearProcess = (	) : void=> {
		if (session && projectId && workflow.workflowId) {
			clearWorkflowProcess({ session, projectId, workflowId: workflow.workflowId }).then(() => {
				removeWorkflow(workflow.id);
			});
		}
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="ghost"
					size="icon"
					variant="ghost"
				><CloseButton /></Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure you want to stop {workflow.name}?</DialogTitle>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={clearProcess}
						variant="destructive"
					>Stop</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const SteamingWorkflowEvents = ({ workflow }: { workflow: Workflow }): React.ReactNode => {
	const { toast } = useToast();
	const session = useStore((state) => state.session);
	const projectId = useStore((state) => state.activeProject?.project_id);
	const [result, setResult] = useState<EventResult | null>(null);
	useEffect(() => {
		if (session && projectId && workflow.workflowId) {
			getInprogressWorkflowResult({ session, projectId, workflowId: workflow.workflowId }).then((result) => {
				if (result) {
					setResult(result);
				}
				else {
					toast({
						title: "Error",
						variant: "destructive",
						description: "Something went wrong while fetching in-progress workflow results!",
					});
				}
			});	
		}
	}, [session, projectId, workflow.workflowId]);

	return (
		<div className="verflow-auto">
			{result && (
				<ResultViewer 
					cacheId={workflow.workflowId}
					currentResult={result}
					key={workflow.workflowId}
				/>
			)}
		</div>
	);
};

