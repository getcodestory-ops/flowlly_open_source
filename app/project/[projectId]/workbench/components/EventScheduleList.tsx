import React, { useState, useMemo, useEffect } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  getExpandedRowModel,
  Row,
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
import { NodeStatus } from "@/components/ProjectEvent/CustomWorkFlow/types";
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
  onSelectGraph: (event: EventResult) => void;
  eventId: string;
}

export const EventScheduleList: React.FC<EventScheduleListProps> = ({
  graphs,
  onSelectGraph,
  eventId,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: eventTrigger } = useQuery({
    queryKey: ["eventTrigger", selectedEventId],
    queryFn: async () => {
      if (!session || !activeProject || !eventId)
        return Promise.reject(
          "Either session, active project, or selected event ID is missing"
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

  const tableData: ScheduleTableRow[] = useMemo(
    () =>
      graphs.map((eventSchedule) => ({
        id: eventSchedule.id,
        schedule: eventSchedule.schedule,
        subRows: [
          ...eventSchedule.event_result.map((eventResult) => ({
            id: eventResult.id,
            result: eventResult,
          })),
        ],
      })),
    [graphs, eventTrigger]
  );

  const columns = useMemo<ColumnDef<ScheduleTableRow>[]>(
    () => [
      {
        accessorKey: "main",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0"
          >
            Recurrences
          </Button>
        ),
        cell: ({ row }) => {
          if (row.original.schedule) {
            const schedule = row.original.schedule;
            const run_time = schedule.time?.[0]?.run_time;
            if (run_time) {
              // Create date object using local timezone
              const localDate = new Date(`2000-01-01T${run_time}Z`);

              return localDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
            return "Upcoming";
          } else if (row.original.result) {
            const result = row.original.result;
            const activelyListening = result?.listen;
            const currentlyRunning = result?.workflow_id;

            return (
              <div className="pl-8 flex items-center gap-2">
                {new Date(result.timestamp).toDateString() +
                  " - " +
                  result.name}
                {activelyListening && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="ml-1 text-sm text-green-600">
                      Waiting for input
                    </span>
                  </div>
                )}
                {currentlyRunning && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                      <span className="ml-1 text-sm text-purple-600">
                        Currently running
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 px-2 text-xs"
                        >
                          Clear
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
                  </div>
                )}
              </div>
            );
          } else {
            return null;
          }
        },
      },
      // Add other columns as needed
    ],
    []
  );

  const table = useReactTable<ScheduleTableRow>({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
      expanded: true,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
  });

  const { data: fetchedEventResult, isLoading: isFetchingEventResult } =
    useQuery({
      queryKey: ["eventResult", selectedEventId],
      queryFn: async () => {
        if (!session || !activeProject || !selectedEventId) return null;
        return getEventResult({
          session,
          projectId: activeProject.project_id,
          eventId: selectedEventId,
        });
      },
      enabled: !!session && !!activeProject && !!selectedEventId,
      staleTime: 0,
      refetchOnWindowFocus: true,
    });

  const { mutate: clearProcess } = useMutation({
    mutationFn: async (workflowId: string) => {
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

  const renderRow = (row: Row<ScheduleTableRow>) => {
    return (
      <React.Fragment key={row.id}>
        <TableRow
          onClick={() => {
            if (row.original.subRows) {
              row.toggleExpanded();
            } else if (row.original.result) {
              if (row.original.id === "eventTrigger") {
                onSelectGraph(row.original.result);
                return;
              }

              const eventResult = graphs
                .flatMap((schedule) => schedule.event_result)
                .find((er) => er.id === row.original.result?.id);

              if (eventResult?.nodes) {
                onSelectGraph(eventResult);
              } else {
                setSelectedEventId(row.original.result?.id);
              }
            }
          }}
          className={cn(
            "cursor-pointer hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-500 rounded-lg",
            row.depth > 0 && "bg-gray-50"
          )}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </React.Fragment>
    );
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
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
                        header.getContext()
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
            table.getRowModel().rows.map(renderRow)
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
