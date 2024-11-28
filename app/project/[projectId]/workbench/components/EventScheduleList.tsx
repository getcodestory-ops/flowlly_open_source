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
import { getEventResult } from "@/api/taskQueue";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
interface EventScheduleListProps {
  graphs: EventSchedule[];
  onSelectGraph: (event: EventResult) => void;
}

export const EventScheduleList: React.FC<EventScheduleListProps> = ({
  graphs,
  onSelectGraph,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const tableData: ScheduleTableRow[] = useMemo(
    () =>
      graphs.map((eventSchedule) => ({
        id: eventSchedule.id,
        schedule: eventSchedule.schedule,
        subRows: eventSchedule.event_result.map((eventResult) => ({
          id: eventResult.id,
          result: eventResult,
        })),
      })),
    [graphs]
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

            return (
              <div className="pl-8">
                {new Date(result.timestamp).toDateString() +
                  " - " +
                  result.name}
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
    });

  useEffect(() => {
    if (isFetchingEventResult) {
      onSelectGraph({
        id: "",
        name: "",
        status: "",
        run_time: "",
        nodes: [{ id: "", title: "loading...", output: "loading..." }],
        timestamp: "",
        description: "",
      } as EventResult);
    }
    if (fetchedEventResult) {
      onSelectGraph(fetchedEventResult?.result);
      setSelectedEventId(null);
    }
  }, [fetchedEventResult, isFetchingEventResult]);

  const renderRow = (row: Row<ScheduleTableRow>) => {
    return (
      <React.Fragment key={row.id}>
        <TableRow
          onClick={() => {
            if (row.original.subRows) {
              row.toggleExpanded();
            } else if (row.original.result) {
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
            "cursor-pointer hover:bg-gray-100",
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
