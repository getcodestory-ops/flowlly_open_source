"use client";
import React, { useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  PencilIcon,
  Calendar,
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
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/Schedule/ScheduleTable/DataTablePagination";
import { CalendarView } from "./CalendarView";
import CreateJob from "./CreateJob";
import type { GraphData, EventResult, GraphListProps } from "./types";
import ProjectEventCreationForm from "@/components/ProjectEvent/ProjectEventCreationForm";
import DocumentWriterForm from "@/components/ProjectEvent/DocumentWriterForm";
import CustomWorkflowForm from "@/components/ProjectEvent/CustomWorkFlow/CustomWorkflowForm";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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

import { ViewMode } from "./Assignment";
export const GraphList: React.FC<GraphListProps> = ({
  graphs,
  onSelectGraph,
  viewMode = ViewMode.LIST,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(
    null
  );
  const [selectedEventData, setSelectedEventData] = useState<GraphData | null>(
    null
  );

  const onClickEdit = (info: GraphData) => {
    const eventType = info.event_type;
    setSelectedEventType(eventType);
    setSelectedEventData(info);
    setIsDialogOpen(true);
  };

  const columns = useMemo<ColumnDef<GraphData>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0"
          >
            Name
          </Button>
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "event_type",
        header: "Type",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "metadata.frequency",
        header: "Frequency",
        cell: (info) => {
          const metadata = info.row.original.metadata;
          return metadata?.frequency || "N/A";
        },
      },
      {
        accessorKey: "metadata.recurrence_day",
        header: "Day",
        cell: (info) => {
          const metadata = info.row.original.metadata;
          if (!metadata) return "N/A";

          return metadata.frequency === "weekly" ||
            metadata.frequency === "once"
            ? metadata.recurrence_day
            : "N/A";
        },
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0"
          >
            Created At
          </Button>
        ),
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
      },
      {
        accessorKey: "id",
        header: "Edit",
        cell: (info) => {
          const eventType = info.row.original.event_type;
          return (
            <PencilIcon
              size={16}
              className="cursor-pointer  hover:text-purple-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  ["meeting", "document_writing", "custom"].includes(eventType)
                ) {
                  setSelectedEventType(eventType);
                  setSelectedEventData(info.row.original);
                  setIsDialogOpen(true);
                }
              }}
            />
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: graphs,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Define a reusable filter function for consistency across views
  const filterWorkflows = (workflows: GraphData[], searchTerm: string) => {
    if (!searchTerm) return workflows;

    const lowerSearch = searchTerm.toLowerCase();
    return workflows.filter(
      (workflow) =>
        workflow.name.toLowerCase().includes(lowerSearch) ||
        workflow.event_type.toLowerCase().includes(lowerSearch)
    );
  };

  // Add new grid view rendering
  const filteredGraphs = filterWorkflows(graphs, globalFilter);
 

  // Existing table view
  return (
    <div className="w-full">
        {viewMode === ViewMode.LIST && (
          <div>
            <div className="flex items-center py-4 justify-between">
              <Input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search workflows by name or type..."
              className="max-w-sm"
            />
          </div>
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onSelectGraph(row.original.id)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
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
          <CalendarView graphs={graphs} onSelectGraph={onSelectGraph} />
        )}
        {viewMode === ViewMode.GRID && (
          <div>
          <div className="mb-4">
            <Input
              placeholder="Search workflows by name or type..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredGraphs.length > 0 ? (
              filteredGraphs.map((graph) => (
                <Card
                  key={graph.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
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
                          {convertIsoToTimeAgo(graph.created_at)}
                        </span>
                    </div>
                    {/* {graph.event_schedule && graph.event_schedule.length > 0 && (
                      <div className="flex items-center">
                        <Workflow className="h-3 w-3 mr-1" />
                        Runs: {graph.event_schedule.length}
                      </div>
                    )} */}
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation();
                      onClickEdit(graph)}}>
                      <PencilIcon className="h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-8 flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">No workflows found</p>
                <CreateJob />
              </div>
            )}
          </div>
        </div>
        )}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedEventType === "meeting" && (  
          <SheetContent side="right" className="w-[500px]">
            <h2 className="text-lg font-semibold">Edit Meeting</h2>
            <ProjectEventCreationForm
              onClose={() => setIsDialogOpen(false)}
              editData={selectedEventData!}
            />
          </SheetContent>
        )}
        {selectedEventType === "document_writing" && (
          <SheetContent side="right" className="w-[500px]">
          <h2 className="text-lg font-semibold">Edit Document</h2>
          <DocumentWriterForm
            onClose={() => setIsDialogOpen(false)}
            editData={selectedEventData!}
          />
          </SheetContent>
        )}
        {selectedEventType === "custom" && (
          <CustomWorkflowForm
            onClose={() => setIsDialogOpen(false)}
            editData={selectedEventData!}
          />
        )}
      </Sheet>
    </div>
  );
};
