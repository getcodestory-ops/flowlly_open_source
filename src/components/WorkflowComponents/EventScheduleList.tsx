import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	ColumnDef,
	SortingState,
	flexRender,
	getExpandedRowModel,
	Row,
	getPaginationRowModel,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import type { EventResult, EventSchedule, ScheduleTableRow } from "./types";
import {
	getEventResult,
	getEventTrigger,
	clearWorkflowProcess,
} from "@/api/taskQueue";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventScheduleListProps {
  graphs: EventSchedule[];
  onSelectGraph: (_: EventResult) => void;
  eventId: string;
  setIsLoadingResult: (_: boolean) => void;
  compact?: boolean;
}

export const EventScheduleList: React.FC<EventScheduleListProps> = ({
	graphs,
	onSelectGraph,
	eventId,
	setIsLoadingResult,
	compact = false,
}) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
	const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

	// Added pagination state
	const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
  	pageIndex: 0,
  	pageSize: 100,
  });

	const queryClient = useQueryClient();

	useEffect(() => {
		if (graphs && !selectedEventId && selectedResultId) {
			const freshGraph = graphs.find((g) => g.id === selectedResultId);
			if (freshGraph && freshGraph.event_result) {
				if (freshGraph.event_result[0].nodes) {
					onSelectGraph(freshGraph.event_result[0]);
					setSelectedEventId(freshGraph.event_result[0].id);
				} else {
					setSelectedEventId(freshGraph.event_result[0].id);
				}
			}
		}
	}, [graphs]);

	// Add new state to track the selected result

	const { data: eventTrigger } = useQuery({
		queryKey: ["eventTrigger", selectedEventId],
		queryFn: async() => {
			if (!session || !activeProject || !eventId)
				return Promise.reject(
					"Either session, active project, or selected event ID is missing",
				);
			return getEventTrigger({
				session,
				projectId: activeProject?.project_id || "",
				eventId: eventId,
				triggerType: "ui",
			});
		},
		enabled: !!session && !!activeProject && !!eventId,
	});

	const sortedGraphs = useMemo(() => {
		if (!graphs || graphs.length === 0) {
			return [];
		}

		return graphs.slice().sort((a, b) => {
			const runTimeA = a.schedule?.time?.[0]?.run_time;
			const runTimeB = b.schedule?.time?.[0]?.run_time;

			// If one of them does not have a run_time, consider it upcoming and place it at the top
			if (!runTimeA && runTimeB) return -1; // a is upcoming, so a comes first
			if (runTimeA && !runTimeB) return 1; // b is upcoming, so b comes first
			if (!runTimeA && !runTimeB) return 0; // both are upcoming, preserve order

			// If both events have a run_time, sort descending (latest on top)
			const dateA = new Date(`2000-01-01T${runTimeA}Z`);
			const dateB = new Date(`2000-01-01T${runTimeB}Z`);
			return dateB.getTime() - dateA.getTime();
		});
	}, [graphs]);

	const tableData: ScheduleTableRow[] = useMemo(() => {
		if (sortedGraphs.length === 0) {
			return [];
		}

		return sortedGraphs.map((eventSchedule) => ({
			id: eventSchedule.id,
			schedule: eventSchedule.schedule,
			subRows: eventSchedule.event_result
				.slice() // create copy to avoid mutating original data
				.sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				)
				.map((eventResult) => ({
					id: eventResult.id,
					result: eventResult,
				})),
		}));
	}, [sortedGraphs, eventTrigger]);

	const columns = useMemo<ColumnDef<ScheduleTableRow>[]>(
		() => [
			{
				accessorKey: "main",
				header: () => null,
				cell: ({ row }) => {
					if (row.original.schedule) {
						const schedule = row.original.schedule;
						const run_time = schedule.time?.[0]?.run_time;
						if (run_time) {
							return (
								<div className="flex items-center">
									<span className="font-medium">
										{compact ? "Schedule" : "Scheduled Workflow"}
									</span>
									<span className="ml-2 text-xs text-muted-foreground">
										{new Date(`2000-01-01T${run_time}Z`).toLocaleTimeString(
											[],
											{
												hour: "2-digit",
												minute: "2-digit",
											},
										)}
									</span>
								</div>
							);
						}
						return (
							<div className="flex items-center">
								<span className="font-medium">
									{compact ? "Running" : "Running Workflow"}
								</span>
							</div>
						);
					} else if (row.original.result) {
						const result = row.original.result;
						const activelyListening = result?.listen;
						const currentlyRunning = result?.workflow_id;
						const isCompleted = result.status === "completed";

						return (
							<div
								className={`pl-${
									compact ? "4" : "8"
								} flex flex-col items-start gap-2`}
							>
								<div className="flex items-center">
									<span className="text-sm">
										{new Date(result.timestamp).toLocaleString([], {
											dateStyle: compact ? "short" : "long",
											timeStyle: compact ? "short" : "medium",
										})}
									</span>
									{isCompleted && compact && (
										<span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
											Completed
										</span>
									)}
								</div>
								{activelyListening && (
									<div className="flex items-center">
										<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
										<span
											className={`ml-1 text-${
												compact ? "xs" : "sm"
											} text-green-600`}
										>
											Waiting for input
										</span>
									</div>
								)}
								{currentlyRunning && (
									<div className={`flex items-center ${compact ? "justify-between w-full" : "gap-2"}`}>
										<RunningText textSize={compact ? "xs" : "sm"} />
										<CancelRunningWorkflowButton
											buttonClassName={compact ? "h-5 px-1.5 text-xs" : "h-6 px-2 text-xs"}
											clearProcess={clearProcess}
											row={row}
										/>
									</div>
								)}
							</div>
						);
					} else {
						return "null";
					}
				},
			},
			// Add other columns as needed
		],
		[compact],
	);

	const table = useReactTable<ScheduleTableRow>({
		data: tableData,
		columns,
		state: {
			sorting,
			globalFilter,
			expanded: true,
			pagination,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSubRows: (row) => row.subRows,
	});

	const {
		data: fetchedEventResult,
		isLoading: isFetchingEventResult,
		isFetched,
	} = useQuery({
		queryKey: ["eventResult", selectedEventId],
		queryFn: async() => {
			if (!session || !activeProject || !selectedEventId) return null;
			return getEventResult({
				session,
				projectId: activeProject.project_id,
				resultId: selectedEventId,
			});
		},
		enabled: !!session && !!activeProject && !!selectedEventId,
		staleTime: 0,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		if (isFetchingEventResult) {
			setIsLoadingResult(isFetchingEventResult);
		}
		if (isFetched) {
			setIsLoadingResult(false);
		}
	}, [isFetchingEventResult, isFetched]);

	const { mutate: clearProcess } = useMutation({
		mutationFn: async(workflowId: string) => {
			if (!session || !activeProject) throw new Error("No session or project");
			return clearWorkflowProcess({
				session,
				projectId: activeProject.project_id,
				workflowId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["projectEvents"] });
			queryClient.invalidateQueries({
				queryKey: ["eventResult", selectedEventId],
			});
		},
	});

	useEffect(() => {
		if (fetchedEventResult) {
			onSelectGraph(fetchedEventResult?.result);
			setSelectedEventId(null);
		}
	}, [fetchedEventResult]);

	return (
		<div className={cn("w-full", compact && "text-sm")}>
			{graphs && graphs.length > 0 ? (
				<Table>
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<WorkflowListItem
									compact={compact}
									graphs={graphs}
									key={row.id}
									onSelectGraph={onSelectGraph}
									row={row}
									selectedResultId={selectedResultId || ""}
									setSelectedEventId={setSelectedEventId}
									setSelectedResultId={setSelectedResultId}
								/>
							))
						) : (
							<TableRow>
								<TableCell className="text-center" colSpan={columns.length}>
									<div>
										No workflow results found.
									</div>
								</TableCell>
							</TableRow>
						)}
						{/* </div> */}
					</TableBody>
				 </Table>
			) : (
				<div className="text-center p-4 text-muted-foreground">
					No workflow data available.
				</div>
			)}
			{/* Pagination Controls - Only show if we have data */}
			{table.getRowModel().rows.length > 0 && (
				<div className="flex items-center justify-between px-2 mt-4">
					{/* Pagination Controls... */}
				</div>
			)}
			{isFetchingEventResult && (
				<div className="flex items-center justify-center h-full mt-2">
					<div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[progressLine_10s_linear_infinite]" />
				</div>
			)}
		</div>
	);
};

