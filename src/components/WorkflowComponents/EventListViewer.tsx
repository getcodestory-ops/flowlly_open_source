"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
	ArrowDown,
	ArrowUp,
	PencilIcon,
	Calendar,
	Trash2,
	GitMerge,
	ChevronRight,
	ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
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
	getPaginationRowModel,
	getExpandedRowModel,
	getGroupedRowModel,
	ExpandedState,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/Schedule/ScheduleTable/DataTablePagination";
import { CalendarView } from "./CalendarView";
import type { GraphData } from "./types";
import ProjectEventCreationForm from "@/components/ProjectEvent/ProjectEventCreationForm";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltipped } from "@/components/Common/Tooltiped";
import { convertIsoToTimeAgo } from "@/utils/dateUtils";
import { ViewMode } from "./types";
import { WorkflowViewModeSwitcher } from "./WorkflowViewModeSwitcher";
import { useWorkflow } from "@/hooks/useWorkflow";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useStore } from "@/utils/store";
import { deleteProjectEvent, mergeProjectEvents } from "@/api/taskQueue";
import ImportMeetingsDialog from "./ImportMeetingsDialog";
import CreateJob from "./CreateJob";
import { Checkbox } from "@/components/ui/checkbox";
const localeText = {
	searchWorkflows: "Filter meetings by name or type...",
};


