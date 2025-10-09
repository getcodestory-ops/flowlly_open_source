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
import type { EventSchedule, ScheduleTableRow } from "./types";
import {
	getEventResult,
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
import { useWorkflow } from "@/hooks/useWorkflow";

interface EventScheduleListProps {
  graphs: EventSchedule[];
  onWorkflowSelect?: () => void;
}

// Helper function to determine event tag based on description
const getEventTag = (description: string): { label: string; color: string } | null => {
	const lowerDesc = description.toLowerCase();
	if (lowerDesc.includes("meeting minutes")) {
		return { label: "Meeting", color: "bg-blue-100 text-blue-800 border-blue-300" };
	}
	if (lowerDesc.includes("creating process from user input")) {
		return { label: "Agenda", color: "bg-purple-100 text-purple-800 border-purple-300" };
	}
	return null;
};

// Helper function to determine time-based tag
const getTimeBasedTag = (eventDate: Date, currentTime: Date): { label: string; color: string } => {
	const diffMs = eventDate.getTime() - currentTime.getTime();
	const diffMinutes = Math.floor(diffMs / 60000);
	
	if (diffMs < 0) {
		// Event is in the past
		return { label: "Finished Meeting", color: "bg-gray-100 text-gray-700 border-gray-300" };
	} else if (diffMinutes <= 60) {
		// Event is happening in 1 hour or less
		return { label: `Happening in ${diffMinutes} minutes`, color: "bg-green-100 text-green-800 border-green-300" };
	} else {
		// Event is more than 1 hour in the future
		return { label: "Upcoming Meeting", color: "bg-orange-100 text-orange-800 border-orange-300" };
	}
};

export const EventScheduleList: React.FC<EventScheduleListProps> = ({
	graphs,
	onWorkflowSelect,
}) => {
	const { setIsLoadingResult, setCurrentResult, selectedWorkflowId } = useWorkflow();
	const compact = true;

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(new Date());

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
		if (graphs && !selectedEventId && selectedWorkflowId) {
			const freshGraph = graphs.find((g) => g.id === selectedWorkflowId);
			if (freshGraph && freshGraph.event_result) {
				if (freshGraph.event_result[0].nodes) {
					setCurrentResult(freshGraph.event_result[0]);
					setSelectedEventId(freshGraph.event_result[0].id);
				} else {
					setSelectedEventId(freshGraph.event_result[0].id);
				}
			}
		}
	}, [graphs, selectedEventId, selectedWorkflowId, setCurrentResult]);

	useEffect(() => {
		// eslint-disable-next-line no-console
		console.log("graphs", graphs);
		// eslint-disable-next-line no-console
		console.log("selectedEventId", selectedEventId);
	}, [graphs, selectedEventId]);

	// Add new state to track the selected result

	// Note: eventTrigger query removed as it was not being used
	// If needed in the future, uncomment the query below
	// const { data: eventTrigger } = useQuery({
	// 	queryKey: ["eventTrigger", selectedEventId],
	// 	queryFn: async() => {
	// 		if (!session || !activeProject || !currentGraphId)
	// 			return Promise.reject(
	// 				"Either session, active project, or selected event ID is missing",
	// 			);
	// 		return getEventTrigger({
	// 			session,
	// 			projectId: activeProject?.project_id || "",
	// 			eventId: currentGraphId,
	// 			triggerType: "ui",
	// 		});
	// 	},
	// 	enabled: !!session && !!activeProject && !!currentGraphId,
	// });

	const sortedGraphs = useMemo(() => {
		if (!graphs || graphs.length === 0) {
			return [];
		}

		return graphs.slice().sort((a, b) => {
			const timeA = a.schedule?.time;
			const timeB = b.schedule?.time;
			const runTimeA = timeA ? (Array.isArray(timeA) ? timeA[0]?.run_time : timeA.run_time) : undefined;
			const runTimeB = timeB ? (Array.isArray(timeB) ? timeB[0]?.run_time : timeB.run_time) : undefined;

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
				.sort((a, b) => {
					const parseTime = (er: { run_time?: string; timestamp: string }): number => {
						if (er.run_time) {
							// Prefer run_time; handle both full ISO and time-only strings
							const rt = er.run_time;
							const parsed = rt.includes("T")
								? Date.parse(rt)
								: Date.parse(`2000-01-01T${rt}Z`);
							if (!Number.isNaN(parsed)) return parsed;
						}
						const ts = Date.parse(er.timestamp);
						return Number.isNaN(ts) ? 0 : ts;
					};
					return parseTime(b) - parseTime(a);
				})
				.map((eventResult) => ({
					id: eventResult.id,
					result: eventResult,
				})),
		}));
	}, [sortedGraphs]);

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

	const columns = useMemo<ColumnDef<ScheduleTableRow>[]>(
		() => [
			{
				accessorKey: "main",
				header: () => null,
				cell: ({ row }) => {
					if (row.original.schedule) {
						const schedule = row.original.schedule;
						const time = schedule.time;
						const run_time = time ? (Array.isArray(time) ? time[0]?.run_time : time.run_time) : undefined;
						if (run_time) {
							return (
								<div className="flex items-center">
									<span className="font-medium">
										{compact ? "Select a Meeting from the list:" : "Scheduled Workflow"}
									</span>
									{/* <span className="ml-2 text-xs text-muted-foreground">
										{(() => {
											const start = schedule.start;
											const zonePattern = /Z|[+-]\d\d:\d\d$/;
											let displayDate: Date;
											if (run_time.includes("T")) {
												const iso = zonePattern.test(run_time) ? run_time : `${run_time}Z`;
												displayDate = new Date(iso);
											} else if (start) {
												const datePart = start.split("T")[0];
												const iso = `${datePart}T${run_time}Z`;
												displayDate = new Date(iso);
											} else {
												displayDate = new Date(`2000-01-01T${run_time}Z`);
											}
											const timeZone = schedule.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone;
											return displayDate.toLocaleString([], { 
												dateStyle: compact ? "short" : "long", 
												timeStyle: compact ? "short" : "medium",
												timeZone,
											});
										})()}
									</span> */}
								</div>
							);
						}
						return (
							<div className="flex items-center">
								<span className="font-medium">
									{compact ? "Meetings" : "Running Workflow"}
								</span>
							</div>
						);
					} else if (row.original.result) {
						const result = row.original.result;
						const activelyListening = result?.listen;
						const currentlyRunning = result?.workflow_id;
						const isCompleted = result.status === "completed";
						const eventTag = result.description ? getEventTag(result.description) : null;

						// Calculate event date for time-based tag
						const rt = result.run_time;
						const zonePattern = /Z|[+-]\d\d:\d\d$/;
						let eventDate: Date;
						if (rt) {
							if (rt.includes("T")) {
								const iso = zonePattern.test(rt) ? rt : `${rt}Z`;
								eventDate = new Date(iso);
							} else {
								// Time-only: combine with the matching schedule.start date if available
								const parentSchedule = graphs
									.find((s) => s.event_result.some((er) => er.id === result.id))?.schedule;
								const baseDateStr = parentSchedule?.start
									? parentSchedule.start.split("T")[0]
									: (result.timestamp ? result.timestamp.split("T")[0] : new Date().toISOString()
										.split("T")[0]);
								
								// Get the timezone from parent schedule or use browser's timezone
								const eventTimeZone = parentSchedule?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone;
								
								// Create the date string and treat it as local time in the event's timezone
								const dateTimeString = `${baseDateStr}T${rt}`;
								
								// Create a temporary date object
								const tempDate = new Date(dateTimeString);
								
								// Convert from event timezone to user's local timezone
								const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
								
								// Create a date in the event timezone, then convert to user's timezone
								const eventDateInEventTz = new Date(tempDate.toLocaleString("sv-SE", { timeZone: eventTimeZone }));
								const eventDateInUserTz = new Date(eventDateInEventTz.toLocaleString("sv-SE", { timeZone: userTimezone }));
								eventDate = eventDateInUserTz;
							}
						} else {
							eventDate = new Date(result.timestamp);
						}

						const timeBasedTag = getTimeBasedTag(eventDate, currentTime);

						return (
							<div
								className={`pl-${
									compact ? "4" : "8"
								} flex flex-col items-start gap-2`}
							>
								<div className="flex items-center gap-2">
									<span className="text-sm">
										{(() => {
											// Always display in user's local timezone
											return eventDate.toLocaleString([], {
												dateStyle: compact ? "short" : "long",
												timeStyle: compact ? "short" : "medium",
											});
										})()}
									</span>
									{eventTag && (
										<span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${eventTag.color}`}>
											{eventTag.label}
										</span>
									)}
									<span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${timeBasedTag.color}`}>
										{timeBasedTag.label}
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
		[compact, graphs, clearProcess, currentTime],
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
	}, [isFetchingEventResult, isFetched, setIsLoadingResult]);

	useEffect(() => {
		if (fetchedEventResult) {
			setCurrentResult(fetchedEventResult?.result);
			setSelectedEventId(null);
		}
	}, [fetchedEventResult, setCurrentResult]);

	// Update current time every minute
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000); // Update every minute
		return () => clearInterval(timer);
	}, []);

	return (
		<div className={cn("w-full", compact && "text-sm")}>
			{/* Current Time Display */}
			<div className="mb-4 p-3 ">
				<p className="text-sm font-medium text-gray-700">
					Your current day and time: <span className="text-gray-700 font-semibold">
						{currentTime.toLocaleString([], {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</p>
			</div>
			{graphs && graphs.length > 0 ? (
				<Table>
					<TableBody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<WorkflowListItem
									compact={compact}
									graphs={graphs}
									key={row.id}
									onWorkflowSelect={onWorkflowSelect}
									row={row}
									setSelectedEventId={setSelectedEventId}
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
	graphs: EventSchedule[];
	setSelectedEventId: (_: string) => void;
	onWorkflowSelect?: () => void;
}

const WorkflowListItem = ({ row, compact,  graphs, setSelectedEventId, onWorkflowSelect }: WorkflowListItemProps): React.ReactNode => {
	const { selectedWorkflowId, setSelectedWorkflowId } = useWorkflow();
	const { setCurrentResult } = useWorkflow();
	const isSelected = row.original.result?.id === selectedWorkflowId;
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
							setCurrentResult(row.original.result);
							setSelectedWorkflowId(row.original.result.id);
							onWorkflowSelect?.();
							return;
						}

						const eventResult = graphs
							.flatMap((schedule) => schedule.event_result)
							.find((er) => er.id === row.original.result?.id);

						if (eventResult?.nodes) {
							setCurrentResult(eventResult);
							setSelectedWorkflowId(row.original.result.id);
							onWorkflowSelect?.();
						} else {
							setSelectedEventId(row.original.result?.id);
							setSelectedWorkflowId(row.original.result.id);
							onWorkflowSelect?.();
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

const WorkflowItem = ({ name }: {name: React.ReactNode}): React.ReactNode => {
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
			<div>{name} </div>
		</div>
	);
};

const CancelRunningWorkflowButton = ({ clearProcess, row, buttonClassName }: { clearProcess: (_: string) => void, row: Row<ScheduleTableRow>, buttonClassName: string }): React.ReactNode => {
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