interface WorkflowListItemProps {
	row: Row<ScheduleTableRow>;
	compact: boolean;
	selectedResultId: string;
	onSelectGraph: (_: EventResult) => void;
	graphs: EventSchedule[];
	setSelectedResultId: (_: string) => void;
	setSelectedEventId: (_: string) => void;
}

const WorkflowListItem = ({ row, compact, selectedResultId, onSelectGraph, graphs, setSelectedResultId, setSelectedEventId }: WorkflowListItemProps): React.ReactNode => {
	const isSelected = row.original.result?.id === selectedResultId;
	const isRunning = row.original.result?.workflow_id;
	const isListening = row.original.result?.listen;
	const isCompleted = row.original.result?.status === "completed";

	// Determine status styling
	let statusClass = "";
	if (isSelected) {
		statusClass = "bg-gradient-to-r from-indigo-100 to-purple-500";
	} else if (isRunning) {
		statusClass = "border-l-2 border-l-purple-500";
	} else if (isListening) {
		statusClass = "border-l-2 border-l-green-500";
	} else if (isCompleted) {
		statusClass = "border-l-2 border-l-green-700";
	}
	return (
		<React.Fragment key={row.id}>
			<TableRow
				className={cn(
					"cursor-pointer rounded-lg",
					statusClass,
					row.depth > 0 && "ml-4",
					compact && "py-1", // Add compact styling
					compact && "text-sm",
					"my-4",
					"border-none",
				)}
				onClick={() => {
					if (row.original.subRows) {
						row.toggleExpanded();
					} else if (row.original.result) {
						if (row.original.id === "eventTrigger") {
							onSelectGraph(row.original.result);
							setSelectedResultId(row.original.result.id);
							return;
						}

						const eventResult = graphs
							.flatMap((schedule) => schedule.event_result)
							.find((er) => er.id === row.original.result?.id);

						if (eventResult?.nodes) {
							onSelectGraph(eventResult);
							setSelectedResultId(row.original.result.id);
						} else {
							setSelectedEventId(row.original.result?.id);
							setSelectedResultId(row.original.result.id);
						}
					}
				}}
			>
				{row.getVisibleCells().map((cell) => (
					<TableCell className={cn(compact && "py-2 border-none")} key={cell.id}>
						<WorkflowItem name={flexRender(cell.column.columnDef.cell, cell.getContext()) || ""} />
					</TableCell>
				))}
			</TableRow>
		</React.Fragment>
	);
};

const WorkflowItem = ({ name }: {name: any}): React.ReactNode => {
	return (
		<div className="flex items-center gap-1 flex-row">
			{/* <div>
				<Button className="rounded-full w-4 h-4"
					size="icon"
					variant="outline"
				>
					<ChevronRight className="w-3 h-3" /> 
				</Button>
			</div> */}
			<div>{name}</div>
		</div>
	);
};

const CancelRunningWorkflowButton = ({ clearProcess, row, buttonClassName }: { clearProcess: (_: string) => void, row: Row<ScheduleTableRow>, buttonClassName: string }) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					className={buttonClassName}
					onClick={(e) => e.stopPropagation()}
					size="sm"
					variant="destructive"
				>
					Cancel
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						Clearing process will clean the progress so far.
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={(e) => e.stopPropagation()}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.stopPropagation();
							if (row.original.result?.workflow_id) {
								clearProcess(row.original.result.workflow_id);
							}
						}}
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>

	);
};

const RunningText = ({ textSize }: {textSize: string}): React.ReactNode => {
	return (
		<div className="flex items-center">
			<div className="h-2 w-2 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
			<span className={`ml-1 text-${textSize} text-purple-600`}>
				Running
			</span>
		</div>
	);
};