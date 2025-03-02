"use client";
import React, { useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  PencilIcon,
  Calendar,
  Workflow,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTablePagination } from "@/components/Schedule/ScheduleTable/DataTablePagination";
import { CalendarView } from "./CalendarView";
import CreateJob from "./CreateJob";
import type { GraphData, EventResult, GraphListProps } from "./types";
import ProjectEventCreationForm from "@/components/ProjectEvent/ProjectEventCreationForm";
import DocumentWriterForm from "@/components/ProjectEvent/DocumentWriterForm";
import DailyJournalForm from "@/components/ProjectEvent/DailyJournalForm";
import CustomWorkflowForm from "@/components/ProjectEvent/CustomWorkFlow/CustomWorkflowForm";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useViewStore } from "@/utils/store";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const GraphList: React.FC<GraphListProps> = ({
  graphs,
  onSelectGraph,
  viewMode = "list",
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const workbenchView = useViewStore((state) => state.workbenchView);
  const setWorkbenchView = useViewStore((state) => state.setWorkbenchView);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(
    null
  );
  const [selectedEventData, setSelectedEventData] = useState<GraphData | null>(
    null
  );

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
  if (viewMode === "grid") {
    const filteredGraphs = filterWorkflows(graphs, globalFilter);

    return (
      <div>
        <div className="mb-4">
          <Input
            placeholder="Search workflows by name or type..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGraphs.length > 0 ? (
            filteredGraphs.map((graph) => (
              <Card
                key={graph.id}
                className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                onClick={() => onSelectGraph(graph.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">
                      {graph.name}
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
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created: {new Date(graph.created_at).toLocaleDateString()}
                  </div>
                  {graph.event_schedule && graph.event_schedule.length > 0 && (
                    <div className="flex items-center">
                      <Workflow className="h-3 w-3 mr-1" />
                      Runs: {graph.event_schedule.length}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No workflows found matching &quot;{globalFilter}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Existing table view
  return (
    <div className="w-full">
      <Tabs
        defaultValue={workbenchView}
        onValueChange={(value) =>
          setWorkbenchView(value as "table" | "calendar")
        }
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          <CreateJob />
        </div>
        <TabsContent value="table">
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
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView graphs={graphs} onSelectGraph={onSelectGraph} />
        </TabsContent>
      </Tabs>
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent side="right" className="w-[90vw]">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">
              {selectedEventType === "meeting" && "Edit Meeting"}
              {selectedEventType === "document_writing" && "Edit Document"}
              {selectedEventType === "custom" && "Edit Custom Workflow"}
            </h2>
            {selectedEventType === "meeting" && (
              <ProjectEventCreationForm
                onClose={() => setIsDialogOpen(false)}
                editData={selectedEventData!}
              />
            )}
            {selectedEventType === "document_writing" && (
              <DocumentWriterForm
                onClose={() => setIsDialogOpen(false)}
                editData={selectedEventData!}
              />
            )}
            {selectedEventType === "custom" && (
              <CustomWorkflowForm
                onClose={() => setIsDialogOpen(false)}
                editData={selectedEventData!}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
