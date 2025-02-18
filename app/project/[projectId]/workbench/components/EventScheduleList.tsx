import React, { useState, useMemo, useEffect, useRef } from "react";
import { ArrowDown, ArrowUp, MessageSquare, X } from "lucide-react";
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
import PlatformChatComponent from "@/components/ChatInput/PlatformChat/PlatformChatComponent";

interface EventScheduleListProps {
  graphs: EventSchedule[];
  onSelectGraph: (event: EventResult) => void;
  eventId: string;
  setIsLoadingResult: (isLoading: boolean) => void;
}

export const EventScheduleList: React.FC<EventScheduleListProps> = ({
  graphs,
  onSelectGraph,
  eventId,
  setIsLoadingResult,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Added pagination state
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 0,
    pageSize: 10,
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

  const sortedGraphs = useMemo(() => {
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

  const tableData: ScheduleTableRow[] = useMemo(
    () =>
      sortedGraphs.map((eventSchedule) => ({
        id: eventSchedule.id,
        schedule: eventSchedule.schedule,
        subRows: eventSchedule.event_result
          .slice() // create copy to avoid mutating original data
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .map((eventResult) => ({
            id: eventResult.id,
            result: eventResult,
          })),
      })),
    [sortedGraphs, eventTrigger]
  );

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
              // Remove the Workflows text
              return "Completed";
            }
            return "Running";
          } else if (row.original.result) {
            const result = row.original.result;
            const activelyListening = result?.listen;
            const currentlyRunning = result?.workflow_id;

            return (
              <div className="pl-8 flex flex-col  items-start gap-2">
                {new Date(result.timestamp).toLocaleString([], {
                  dateStyle: "long",
                  timeStyle: "medium",
                })}
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
            return "null";
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
    queryFn: async () => {
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
    // Check if this row is selected
    const isSelected = row.original.result?.id === selectedResultId;

    return (
      <React.Fragment key={row.id}>
        <TableRow
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
          className={cn(
            "cursor-pointer  hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-500 rounded-lg",
            row.depth > 0 && "",
            isSelected && "bg-gradient-to-r from-indigo-100 to-purple-500 " // Add highlight for selected row
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
      {/* Pagination Controls - Styled uniformly to match DataTablePagination */}
      <div className="flex items-center justify-between px-2 mt-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          {/* <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                const newSize = Number(value);
                setPagination((prev) => ({
                  ...prev,
                  pageSize: newSize,
                  pageIndex: 0,
                }));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>«
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>›
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>»
            </Button>
          </div>
        </div>
      </div>

      {isFetchingEventResult && (
        <div className="flex items-center justify-center h-full mt-2">
          <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[progressLine_10s_linear_infinite]"></div>
        </div>
      )}
      {selectedResultId && (
        <div className="z-100">
          <Button
            className="z-[100] fixed bottom-4 right-4 rounded-full w-auto h-auto p-2 flex items-center gap-2"
            onClick={() => setIsChatOpen((prev) => !prev)}
          >
            <div className="bg-white text-primary-foreground rounded-full p-2">
              <MessageSquare size={24} />
            </div>
            <span className="pr-2">Questions about workflow</span>
          </Button>

          {(isChatOpen || isClosing) && (
            <div
              ref={chatRef}
              className={`fixed bottom-20 right-4 w-[calc(100vw-200px)] z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-opacity duration-300 ${
                isClosing ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="absolute top-2 left-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsClosing(true);
                    setTimeout(() => {
                      setIsChatOpen(false);
                      setIsClosing(false);
                    }, 300);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <PlatformChatComponent
                folderId={selectedResultId}
                folderName={fetchedEventResult?.result.name ?? "workflow"}
                chatTarget="workflow"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
