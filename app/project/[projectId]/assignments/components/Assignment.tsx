"use client";
import { useEffect, useState, useMemo } from "react";
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
  X,
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
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // shadcn component

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
  output: string | Record<string, unknown> | ActionData;
  children?: NodeData[];
};

type GraphData = {
  id: string;
  name: string;
  description: string;
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
        ${isSelected ? "bg-blue-100 scale-105" : "hover:bg-gray-100"}`}
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
      {/* {node.children && node.children.length > 0 && (
        <>
          <div className="h-12 flex items-center justify-center">
            <ChevronDown className="text-gray-400" size={24} />
          </div>
          {renderNodes(node.children, onSelectNode, selectedNode)}
        </>
      )} */}
    </div>
  ));
};

// render nodes narratives

//

const GraphList: React.FC<{
  graphs: GraphData[];
  onSelectGraph: (graphId: string) => void;
}> = ({ graphs, onSelectGraph }) => {
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
        accessorKey: "time",
        header: "Meeting Time",
        cell: (info) => info.getValue(),
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
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    </div>
  );
};

const EventScheduleList: React.FC<{
  graphs: EventSchedule[];
  onSelectGraph: (event: EventResult) => void;
}> = ({ graphs, onSelectGraph }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<EventSchedule>[]>(
    () => [
      {
        accessorKey: "schedule",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0"
          >
            Meeting Time
          </Button>
        ),
        cell: (info) => {
          const schedule = info.getValue() as EventSchedule["schedule"];
          return (
            new Date(schedule?.start).toDateString() +
            " , " +
            new Date(schedule?.start).toLocaleTimeString()
          );
        },
        // new Date(info.getValue()?.start as string).toLocaleString(),
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
  });

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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onSelectGraph(row.original?.event_result[0])}
                className="cursor-pointer hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  }, [currentGraphId]);

  useEffect(() => {
    if (currentResult) setSheetOpen(true);
  }, [currentResult]);

  useEffect(() => {
    if (!sheetOpen) setCurrentResult(null);
  }, [sheetOpen]);
  // const graphs: GraphData[] = [
  //   {
  //     id: "1",
  //     name: "Project Alpha",
  //     description: "Main project workflow",
  //     timestamp: new Date(2023, 5, 15),
  //     nodes: [
  //       {
  //         id: "1",
  //         title: "Start",
  //         description: "Begin the process",
  //         status: "completed",
  //         output: "Project Alpha initialized successfully.",
  //         children: [
  //           {
  //             id: "2a",
  //             title: "Process Data A",
  //             description: "Analyze set A",
  //             status: "completed",
  //             output:
  //               "Data set A processed:\n- 1000 records analyzed\n- 3 anomalies detected\n- 97% accuracy achieved",
  //           },
  //           {
  //             id: "2b",
  //             title: "Process Data B",
  //             description: "Analyze set B",
  //             status: "in-progress",
  //             output:
  //               "Data set B processing in progress:\n- 500 out of 1500 records analyzed\n- Estimated completion time: 2 hours",
  //           },
  //         ],
  //       },
  //       {
  //         id: "3",
  //         title: "Merge Results",
  //         description: "Combine processed data",
  //         status: "failed",
  //         output: "Waiting for all data sets to be processed before merging.",
  //         children: [
  //           {
  //             id: "4",
  //             title: "Generate Report",
  //             description: "Create final output",
  //             status: "in-progress",
  //             output: "Report generation pending. Awaiting merged results.",
  //           },
  //         ],
  //       },
  //       {
  //         id: "5",
  //         title: "Send Notification",
  //         description: "Alert stakeholders",
  //         status: "in-progress",
  //         output: "Notification will be sent once the report is generated.",
  //       },
  //     ],
  //   },
  //   {
  //     id: "2",
  //     name: "Project Beta",
  //     description: "Secondary project tasks",
  //     timestamp: new Date(2023, 6, 1),
  //     nodes: [
  //       {
  //         id: "1",
  //         title: "Initialize",
  //         description: "Set up project",
  //         status: "completed",
  //         output:
  //           "Project Beta initialization complete. Environment configured.",
  //         children: [
  //           {
  //             id: "2",
  //             title: "Gather Requirements",
  //             description: "Collect project specs",
  //             status: "completed",
  //             output:
  //               "Requirements gathered:\n1. User authentication\n2. Data visualization\n3. Real-time updates\n4. Mobile responsiveness",
  //           },
  //         ],
  //       },
  //       {
  //         id: "3",
  //         title: "Development",
  //         description: "Build features",
  //         status: "in-progress",
  //         output:
  //           "Development in progress:\n- User authentication: 100%\n- Data visualization: 60%\n- Real-time updates: 30%\n- Mobile responsiveness: 45%",
  //       },
  //     ],
  //   },
  // ];

  // const currentGraph =
  //   graphs.find((graph) => graph.id === currentGraphId) || null;

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
        className={`fixed z-10 right-1 lg:w-3/4  h-[calc(100vh-140px)]   bg-background  transform transition-transform duration-300 ease-in-out border rounded-lg p-2 ${
          sheetOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {currentGraph && currentResult && (
          <div className="flex flex-col lg:flex-row gap-4 ">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSheetOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Card className="flex-1 p-6 max-w-96 h-[calc(100vh-160px)]">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center space-y-4 min-w-max p-2">
                  {renderNodes(
                    currentResult.result.nodes,
                    handleSelectNode,
                    selectedNode
                  )}
                </div>
              </ScrollArea>
            </Card>

            <Card className="flex-1 p-6 max-w-screen-lg h-[calc(100vh-160px)]">
              {selectedNode ? (
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedNode.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedNode.description}
                  </p>
                  <ScrollArea className="h-[calc(100vh-200px)] p-4 ">
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
                    {selectedNode.id.toLocaleLowerCase() !==
                      "write_meeting_minutes" &&
                      selectedNode.id.toLocaleLowerCase() !==
                        "determine_action_items" && (
                        <pre className="text-sm text-gray-700">
                          {JSON.stringify(selectedNode.output, null, 2)}
                        </pre>
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

      {!currentGraph && (
        <Card className="p-6">
          <GraphList graphs={graphs} onSelectGraph={setCurrentGraphId} />
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
