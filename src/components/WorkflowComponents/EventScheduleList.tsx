import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Video,
	FileText,
	List,
	Calendar,
} from "lucide-react";
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
import { Tooltipped } from "@/components/Common/Tooltiped";

interface EventScheduleListProps {
  graphs: EventSchedule[];
  onWorkflowSelect?: () => void;
}

// Helper function to determine event tag based on description
const getEventTag = (description: string): { label: string; color: string } | null => {
	const lowerDesc = description.toLowerCase();
	if (lowerDesc.includes("meeting minutes")) {
		return { label: "Agenda", color: "bg-blue-100 text-blue-800 border-blue-300" };
	}
	if (lowerDesc.includes("creating process from user input")) {
		return { label: "Meeting", color: "bg-purple-100 text-purple-800 border-purple-300" };
	}
	return null;
};

// Helper function to determine time-based tag
const getTimeBasedTag = (eventDate: Date, currentTime: Date): { label: string; color: string } => {
	const diffMs = eventDate.getTime() - currentTime.getTime();
	const diffMinutes = Math.floor(diffMs / 60000);
	
	if (diffMs < 0) {
		// Event is in the past
		return { label: "Finished", color: "bg-amber-100 text-gray-700 border-amber-300" };
	} else if (diffMinutes <= 60) {
		// Event is happening in 1 hour or less
		return { label: `Happening in ${diffMinutes} minutes`, color: "bg-green-100 text-green-800 border-green-300" };
	} else {
		// Event is more than 1 hour in the future
		return { label: "Upcoming", color: "bg-orange-100 text-orange-800 border-orange-300" };
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
	
	// Store node data for events (eventId -> array of {id, status, output})
	const [eventNodesMap, setEventNodesMap] = useState<Record<string, Array<{ id: string; status: string; output?: unknown }>>>({});
	
	// Track which events we're currently fetching to avoid duplicate requests
	const [fetchingEventIds, setFetchingEventIds] = useState<Set<string>>(new Set());

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
				.filter((eventResult) => {
					// Filter out events with "Agenda" tag
					const eventTag = eventResult.description ? getEventTag(eventResult.description) : null;
					return eventTag?.label !== "Agenda";
				})
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
		})).filter((scheduleRow) => scheduleRow.subRows && scheduleRow.subRows.length > 0);
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

						// Get node data (id and status) from either the result directly or from our fetched map
						
						
						const nodeData = result.nodes 
							? result.nodes.map((n: { id: string; status: string; output?: unknown }) => ({ id: n.id, status: n.status, output: n.output }))
							: eventNodesMap[result.id] || [];
						
						// Debug logging
					

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
											// Display date in text format with abbreviated month
											return eventDate.toLocaleString([], {
												month: "short",
												day: "numeric",
												year: "numeric",
												hour: "numeric",
												minute: "2-digit",
												hour12: true,
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
									{/* Display node icons */}
									{(() => {
										// Show loading skeleton if currently fetching
										if (fetchingEventIds.has(result.id)) {
											return (
												<Tooltipped tooltip="Loading meeting data...">
													<div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md animate-pulse">
														<div className="h-3.5 w-3.5 bg-gray-300 rounded" />
														<div className="h-3.5 w-3.5 bg-gray-300 rounded" />
													</div>
												</Tooltipped>
											);
										}
										
										return nodeData.length > 0 && (
											<div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md">
												{(() => {
													// Create map to group nodes by type with their status
													const nodesByType = new Map<string, { status: string; isFailed: boolean }>();
													
													nodeData.forEach((node) => {
														const lowerNodeId = node.id.toLowerCase();
														let type = null;
														
														if (lowerNodeId.includes("record") || lowerNodeId.includes("transcribe")) {
															type = "recording";
														} else if (lowerNodeId.includes("minutes")) {
															type = "minutes";
														} else if (lowerNodeId.includes("action")) {
															type = "actions";
														} else if (lowerNodeId.includes("agenda")) {
															type = "agenda";
														}
														
														if (type) {
															// If type already exists, update status to failed if any node failed
															const existing = nodesByType.get(type);
															
															// Check if node failed OR if minutes node has "meeting transcript was not provided"
															let isFailed = node.status === "failed";
															if (type === "minutes" && node.output) {
																const outputStr = typeof node.output === "string" 
																	? node.output 
																	: JSON.stringify(node.output);
																if (outputStr.toLowerCase().includes("meeting transcript was not provided")) {
																	isFailed = true;
																}
															}
															
															if (!existing || (isFailed && !existing.isFailed)) {
																nodesByType.set(type, { 
																	status: node.status, 
																	isFailed: isFailed || (existing?.isFailed ?? false),
																});
															}
														}
													});
													
													return Array.from(nodesByType.entries()).map(([type, { isFailed }], idx) => {
														// Get tooltip text based on type
														let tooltipText = "";
														if (type === "recording") {
															tooltipText = isFailed ? "Meeting Recording - Failed" : "Meeting Recording Available";
														} else if (type === "minutes") {
															tooltipText = isFailed ? "Meeting Minutes - Failed or Unavailable" : "Meeting Minutes Available";
														} else if (type === "actions") {
															tooltipText = isFailed ? "Action Items - Failed" : "Action Items Available";
														} else if (type === "agenda") {
															tooltipText = isFailed ? "Next Meeting Agenda - Failed" : "Next Meeting Agenda Available";
														}
														
														return (
															<Tooltipped key={idx} tooltip={tooltipText}>
																<span className="relative inline-flex items-center text-gray-600">
																	{type === "recording" && <Video className="h-3.5 w-3.5" />}
																	{type === "minutes" && <FileText className="h-3.5 w-3.5" />}
																	{type === "actions" && <List className="h-3.5 w-3.5" />}
																	{type === "agenda" && <Calendar className="h-3.5 w-3.5" />}
																	{isFailed && (
																		<div className="absolute inset-0 flex items-center justify-center">
																			<div className="w-full h-[1.5px] bg-red-500 rotate-45 transform" />
																		</div>
																	)}
																</span>
															</Tooltipped>
														);
													});
												})()}
											</div>
										);
									})()}
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
		[compact, graphs, clearProcess, currentTime, eventNodesMap, fetchingEventIds],
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

	// Fetch node data for events that don't have it - optimized with incremental updates
	useEffect(() => {
		if (!session || !activeProject || !graphs || graphs.length === 0) return;

		const fetchNodeData = async(): Promise<void> => {
			const allEventResults = graphs.flatMap((schedule) => schedule.event_result);
			// Filter out events that already have nodes, are already fetched, or are being fetched
			const eventsWithoutNodes = allEventResults.filter(
				(er) => !er.nodes && !eventNodesMap[er.id] && !fetchingEventIds.has(er.id),
			);
			
			if (eventsWithoutNodes.length === 0) return;
			
			
			// Mark these events as being fetched
			setFetchingEventIds((prev) => {
				const newSet = new Set(prev);
				eventsWithoutNodes.forEach((er) => newSet.add(er.id));
				return newSet;
			});
			
			// Fetch and update incrementally - icons appear as each fetch completes
			eventsWithoutNodes.forEach(async(eventResult) => {
				try {
					const result = await getEventResult({
						session,
						projectId: activeProject.project_id,
						resultId: eventResult.id,
					});
					
					if (result?.result?.nodes) {
						const nodeData = result.result.nodes.map((node: { id: string; status: string; output?: unknown }) => ({ 
							id: node.id, 
							status: node.status,
							output: node.output,
						}));
						
						// Update state immediately for this event
						setEventNodesMap((prev) => ({
							...prev,
							[eventResult.id]: nodeData,
						}));
					}
				} catch {
					// Silently fail and continue
				} finally {
					// Remove from fetching set
					setFetchingEventIds((prev) => {
						const newSet = new Set(prev);
						newSet.delete(eventResult.id);
						return newSet;
					});
				}
			});
		};

		fetchNodeData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [graphs, session, activeProject]);

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

const WorkflowListItem = ({ row, compact, graphs, setSelectedEventId, onWorkflowSelect }: WorkflowListItemProps): React.ReactNode => {
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