"use client";
import { useWorkflowStack, Workflow } from "@/hooks/useWorkflowStack";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Loader2, Info, CheckCircle, AlertCircle, ChevronDown, ChevronRight, TriangleAlert, ExternalLink } from "lucide-react";
import { useState } from "react";
import { WorkflowStatus } from "@/hooks/useWorkflowStack";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Progress } from "../ui/progress";

export const WorkflowStack = (): React.ReactNode => {
	const { workflows } = useWorkflowStack();
	const [isCollapsed, setIsCollapsed] = useState(false);

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
                					className="p-2 flex items-center justify-between shadow-none rounded-none w-full gap-2"
									key={workflow.id}
                				>
                					<div className="flex items-center gap-1 flex-1 min-w-0">
                						<StausIcon status={workflow.status} />
                						<span className="text-sm flex-1 truncate overflow-hidden whitespace-nowrap">{workflow.name}</span>
                					</div>
                					<div className="flex items-center gap-1">
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
		default:
			return <Info className="text-gray-500 w-4 h-4 m-2" />;
	}
};


const OpenWorkflowButton = ({ workflow }: {workflow: Workflow}): React.ReactNode => {
	return workflow.status === WorkflowStatus.PENDING ?
		<Button size="sm" variant="outline">Add Input</Button>
		:
		<Button className="gap-1 flex items-center text-gray-500 px-0"
			size="sm"
			variant="link"
		>
			<span>View {workflow.status === WorkflowStatus.SUCCESS ? "Results" : workflow.status === WorkflowStatus.ERROR ? "Errors" : "logs"}</span> <ExternalLink className="w-3 h-3" />
		</Button>;
};

const CloseWorkflowButton = ({ workflow }: {workflow: Workflow}): React.ReactNode => {
	const { removeWorkflow } = useWorkflowStack();
	return workflow.status === WorkflowStatus.SUCCESS || workflow.status === WorkflowStatus.ERROR ?  
		<Button 
			onClick={() => removeWorkflow(workflow.id)}
			size="icon"
			variant="ghost"
		>
			<CloseButton />
		</Button> : 
		<ConfirmCancelModal workflow={workflow} />;
};

const CloseButton = (): React.ReactNode => <X className="text-gray-500 w-4 h-4" />;

const ConfirmCancelModal = ({ workflow }: {workflow: Workflow}): React.ReactNode => {
	const { removeWorkflow } = useWorkflowStack();
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
					<Button onClick={() => {
						removeWorkflow(workflow.id);
					}}
					variant="destructive"
					>Stop</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export const TemporaryButtonForWorkflowStack = (): React.ReactNode => {
	const { addWorkflow } = useWorkflowStack();
	const workflowStatusList = [WorkflowStatus.RUNNING, WorkflowStatus.PENDING, WorkflowStatus.ERROR, WorkflowStatus.SUCCESS];
	const [currentId, setCurrentId] = useState(5);
	return (
		<div className="absolute top-64 left-4 z-10">
			<Button onClick={() => {
				const randomStatus = workflowStatusList[Math.floor(Math.random() * workflowStatusList.length)];
				setCurrentId(currentId + 1);
				addWorkflow({
					id: currentId.toString(),
					name: `Workflow ${currentId}`,
					status: randomStatus,
					requiresInput: true,
				});
			}}
			>Add Workflow</Button>
		</div>
	);
};
