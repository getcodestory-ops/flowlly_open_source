"use client";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  output: string;
  children?: NodeData[];
};
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import { useStore } from "@/utils/store";

type GraphData = {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  nodes: NodeData[];
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
      <h3 className="text-lg font-semibold mb-2">{node.title}</h3>
      <p className="text-sm text-gray-600">{node.description}</p>
      <div className="mt-2 flex justify-end">
        {colorMapping[node.status].icon || <Clock size={20} />}
      </div>
    </div>
    {!isLast && (
      <div className="h-12 flex items-center justify-center">
        <ChevronDown className="text-gray-400" size={24} />
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

const GraphList: React.FC<{
  graphs: GraphData[];
  onSelectGraph: (graphId: string) => void;
  sortConfig: SortConfig;
  onSort: (key: keyof GraphData) => void;
}> = ({ graphs, onSelectGraph, sortConfig, onSort }) => {
  const sortedGraphs = [...graphs].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            <Button variant="ghost" onClick={() => onSort("name")}>
              Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[150px]">
            <Button variant="ghost" onClick={() => onSort("timestamp")}>
              Created At <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="w-[100px]">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedGraphs.map((graph) => (
          <TableRow key={graph.id} onClick={() => onSelectGraph(graph.id)}>
            <TableCell className="font-medium">{graph.name}</TableCell>
            <TableCell>{graph.description}</TableCell>
            <TableCell>{new Date(graph.timestamp).toLocaleString()}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectGraph(graph.id)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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

export default function AssignmentHome() {
  const [currentGraphId, setCurrentGraphId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
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
      setGraphs(data);
      // setCurrentGraphId(data[0].id);
      console.log(data);
    }
  }, [data]);

  useEffect(() => {
    if (graphs) {
      const graph = graphs?.find((g) => g.id === currentGraphId);
      setCurrentGraph(graph || null);
    }
  }, [currentGraphId]);

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
    <div className="container mx-auto p-4">
      <Breadcrumbs
        currentGraph={currentGraph}
        onBackToList={() => setCurrentGraphId(null)}
      />
      {currentGraph ? (
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="flex-1 p-6 ">
            <ScrollArea className="h-[calc(100vh-200px)] ">
              <div className="flex flex-col items-center space-y-4 min-w-max p-2">
                {renderNodes(
                  currentGraph.nodes,
                  handleSelectNode,
                  selectedNode
                )}
              </div>
            </ScrollArea>
          </Card>
          <Card className="flex-1 p-6">
            <h2 className="text-2xl font-bold mb-4">Node Output</h2>
            {selectedNode ? (
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedNode.title}
                </h3>
                <p className="text-gray-600 mb-4">{selectedNode.description}</p>
                <ScrollArea className="h-[calc(100vh-350px)] border rounded p-4">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedNode.output, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            ) : (
              <p className="text-gray-500">Select a node to view its output.</p>
            )}
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <GraphList
            graphs={graphs}
            onSelectGraph={setCurrentGraphId}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </Card>
      )}
    </div>
  );
}
