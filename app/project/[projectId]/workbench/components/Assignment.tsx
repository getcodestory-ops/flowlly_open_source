"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Clock,
  CircleCheck,
  PencilIcon,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import ActionItemViewer from "@/components/AiActions/ActionItemViewer";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  getExpandedRowModel,
  getPaginationRowModel,
  Row,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // shadcn component
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import CreateJob from "./CreateJob";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
// import addWeeks from "date-fns/addWeeks";
// import setDay from "date-fns/setDay";
// import setHours from "date-fns/setHours";
// import setMinutes from "date-fns/setMinutes";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays } from "date-fns";
import { DataTablePagination } from "@/components/Schedule/ScheduleTable/DataTablePagination";

type ActionData = Array<{
  activity_addition: Array<{
    id: string;
    name: string;
    end: string;
    start: string;
    description: string;
  }>;
  activity_deletion: Array<{ name: string }>;
  activity_modification: Array<{
    id: string;
    status: string;
    revision: {
      name: string;
      reason: string;
      impact_on_start_date: number;
      impact_on_end_date: number;
    } | null;
  }>;
}>;

type NodeData = {
  id: string;
  title: string;
  description: string;
  status:
    | "pending"
    | "completed"
    | "running"
    | "failed"
    | "skipped"
    | "cancelled"
    | "retry";
  output: string | any | ActionData;
  children?: NodeData[];
};

type GraphData = {
  id: string;
  name: string;
  description: string;
  metadata: {
    frequency: string;
    time: string;
    duration: string;
    time_zone: string;
    online_link: string;
    recurrence_day?: string;
  };
  created_at: string;
  nodes: NodeData[];
  run_time: string;
  event_type: string;
  event_schedule?: EventSchedule[];
};

type EventResult = {
  result: {
    id: string;
    name: string;
    nodes: NodeData[];
    status: string;
    run_time: string;
    timestamp: string;
    description: string;
  };
};

type EventSchedule = {
  id: string;
  schedule: {
    day: number[];
    time: { run_time: string }[];
    start: string;
    time_zone: string;
  };
  event_result: EventResult[];
};

type ProjectEvents = {
  project_events: GraphData;
};

type SortConfig = {
  key: keyof GraphData;
  direction: "asc" | "desc";
};

type NodeProps = {
  node: NodeData;
  isLast: boolean;
  onSelect: (node: NodeData) => void;
  isSelected: boolean;
};

interface ScheduleTableRow {
  id: string;
  schedule?: EventSchedule["schedule"];
  result?: EventResult["result"];
  subRows?: ScheduleTableRow[];
}

// map pending" | "completed" | "running" | "failed" | "skipped" | "cancelled" | "retry" with lucide react icons and colors

const colorMapping = {
  pending: {
    icon: <Clock className="text-blue-500" size={20} />,
    border: "border-2 border-blue-500",
  },
  completed: {
    icon: <CheckCircle className="text-green-500" size={20} />,
    border: "border-2 border-green-500",
  },
  running: {
    icon: <RefreshCw className="text-yellow-500 animate-spin" size={20} />,
    border: "border-2 border-yellow-500",
  },
  failed: {
    icon: <XCircle className="text-red-500" size={20} />,
    border: "border-2 border-red-500",
  },
  skipped: {
    icon: <XCircle className="text-gray-500" size={20} />,
    border: "border-2 border-gray-500",
  },
  cancelled: {
    icon: <XCircle className="text-gray-500" size={20} />,
    border: "border-2 border-gray-500",
  },
  retry: {
    icon: <RefreshCw className="text-yellow-500" size={20} />,
    border: "border-2 border-yellow-500",
  },
};