export const EventListViewer: React.FC = ({
}) => {
	const { setCurrentGraphId, viewMode, graphs } = useWorkflow();
	const onSelectGraph = (id: string): void => {
		setCurrentGraphId(id);
	};
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [expanded, setExpanded] = useState<ExpandedState>(true);
	const [grouping, setGrouping] = useState<string[]>(["name"]); // Start grouped by default
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedEventType, setSelectedEventType] = useState<string | null>( null );
	const [selectedEventData, setSelectedEventData] = useState<GraphData | null>( null );
	const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const [isMergeMode, setIsMergeMode] = useState(false);
	const [selectedEventsForMerge, setSelectedEventsForMerge] = useState<string[]>([]);
	const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const { session, activeProject } = useStore();





	const { mutate: deleteProjectEventMutation } = useMutation({
		mutationFn: async(eventId: string) => {
			if (!session || !activeProject?.project_id) return;

			await deleteProjectEvent({ session, projectId: activeProject.project_id, eventId });
		},
		onSuccess: () => {
			toast({
				title: "Event deleted successfully",
				description: "The event has been deleted from the project",
			});
			queryClient.invalidateQueries({ queryKey: ["projectEvents"] });
		},
	});

	const { mutate: mergeEventsMutation, isPending: isMerging } = useMutation({
		mutationFn: async({ mergeFromId, mergeIntoId }: { mergeFromId: string; mergeIntoId: string }) => {
			if (!session || !activeProject?.project_id) return;

			await mergeProjectEvents({
				session,
				projectId: activeProject.project_id,
				mergeFromEventId: mergeFromId,
				mergeIntoEventId: mergeIntoId,
			});
		},
		onSuccess: () => {
			toast({
				title: "Events merged successfully",
				description: "The events have been merged and schedules moved",
			});
			queryClient.invalidateQueries({ queryKey: ["projectEvents"] });
			setIsMergeDialogOpen(false);
			setSelectedEventsForMerge([]);
			setIsMergeMode(false);
		},
		onError: (error: unknown) => {
			const errorMessage = error instanceof Error 
				? error.message 
				: (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail 
				|| "An error occurred while merging events";
			toast({
				title: "Failed to merge events",
				description: errorMessage,
				variant: "destructive",
			});
		},
	});

	const onClickEdit = (info: GraphData) => {
		const eventType = info.event_type;
		setSelectedEventType(eventType);
		setSelectedEventData(info);
		setIsDialogOpen(true);
	};

	const toggleEventSelection = useCallback((eventId: string) => {
		setSelectedEventsForMerge((prev) => {
			if (prev.includes(eventId)) {
				return prev.filter((id) => id !== eventId);
			}
			// Only allow selecting 2 events
			if (prev.length >= 2) {
				toast({
					title: "Maximum selection reached",
					description: "You can only select 2 events to merge",
					variant: "destructive",
				});
				return prev;
			}
			return [...prev, eventId];
		});
	}, [toast]);

	const handleMergeClick = () => {
		if (selectedEventsForMerge.length === 2) {
			setIsMergeDialogOpen(true);
		}
	};

	const handleConfirmMerge = (mergeFromId: string, mergeIntoId: string) => {
		mergeEventsMutation({ mergeFromId, mergeIntoId });
	};






	const columns = useMemo<ColumnDef<GraphData>[]>(
		() => {
			const cols: ColumnDef<GraphData>[] = [];
			
			// Add checkbox column when in merge mode (only if not grouping)
			if (isMergeMode && grouping.length === 0) {
				cols.push({
					id: "select",
					header: "Select",
					cell: ({ row }) => (
						<Checkbox
							checked={selectedEventsForMerge.includes(row.original.id)}
							onCheckedChange={() => toggleEventSelection(row.original.id)}
							onClick={(e) => e.stopPropagation()}
						/>
					),
				});
			}

			cols.push(
				{
					accessorKey: "name",
					header: ({ column }) => (
						<Button
							className="p-0"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
							variant="ghost"
						>
							Name
						</Button>
					),
					cell: ({ row, getValue }) => {
						if (row.getIsGrouped()) {
							// This is a grouped row (parent)
							return (
								<div className="flex items-center gap-2 font-medium">
									<button
										className="p-1 hover:bg-gray-100 rounded"
										onClick={(e) => {
											e.stopPropagation();
											row.toggleExpanded();
										}}
									>
										{row.getIsExpanded() ? (
											<ChevronDown className="h-4 w-4" />
										) : (
											<ChevronRight className="h-4 w-4" />
										)}
									</button>
									<span>{getValue() as string}</span>
									<span className="text-xs text-gray-500 font-normal">
										({row.subRows.length} {row.subRows.length === 1 ? "instance" : "instances"})
									</span>
								</div>
							);
						}
						// This is a child row - show the full event name with indent
						return (
							<div className="pl-8">
								{row.original.name}
							</div>
						);
					},
				},
				{
					accessorKey: "metadata.frequency",
					header: "Frequency",
					cell: ({ row }) => {
						if (row.getIsGrouped()) {
							// For grouped rows, determine frequency based on instance count
							return row.subRows.length > 1 ? "Recurrent" : "Once";
						}
						const metadata = row.original.metadata;
						return metadata?.frequency || "N/A";
					},
				},
			);

			cols.push(
				{
					accessorKey: "run_time",
					header: "Meeting Date & Time",
					accessorFn: (row) => {
						// Return a timestamp for sorting
						const g = row;
						const firstSchedule = g.event_schedule?.[0];
						const scheduleStart = firstSchedule?.schedule?.start;
						const scheduleTime = firstSchedule?.schedule?.time as { run_time?: string } | { run_time?: string }[] | undefined;
						const scheduleRunTime = Array.isArray(scheduleTime) ? scheduleTime?.[0]?.run_time : scheduleTime?.run_time;
						const rt = g.run_time || g.metadata?.time;
						const hasZoneRe = /Z|[+-]\d\d:\d\d$/;
						
						// Prefer schedule start + schedule run_time when available for exact meeting instance time
						if (scheduleStart && scheduleRunTime) {
							let isoFromSchedule: string;
							if (scheduleRunTime.includes("T")) {
								isoFromSchedule = hasZoneRe.test(scheduleRunTime) ? scheduleRunTime : `${scheduleRunTime}Z`;
							} else {
								const baseDateStr = scheduleStart.split("T")[0];
								isoFromSchedule = `${baseDateStr}T${scheduleRunTime}Z`;
							}
							return new Date(isoFromSchedule).getTime();
						}
						// Fallbacks
						if (rt) {
							if (rt.includes("T")) {
								const iso = hasZoneRe.test(rt) ? rt : `${rt}Z`;
								return new Date(iso).getTime();
							}
							const baseDateStr = (g.created_at || new Date().toISOString()).split("T")[0];
							return new Date(`${baseDateStr}T${rt}Z`).getTime();
						}
						return 0; // Return 0 for rows without time (will sort to bottom)
					},
					cell: ({ row }) => {
						// For grouped rows, use the latest event's date (first subRow)
						const g = row.getIsGrouped() && row.subRows.length > 0 ? row.subRows[0].original : row.original;
						
						const firstSchedule = g.event_schedule?.[0];
						const scheduleStart = firstSchedule?.schedule?.start;
						const scheduleTime = firstSchedule?.schedule?.time as { run_time?: string } | { run_time?: string }[] | undefined;
						const scheduleRunTime = Array.isArray(scheduleTime) ? scheduleTime?.[0]?.run_time : scheduleTime?.run_time;
						const rt = g.run_time || g.metadata?.time;
						const hasZoneRe = /Z|[+-]\d\d:\d\d$/;
						// Prefer schedule start + schedule run_time when available for exact meeting instance time
						if (scheduleStart && scheduleRunTime) {
							let isoFromSchedule: string;
							if (scheduleRunTime.includes("T")) {
								isoFromSchedule = hasZoneRe.test(scheduleRunTime) ? scheduleRunTime : `${scheduleRunTime}Z`;
							} else {
								const baseDateStr = scheduleStart.split("T")[0];
								isoFromSchedule = `${baseDateStr}T${scheduleRunTime}Z`;
							}
							const d = new Date(isoFromSchedule);
							return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
						}
						// Fallbacks
						if (rt) {
							if (rt.includes("T")) {
								const iso = hasZoneRe.test(rt) ? rt : `${rt}Z`;
								return new Date(iso).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
							}
							const baseDateStr = (g.created_at || new Date().toISOString()).split("T")[0];
							return new Date(`${baseDateStr}T${rt}Z`).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
						}
						return "N/A";
					},
				},
				{
					accessorKey: "id",
					header: "Edit",
					cell: ({ row }) => {
						// Don't show edit icon for grouped rows
						if (row.getIsGrouped()) {
							return null;
						}
						
						const eventType = row.original.event_type;
						return (
							<PencilIcon
								className="cursor-pointer  hover:text-purple-500 transition-colors"
								onClick={(e) => {
									e.stopPropagation();
									if (["meeting", "document_writing", "custom"].includes(eventType)) {
										setSelectedEventType(eventType);
										setSelectedEventData(row.original);
										setIsDialogOpen(true);
									}
								}}
								size={16}
							/>
						);
					},
				},
			);

			return cols;
		}, [setIsDialogOpen, setSelectedEventData, setSelectedEventType, isMergeMode, selectedEventsForMerge, toggleEventSelection, grouping]);

	const table = useReactTable({
		data: graphs || [],
		columns,
		state: {
			sorting,
			globalFilter,
			expanded,
			grouping,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onExpandedChange: setExpanded,
		onGroupingChange: setGrouping,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
	});

	// Define a reusable filter function for consistency across views
	const filterWorkflows = (workflows: GraphData[], searchTerm: string) => {
		if (!searchTerm) return workflows;

		const lowerSearch = searchTerm.toLowerCase();
		return workflows.filter(
			(workflow) =>
				workflow.name.toLowerCase().includes(lowerSearch) ||
        workflow.event_type.toLowerCase().includes(lowerSearch),
		);
	};

	// Add new grid view rendering
	const filteredGraphs = filterWorkflows(graphs || [], globalFilter);

	// Existing table view
	return (
		<div className="w-full">
			<div className="flex items-center py-4 gap-2">
				<WorkflowViewModeSwitcher />
				{viewMode !== ViewMode.CALENDAR && (
					<Input
						className="max-w-sm"
						onChange={(e) => setGlobalFilter(e.target.value)}
						placeholder={localeText.searchWorkflows}
						value={globalFilter ?? ""}
					/>
				)}
				{viewMode === ViewMode.LIST && (
					<>
						<Button
							onClick={() => {
								if (grouping.length > 0) {
									setGrouping([]);
								} else {
									setGrouping(["name"]);
									setExpanded(true); // Expand all groups by default
									// Disable merge mode when grouping
									if (isMergeMode) {
										setIsMergeMode(false);
										setSelectedEventsForMerge([]);
									}
								}
							}}
							size="sm"
							variant={grouping.length > 0 ? "default" : "outline"}
						>
							{grouping.length > 0 ? "Ungroup" : "Group by Name"}
						</Button>
						<Button
							disabled={grouping.length > 0}
							onClick={() => {
								setIsMergeMode(!isMergeMode);
								setSelectedEventsForMerge([]);
							}}
							size="sm"
							variant={isMergeMode ? "default" : "outline"}
						>
							<GitMerge className="h-4 w-4 mr-2" />
							{isMergeMode ? "Cancel Merge" : "Merge Events"}
						</Button>
						{isMergeMode && selectedEventsForMerge.length === 2 && (
							<Button
								onClick={handleMergeClick}
								size="sm"
								variant="default"
							>
								Merge Selected ({selectedEventsForMerge.length})
							</Button>
						)}
					</>
				)}
			</div>
			{viewMode === ViewMode.LIST && (
				<div>
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead className="whitespace-nowrap" key={header.id}>
											{header.isPlaceholder ? null : (
												<div
													className={
														header.column.getCanSort()
															? "cursor-pointer select-none flex items-center"
															: ""
													}
													onClick={
														header.column.getCanSort()
															? header.column.getToggleSortingHandler()
															: undefined
													}
												>
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
													{header.column.getIsSorted() === "asc" ? (
														<ArrowUp className="ml-2 h-4 w-4" />
													) : header.column.getIsSorted() === "desc" ? (
														<ArrowDown className="ml-2 h-4 w-4" />
													) : null}
												</div>
											)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.length > 0 ? (
								table.getRowModel().rows.map((row) => {
									const isGroupRow = row.getIsGrouped();
									return (
										<TableRow
											className={isGroupRow ? "bg-gray-50" : "cursor-pointer hover:bg-gray-100"}
											key={row.id}
											onClick={() => {
												if (!isGroupRow) {
													onSelectGraph(row.original.id);
												}
											}}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{cell.getIsGrouped() ? (
														// Render the grouped cell
														flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)
													) : cell.getIsAggregated() ? (
														// Render aggregated cell (if any)
														null
													) : cell.getIsPlaceholder() ? (
														// Render placeholder for cells in grouped rows
														null
													) : (
														// Render normal cell
														flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)
													)}
												</TableCell>
											))}
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell className="text-center" colSpan={columns.length}>
										No results found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					<div className="pt-4">
						<DataTablePagination table={table} />
					</div>
				</div>
			)}
			{viewMode === ViewMode.CALENDAR && (
				<CalendarView />
			)}
			{viewMode === ViewMode.GRID && (
				<div>
					
					<div>
						{/* <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">Meetings</h2> */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
							{filteredGraphs.filter((graph) => graph.event_type === "meeting").length > 0 ? (
								filteredGraphs
									.filter((graph) => graph.event_type === "meeting")
									.map((graph) => (
										<Card
											className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
											key={graph.id}
											onClick={() => onSelectGraph(graph.id)}
										>
											<CardHeader className="pb-2">
												<div className="flex justify-between items-center gap-4">
													<CardTitle className="text-lg font-medium truncate whitespace-nowrap overflow-hidden w-full">
														<Tooltipped tooltip={graph.name}>
															<div className="truncate">{graph.name}</div>
														</Tooltipped>
													</CardTitle>
													<Badge variant="outline">{graph.event_type}</Badge>
												</div>
											</CardHeader>
											<CardContent>
												<p className="text-sm text-muted-foreground line-clamp-2">
													{graph.description}
												</p>
											</CardContent>
											<CardFooter className="pt-2 flex justify-between text-xs text-muted-foreground">
												<div className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													<span>
														Created
													</span>
													<span className="">
														{formatTimeAgo(convertIsoToTimeAgo(graph.created_at) ?? "")}
													</span>
												</div>
												<div className="flex items-center gap-1">
													<Button
														onClick={(e) => {
															e.stopPropagation();
															onClickEdit(graph);
														}}
														size="icon"
														variant="ghost"
													>
														<PencilIcon className="h-3 w-3" />
													
													</Button>
													<Button
														onClick={(e) => {
															e.stopPropagation();
															deleteProjectEventMutation(graph.id);
														}}
														size="icon"
														variant="ghost"
													>
														<Trash2 className="h-3 w-3" />
													</Button>
												</div>
											</CardFooter>
										</Card>
									))
							) : (
								<div className="col-span-full flex flex-col items-center justify-center p-12 space-y-8">
									{/* Main Icon */}
									<div className="relative">
										<div className="">
											<Calendar className="h-8 w-8 text-gray-400" />
										</div>
									</div>
									{/* Title and Description */}
									<div className="text-center space-y-3 max-w-md">
										<h3 className="text-2xl font-bold text-gray-900">
										No Meetings Yet
										</h3>
										<p className="text-gray-600">
										Get started by creating a new meeting or importing from your Microsoft Calendar
										</p>
									</div>
									<div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
										<CreateJob />
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{isDialogOpen && (
				<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
					<DialogContent className="max-w-[90vw]">
						{selectedEventType === "meeting" && (
							<>
								<h2 className="text-lg font-semibold">Edit Meeting</h2>
								<ProjectEventCreationForm
									editData={selectedEventData!}
									onClose={() => setIsDialogOpen(false)}
								/>
							</>
						)}
					</DialogContent>
				</Dialog>
			)}
			<Sheet onOpenChange={setIsCreateMeetingOpen} open={isCreateMeetingOpen}>
				<SheetContent className="w-[50vw]" side="right">
					<SheetTitle>Create New Meeting</SheetTitle>
					<ProjectEventCreationForm onClose={() => setIsCreateMeetingOpen(false)} />
				</SheetContent>
			</Sheet>
			<ImportMeetingsDialog 
				isOpen={isImportDialogOpen} 
				onClose={() => setIsImportDialogOpen(false)} 
			/>
			<MergeEventsDialog
				events={graphs || []}
				isMerging={isMerging}
				isOpen={isMergeDialogOpen}
				onClose={() => setIsMergeDialogOpen(false)}
				onConfirm={handleConfirmMerge}
				selectedEventIds={selectedEventsForMerge}
			/>
		</div>
	);
};

// Merge Events Dialog Component
interface MergeEventsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	selectedEventIds: string[];
	events: GraphData[];
	onConfirm: (mergeFromId: string, mergeIntoId: string) => void;
	isMerging: boolean;
}

const MergeEventsDialog: React.FC<MergeEventsDialogProps> = ({
	isOpen,
	onClose,
	selectedEventIds,
	events,
	onConfirm,
	isMerging,
}) => {
	const [mergeFromId, setMergeFromId] = useState<string>("");
	const [mergeIntoId, setMergeIntoId] = useState<string>("");

	const selectedEvents = events.filter((event) =>
		selectedEventIds.includes(event.id),
	);

	React.useEffect(() => {
		if (selectedEventIds.length === 2) {
			setMergeFromId(selectedEventIds[0]);
			setMergeIntoId(selectedEventIds[1]);
		}
	}, [selectedEventIds]);

	const handleConfirm = () => {
		if (mergeFromId && mergeIntoId) {
			onConfirm(mergeFromId, mergeIntoId);
		}
	};

	const mergeFromEvent = selectedEvents.find((e) => e.id === mergeFromId);
	const mergeIntoEvent = selectedEvents.find((e) => e.id === mergeIntoId);

	return (
		<Dialog onOpenChange={onClose} open={isOpen}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Merge Events</DialogTitle>
					<DialogDescription>
						Select which event to merge from and which event to merge into. All schedules from the source event will be moved to the target event, and the source event will be deleted.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Merge From (will be deleted):</label>
						<div className="grid grid-cols-2 gap-2">
							{selectedEvents.map((event) => (
								<Card
									className={`cursor-pointer transition-all ${
										mergeFromId === event.id ? "border-red-500 border-2" : ""
									}`}
									key={event.id}
									onClick={() => {
										setMergeFromId(event.id);
										if (mergeIntoId === event.id) {
											setMergeIntoId(selectedEventIds.find((id) => id !== event.id) || "");
										}
									}}
								>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm">{event.name}</CardTitle>
									</CardHeader>
									<CardContent className="text-xs text-muted-foreground">
										<p>Type: {event.event_type}</p>
										<p>Schedules: {event.event_schedule?.length || 0}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Merge Into (will keep):</label>
						<div className="grid grid-cols-2 gap-2">
							{selectedEvents.map((event) => (
								<Card
									className={`cursor-pointer transition-all ${
										mergeIntoId === event.id ? "border-green-500 border-2" : ""
									}`}
									key={event.id}
									onClick={() => {
										setMergeIntoId(event.id);
										if (mergeFromId === event.id) {
											setMergeFromId(selectedEventIds.find((id) => id !== event.id) || "");
										}
									}}
								>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm">{event.name}</CardTitle>
									</CardHeader>
									<CardContent className="text-xs text-muted-foreground">
										<p>Type: {event.event_type}</p>
										<p>Schedules: {event.event_schedule?.length || 0}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
					{mergeFromEvent && mergeIntoEvent && (
						<div className="bg-muted p-4 rounded-md">
							<p className="text-sm font-medium mb-2">Summary:</p>
							<ul className="text-sm space-y-1">
								<li>• <span className="text-red-600">{mergeFromEvent.name}</span> will be deleted</li>
								<li>• All {mergeFromEvent.event_schedule?.length || 0} schedule(s) will be moved to <span className="text-green-600">{mergeIntoEvent.name}</span></li>
								<li>• <span className="text-green-600">{mergeIntoEvent.name}</span> will have {(mergeIntoEvent.event_schedule?.length || 0) + (mergeFromEvent.event_schedule?.length || 0)} schedule(s) after merge</li>
							</ul>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button 
						disabled={isMerging}
						onClick={onClose} 
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={!mergeFromId || !mergeIntoId || mergeFromId === mergeIntoId || isMerging}
						onClick={handleConfirm}
					>
						{isMerging ? "Merging..." : "Confirm Merge"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const formatTimeAgo = (timeAgoString: string): string => {
	return timeAgoString
		.replace("about ", "") // Remove "about"
		.replace(" seconds", "s")
		.replace(" second", "s")
		.replace(" minutes", "m")
		.replace(" minute", "m")
		.replace(" hours", "h")
		.replace(" hour", "h")
		.replace(" months", "mo")
		.replace(" month", "mo")
		.replace(" weeks", "wk")
		.replace(" week", "wk")
		.replace(" days", "d")
		.replace(" day", "d")
		.replace(" years", "y")
		.replace(" year", "y")
		.trim(); // Ensure consistent "ago" format
};