const Node: React.FC<NodeProps> = ({ node, isLast, onSelect, isSelected }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-64 p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ease-in-out
        ${colorMapping[node.status].border || "border-2 border-gray-200"}
        ${isSelected ? "bg-blue-100 scale-105" : "hover:bg-gray-100"}
        ${
          node.id.toLocaleLowerCase() === "determine_action_items" ||
          node.id.toLocaleLowerCase() === "record_meeting" ||
          node.id.toLocaleLowerCase() === "save_minutes_in_project_documents"
            ? "opacity-100"
            : "opacity-50"
        }
        `}
      onClick={() => onSelect(node)}
    >
      <h3 className="text-md font-semibold mb-2">{node.title}</h3>
      <p className="text-sm text-gray-600">{node.description}</p>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${
          node.status === "completed"
            ? "bg-green-100 text-green-800"
            : node.status === "failed"
            ? "bg-gray-100 text-gray-800"
            : node.status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
      </span>
      {(node.id.toLocaleLowerCase() === "determine_action_items" ||
        node.id.toLocaleLowerCase() === "record_meeting" ||
        node.id.toLocaleLowerCase() ===
          "save_minutes_in_project_documents") && (
        <Badge className="mt-1"> content available </Badge>
      )}
      <div className="mt-2 flex justify-end">
        {colorMapping[node.status].icon || <Clock size={20} />}
      </div>
    </div>
    {!isLast && (
      <div className="h-12 flex items-center justify-center">
        <ChevronDown className="text-gray-400" size={20} />
      </div>
    )}
  </div>
);

const NodeRow: React.FC<{
  nodes: NodeData[];
  isLast: boolean;
  onSelectNode: (node: NodeData) => void;
  selectedNode: NodeData | null;
}> = ({ nodes, isLast, onSelectNode, selectedNode }) => (
  <div className="flex justify-center space-x-4">
    {nodes.map((node) => (
      <Node
        key={node.id}
        node={node}
        isLast={isLast}
        onSelect={onSelectNode}
        isSelected={selectedNode?.id === node.id}
      />
    ))}
  </div>
);

const renderNodes = (
  nodes: NodeData[],
  onSelectNode: (node: NodeData) => void,
  selectedNode: NodeData | null
): JSX.Element[] => {
  return nodes.map((node, index) => (
    <div key={node.id} className="flex flex-col items-center">
      <NodeRow
        nodes={[node]}
        isLast={!node.children || node.children.length === 0}
        onSelectNode={onSelectNode}
        selectedNode={selectedNode}
      />
      <ChevronDown className="text-gray-400" size={24} />
    </div>
  ));
};

// render nodes narratives

//

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const dayMapping: { [key: string]: number } = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const CalendarView: React.FC<{
  graphs: GraphData[];
  onSelectGraph: (graphId: string) => void; // Change the type here
}> = ({ graphs, onSelectGraph }) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    switch (action) {
      case "PREV":
        setDate((prevDate) => addDays(prevDate, -1));
        break;
      case "NEXT":
        setDate((prevDate) => addDays(prevDate, 1));
        break;
      case "TODAY":
        setDate(new Date());
        break;
    }
  };

  const generateRecurringEvents = (graph: GraphData) => {
    const events = [];
    const startDate = new Date(graph.created_at);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 84); // Generate events for the next 12 weeks (84 days)

    const frequency = graph.metadata.frequency;
    const meetingDay = graph.metadata.recurrence_day?.toLowerCase();
    const meetingTime = graph.metadata.time;
    if (frequency === "weekly" && meetingDay && meetingTime) {
      let currentDate = new Date(startDate);
      currentDate.setDate(
        currentDate.getDate() +
          ((dayMapping[meetingDay] + 7 - currentDate.getDay()) % 7)
      );
      const [hours, minutes] = meetingTime.split(":").map(Number);
      while (currentDate <= endDate) {
        const eventStart = new Date(currentDate);
        eventStart.setHours(hours, minutes);
        const eventEnd = new Date(eventStart);
        eventEnd.setHours(eventEnd.getHours() + 1);

        events.push({
          id: `${graph.id}-${currentDate.toISOString()}`,
          title: graph.name,
          start: eventStart,
          end: eventEnd,
          allDay: false,
          resource: graph,
        });

        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days
      }
    } else if (frequency === "once") {
      const eventStart = new Date(startDate);
      const [hours, minutes] = (graph.metadata.time || "00:00")
        .split(":")
        .map(Number);
      eventStart.setHours(hours, minutes);

      const eventEnd = new Date(eventStart);
      eventEnd.setHours(eventEnd.getHours() + 1);

      events.push({
        id: graph.id,
        title: graph.name,
        start: eventStart,
        end: eventEnd,
        allDay: false,
        resource: graph,
      });
    }

    return events;
  };

  const events = useMemo(() => {
    return graphs.flatMap(generateRecurringEvents);
  }, [graphs]);

  const handleSelectEvent = (event: any) => {
    console.log("Selected event:", event);
    const eventResult = event.resource; // Assuming event.resource is of type EventResult
    onSelectGraph(eventResult.id); // Pass the EventResult
  };
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
      toolbar.onNavigate("NEXT");
    };

    const goToCurrent = () => {
      toolbar.onNavigate("TODAY");
    };

    return (
      <div className="flex items-center justify-between p-2 bg-background border-b">
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={goToBack}>
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrent}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={goToNext}>
            Next
          </Button>
        </div>
        <div className="text-sm font-medium">{toolbar.label}</div>
        <div className="space-x-2">
          {["month", "week", "day", "agenda"].map((viewOption) => (
            <Button
              key={viewOption}
              variant={toolbar.view === viewOption ? "default" : "ghost"}
              size="sm"
              onClick={() => toolbar.onView(viewOption)}
              className="capitalize"
            >
              {viewOption}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "700px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "week", "day", "agenda"]}
        view={view}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        date={date}
        onNavigate={(date) => setDate(date)}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: "#facc15",
            color: "black",
          },
        })}
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
};

const GraphList: React.FC<{
  graphs: GraphData[];
  onSelectGraph: (graphId: string) => void;
  setCurrentResult: (result: EventResult | null) => void; // Add this prop
}> = ({ graphs, onSelectGraph, setCurrentResult }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

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
        accessorKey: "metadata",
        header: "Frequency",
        cell: (info) => {
          if (info.getValue()) {
            const schedule = info.getValue() as GraphData["metadata"];

            return schedule.frequency || "N/A";
          } else {
            return "N/A";
          }
        },
      },
      {
        accessorKey: "metadata",
        header: "Meeting Day",
        cell: (info) => {
          if (info.getValue()) {
            const schedule = info.getValue() as GraphData["metadata"];

            return schedule.frequency == "weekly"
              ? schedule.recurrence_day
              : schedule.frequency == "once"
              ? schedule.recurrence_day
              : "N/A";
          } else {
            return "N/A";
          }
        },
      },
      {
        accessorKey: "time",
        header: "Meeting Time",
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0"
          >
            Edit
          </Button>
        ),
        cell: (info) => <PencilIcon size={16} />,
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

  return (
    <div className="w-full">
      <Tabs defaultValue="calendar">
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
              placeholder="Search..."
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
    </div>
  );
};

const EventScheduleList: React.FC<{
  graphs: EventSchedule[];
  onSelectGraph: (event: EventResult) => void;
}> = ({ graphs, onSelectGraph }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Transform graphs into table data
  const tableData: ScheduleTableRow[] = useMemo(
    () =>
      graphs.map((eventSchedule) => ({
        id: eventSchedule.id,
        schedule: eventSchedule.schedule,
        subRows: eventSchedule.event_result.map((eventResult) => ({
          id: eventResult.result.id,
          result: eventResult.result,
        })),
      })),
    [graphs]
  );

  const columns = useMemo<ColumnDef<ScheduleTableRow>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <Button
              variant="ghost"
              onClick={row.getToggleExpandedHandler()}
              className="p-0"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          ) : null,
      },
      {
        accessorKey: "main",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0"
          >
            Meeting Start Date
          </Button>
        ),
        cell: ({ row }) => {
          if (row.original.schedule) {
            const schedule = row.original.schedule;
            return new Date(schedule.start).toDateString();
          } else if (row.original.result) {
            const result = row.original.result;
            return (
              new Date(result.timestamp).toLocaleString() + " - " + result.name
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

  const renderRow = (row: Row<ScheduleTableRow>) => (
    <React.Fragment key={row.id}>
      <TableRow
        onClick={() => {
          if (row.original.subRows) {
            row.toggleExpanded();
          } else if (row.original.result) {
            // This is an EventResult row
            const eventResult = graphs
              .flatMap((schedule) => schedule.event_result)
              .find((er) => er.result.id === row.original.result?.id);
            if (eventResult) {
              onSelectGraph(eventResult);
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

const Breadcrumbs: React.FC<{
  currentGraph: GraphData | null;
  onBackToList: () => void;
}> = ({ currentGraph, onBackToList }) => (
  <nav className="flex mb-4" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
      <li className="inline-flex items-center">
        <Button
          variant="link"
          onClick={onBackToList}
          className="text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          Ai jobs
        </Button>
      </li>
      {currentGraph && (
        <li>
          <div className="flex items-center">
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
              {currentGraph.name}
            </span>
          </div>
        </li>
      )}
    </ol>
  </nav>
);

interface NodeNarrativeProps {
  nodes: NodeData[];
  onSelectNode: (node: NodeData) => void;
  selectedNode: NodeData | null;
}

// node narrative

const NodeNarrative = ({
  nodes,
  onSelectNode,
  selectedNode,
}: NodeNarrativeProps) => {
  const renderNarrative = (nodes: NodeData[]) => {
    return nodes.map((node, index) => (
      <div key={node.id} className="flex items-start space-x-2">
        {/* Connection icon */}
        <div className="flex flex-col items-center">
          {index > 0 && <ArrowDown className="text-gray-400 h-4 w-4" />}
        </div>
        {/* Node content */}
        <div>
          <div
            className={cn(
              "cursor-pointer",
              selectedNode?.id === node.id
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            )}
            onClick={() => onSelectNode(node)}
          >
            {node.title}
          </div>
          <Badge variant={getStatusVariant(node.status)} className="mt-1">
            {node.status}
          </Badge>
          {node.children && node.children.length > 0 && (
            <div className="mt-2 ml-4 border-l border-gray-200 pl-4">
              {renderNarrative(node.children)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  // Helper function to get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return <div className="space-y-4">{renderNarrative(nodes)}</div>;
};

//
export default function AssignmentHome() {
  const [currentGraphId, setCurrentGraphId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [projectEvents, setProjectEvents] = useState<ProjectEvents[] | null>(
    null
  );
  const [eventSchedule, setEventSchedule] = useState<EventSchedule[] | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [currentResult, setCurrentResult] = useState<EventResult | null>(null);
  const [graphs, setGraphs] = useState<GraphData[] | null>(null);
  const [currentGraph, setCurrentGraph] = useState<GraphData | null>(null);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const { data } = useQuery({
    queryKey: ["projectEvents"],
    queryFn: () => {
      if (!session || !activeProject) return [];
      return getProjectEvents({
        session: session,
        projectId: activeProject.project_id,
      });
    },
    enabled: !!session && !!activeProject,
  });

  useEffect(() => {
    if (data) {
      setProjectEvents(data);
      setGraphs(data.map((d: ProjectEvents) => d.project_events));
      console.log(data);
    }
  }, [data]);

  useEffect(() => {
    if (graphs) {
      const graph = graphs?.find((g) => g.id === currentGraphId);
      setCurrentGraph(graph || null);
      setEventSchedule(graph?.event_schedule || null);
    } else {
      setEventSchedule(null);
      setCurrentGraph(null);
      setCurrentResult(null);
    }
    setSheetOpen(false);
  }, [currentGraphId, graphs]);

  useEffect(() => {
    if (currentResult) setSheetOpen(true);
  }, [currentResult]);

  useEffect(() => {
    if (!sheetOpen) setCurrentResult(null);
  }, [sheetOpen]);

  const handleSort = (key: keyof GraphData) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleSelectNode = (node: NodeData) => {
    setSelectedNode(node);
  };

  if (!graphs) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 ">
      <Breadcrumbs
        currentGraph={currentGraph}
        onBackToList={() => setCurrentGraphId(null)}
      />

      <div
        className={`fixed flex  z-10 right-1 lg:w-full  h-full top-0   transform transition-transform duration-300 ease-in-out border rounded-lg p-2 ${
          sheetOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          onClick={() => setSheetOpen(false)}
          className="w-full h-full bg-background opacity-70 absolute top-0 left-0"
        ></div>
        <div className="container  z-10">
          <div className="fixed  translate-y-8  ">
            <Button
              onClick={() => setSheetOpen(false)}
              variant="ghost"
              className="text-gray-500"
            >
              <X size={24} />
            </Button>
          </div>
          {currentGraph && currentResult && (
            <div className="flex flex-col lg:flex-row gap-4 py-8 bg-background">
              <Card className=" p-6 w-96 ">
                <ScrollArea className="h-[calc(100vh-100px)]">
                  <div className="flex flex-col items-center space-y-4 min-w-max p-2">
                    {renderNodes(
                      currentResult.result.nodes,
                      handleSelectNode,
                      selectedNode
                    )}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="flex-1 p-6 w-screen-xl ">
                {selectedNode ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {selectedNode.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedNode.description}
                    </p>
                    <ScrollArea className="h-[calc(100vh-150px)] p-4 ">
                      {selectedNode.id.toLocaleLowerCase() ===
                        "record_meeting" &&
                        selectedNode.status === "completed" && (
                          <div>
                            {typeof selectedNode.output === "object" &&
                              selectedNode.output?.url && (
                                <AspectRatio ratio={1}>
                                  <video controls>
                                    <source
                                      src={selectedNode.output?.url}
                                      type="video/mp4"
                                    />
                                    Your browser does not support the video tag
                                  </video>
                                </AspectRatio>
                              )}
                          </div>
                        )}
                      {selectedNode.id.toLocaleLowerCase() ===
                        "write_meeting_minutes" &&
                        selectedNode.status === "completed" && (
                          <ContentEditor content={selectedNode.output} />
                        )}
                      {selectedNode.id.toLocaleLowerCase() ===
                        "determine_action_items" &&
                        selectedNode.status === "completed" && (
                          <ActionItemViewer
                            results={selectedNode.output as ActionData}
                          />
                        )}
                      {selectedNode.id.toLocaleLowerCase() ===
                        "save_minutes_in_project_documents" &&
                        selectedNode.status === "completed" && (
                          <ResourceTextViewer
                            resource_id={selectedNode.output?.resource_id}
                          />
                        )}
                      {selectedNode.id.toLocaleLowerCase() !==
                        "write_meeting_minutes" &&
                        selectedNode.id.toLocaleLowerCase() !==
                          "determine_action_items" &&
                        selectedNode.id.toLocaleLowerCase() !==
                          "record_meeting" &&
                        selectedNode.id.toLocaleLowerCase() !==
                          "save_minutes_in_project_documents" && (
                          <div className="text-sm text-gray-700 whitespace-pre-line">
                            {typeof selectedNode.output === "string"
                              ? selectedNode.output
                              : JSON.stringify(selectedNode.output, null, 2)}
                          </div>
                        )}
                    </ScrollArea>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Select a node to view its output.
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {!currentGraph && (
        <Card className="p-6">
          <GraphList
            graphs={graphs}
            onSelectGraph={setCurrentGraphId}
            setCurrentResult={setCurrentResult} // Pass this prop
          />
        </Card>
      )}

      {eventSchedule && (
        <Card className="p-6">
          <EventScheduleList
            graphs={eventSchedule || []}
            onSelectGraph={setCurrentResult}
          />
        </Card>
      )}
    </div>
  );
}
