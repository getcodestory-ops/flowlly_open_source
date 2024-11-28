import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { WorkflowFormData, WorkflowNode } from "../../types";
import { useWorkflowNodes } from "../../hooks/useWorkflowNodes";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowDown, Trash2, Edit } from "lucide-react";
import { NodeTypeSelector } from "./NodeTypeSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkflowNodesProps {
  formData: WorkflowFormData;
  onChange: (updates: Partial<WorkflowFormData>) => void;
}

// Add this helper function to flatten the workflow nodes
const flattenWorkflowNodes = (
  nodes: WorkflowNode[],
  parentNode?: WorkflowNode,
  branchType?: "success" | "failure"
) => {
  const flatNodes: Array<{
    node: WorkflowNode;
    parent?: WorkflowNode;
    branchType?: "success" | "failure";
    level: number;
  }> = [];

  nodes.forEach((node) => {
    flatNodes.push({
      node,
      parent: parentNode,
      branchType,
      level: parentNode ? 1 : 0,
    });

    if (node.type === "validate") {
      const config = node.config as any;
      if (config.successSteps?.length) {
        flatNodes.push(
          ...flattenWorkflowNodes(config.successSteps, node, "success")
        );
      }
      if (config.failureSteps?.length) {
        flatNodes.push(
          ...flattenWorkflowNodes(config.failureSteps, node, "failure")
        );
      }
    }
  });

  return flatNodes;
};

// Add this helper function to generate hierarchical step numbers
const generateStepNumber = (
  flatNodes: Array<{
    node: WorkflowNode;
    parent?: WorkflowNode;
    branchType?: "success" | "failure";
    level: number;
  }>,
  currentIndex: number
): string => {
  const currentNode = flatNodes[currentIndex];

  if (!currentNode.parent) {
    // Main flow nodes get simple numbers
    let mainFlowCount = 1;
    for (let i = 0; i < currentIndex; i++) {
      if (!flatNodes[i].parent) mainFlowCount++;
    }
    return mainFlowCount.toString();
  }

  // Find parent's step number
  const parentIndex = flatNodes.findIndex(
    (item) => item.node.id === currentNode.parent?.id
  );
  const parentNumber = generateStepNumber(flatNodes, parentIndex);

  // Count siblings with same parent and branch type
  let siblingCount = 1;
  for (let i = 0; i < currentIndex; i++) {
    const node = flatNodes[i];
    if (
      node.parent?.id === currentNode.parent?.id &&
      node.branchType === currentNode.branchType
    ) {
      siblingCount++;
    }
  }

  return `${parentNumber}.${siblingCount}`;
};

// Add this CSS class to your global styles or as a styled component
const CONNECTION_LINE_STYLES = {
  success: "absolute left-4 w-0.5 bg-green-300",
  failure: "absolute left-4 w-0.5 bg-red-300",
};

// Add this new interface to track where we're adding a node
interface AddNodeContext {
  parentId?: string;
  branchType?: "success" | "failure";
}

export function WorkflowNodes({ formData, onChange }: WorkflowNodesProps) {
  const {
    currentNodeType,
    setCurrentNodeType,
    handleDeleteNode,
    handleEditNode,
    getEditingNode,
    resetNodeState,
  } = useWorkflowNodes({ formData, onChange });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Add new state for tracking where we're adding a node
  const [addNodeContext, setAddNodeContext] = useState<AddNodeContext | null>(
    null
  );

  // Modify the renderNodeContent function to be simpler since we're flattening the structure
  const renderNodeContent = (node: WorkflowNode) => {
    switch (node.type) {
      case "validate":
        const validateConfig = node.config as any;
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {validateConfig.validationPrompt}
            </p>
          </div>
        );

      case "extract":
        const extractConfig = node.config as any;
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {extractConfig.columns.map((col: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 rounded-md text-sm"
                >
                  {col.name}: {col.dataType}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm text-gray-600">Configuration details...</p>
        );
    }
  };

  // Update graph nodes and edges whenever workflow changes
  useEffect(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    const processNodes = (
      nodes: WorkflowNode[],
      startX = 250,
      startY = 0,
      parentId?: string,
      branchType?: "success" | "failure"
    ) => {
      nodes.forEach((node, index) => {
        const mainNode: Node = {
          id: node.id,
          type: "custom",
          position: { x: startX + (index % 2) * 300, y: startY + index * 200 },
          data: {
            label: node.type,
            node,
            onEdit: () => handleEditNode(node.id),
            onDelete: () => handleDeleteNode(node.id),
          },
        };
        flowNodes.push(mainNode);

        // Connect to parent node ONLY for the first node in a branch
        if (parentId && index === 0) {
          flowEdges.push({
            id: `edge-${parentId}-${branchType}-${node.id}`,
            source: parentId,
            target: node.id,
            type: "smoothstep",
            animated: true,
            style: {
              stroke: branchType === "success" ? "#22c55e" : "#ef4444",
              strokeWidth: 2,
            },
            label: branchType === "success" ? "Valid" : "Invalid",
            labelStyle: {
              fill: branchType === "success" ? "#22c55e" : "#ef4444",
              fontWeight: "bold",
            },
          });
        }

        // Connect sequential nodes within the same branch
        if (index > 0) {
          flowEdges.push({
            id: `edge-${nodes[index - 1].id}-${node.id}`,
            source: nodes[index - 1].id,
            target: node.id,
            type: "smoothstep",
            animated: true,
            style: {
              stroke:
                branchType === "success"
                  ? "#22c55e"
                  : branchType === "failure"
                  ? "#ef4444"
                  : "#64748b",
              strokeWidth: 2,
            },
          });
        }

        // Handle validate node branches
        if (node.type === "validate") {
          const config = node.config as any;
          if (config.successSteps?.length) {
            processNodes(
              config.successSteps,
              mainNode.position.x + 300,
              mainNode.position.y + 100,
              node.id,
              "success"
            );
          }
          if (config.failureSteps?.length) {
            processNodes(
              config.failureSteps,
              mainNode.position.x - 300,
              mainNode.position.y + 100,
              node.id,
              "failure"
            );
          }
        }
      });
    };

    processNodes(formData.nodes);
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [formData.nodes]);

  // Custom Node component for the graph
  const CustomNode = ({ data }: any) => (
    <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-primary"
      />
      <div className="font-semibold capitalize">{data.node.type}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-primary"
      />
    </div>
  );

  // Modify handleAddNode to work with the context
  const handleAddNode = (nodeData: WorkflowNode) => {
    const updatedNodes = [...formData.nodes];

    if (addNodeContext) {
      // Add node to the specific branch
      const { parentId, branchType } = addNodeContext;
      const addToBranch = (nodes: WorkflowNode[]) => {
        for (const node of nodes) {
          if (node.id === parentId && node.type === "validate") {
            const config = node.config as any;
            if (branchType === "success") {
              config.successSteps = [...(config.successSteps || []), nodeData];
            } else if (branchType === "failure") {
              config.failureSteps = [...(config.failureSteps || []), nodeData];
            }
            return true;
          }

          if (node.type === "validate") {
            const config = node.config as any;
            if (config.successSteps?.length && addToBranch(config.successSteps))
              return true;
            if (config.failureSteps?.length && addToBranch(config.failureSteps))
              return true;
          }
        }
        return false;
      };

      addToBranch(updatedNodes);
    } else {
      // Add to root level only if there are no nodes yet
      if (formData.nodes.length === 0) {
        updatedNodes.push(nodeData);
      }
    }

    onChange({ nodes: updatedNodes });
    setCurrentNodeType("");
    setAddNodeContext(null);
  };

  // Update the render function to show Add Step buttons in appropriate places
  return (
    <div className="grid grid-cols-3 gap-6 h-[600px]">
      {/* Document Flow Builder */}
      <ScrollArea className="border rounded-lg p-4 col-span-2">
        <div className="space-y-4">
          <Label>Workflow Steps</Label>

          {/* Node Type Selector - only show when adding */}
          {currentNodeType && (
            <NodeTypeSelector
              currentNodeType={currentNodeType}
              setCurrentNodeType={setCurrentNodeType}
              onSave={handleAddNode}
              onCancel={() => {
                resetNodeState();
                setAddNodeContext(null);
              }}
              editingNode={getEditingNode()}
              existingNodes={formData.nodes}
            />
          )}

          {/* Flattened Document Flow View */}
          <div className="space-y-4 mt-6 relative">
            {flattenWorkflowNodes(formData.nodes).map(
              (nodeInfo, index, array) => (
                <div key={nodeInfo.node.id} className="relative">
                  {/* Add connection lines for branch relationships */}
                  {nodeInfo.branchType && (
                    <div
                      className={CONNECTION_LINE_STYLES[nodeInfo.branchType]}
                      style={{
                        top: "-24px", // Adjust based on your spacing
                        height: "calc(100% + 24px)", // Extend to the next node
                      }}
                    />
                  )}

                  <div
                    className={`border rounded-lg p-4 bg-white shadow-sm ml-8 ${
                      nodeInfo.branchType === "success"
                        ? "border-l-4 border-l-green-500"
                        : nodeInfo.branchType === "failure"
                        ? "border-l-4 border-l-red-500"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-lg">
                          Step{" "}
                          {generateStepNumber(
                            flattenWorkflowNodes(formData.nodes),
                            index
                          )}
                        </span>
                        <span className="px-2 py-1 bg-primary/10 rounded text-sm capitalize">
                          {nodeInfo.node.type}
                        </span>
                        {nodeInfo.branchType && (
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              nodeInfo.branchType === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {nodeInfo.branchType === "success"
                              ? "If Valid"
                              : "If Invalid"}
                            {nodeInfo.parent &&
                              ` (from step ${
                                formData.nodes.indexOf(nodeInfo.parent) + 1
                              })`}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNode(nodeInfo.node.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNode(nodeInfo.node.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {renderNodeContent(nodeInfo.node)}
                  </div>

                  {/* Add "Add Step" button for validate nodes */}
                  {nodeInfo.node.type === "validate" && !currentNodeType && (
                    <div className="ml-8 mt-4 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentNodeType("validate");
                          setAddNodeContext({
                            parentId: nodeInfo.node.id,
                            branchType: "success",
                          });
                        }}
                        className="border-green-500 text-green-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add to Valid Branch
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentNodeType("validate");
                          setAddNodeContext({
                            parentId: nodeInfo.node.id,
                            branchType: "failure",
                          });
                        }}
                        className="border-red-500 text-red-700"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add to Invalid Branch
                      </Button>
                    </div>
                  )}

                  {/* Only show arrow if not the last item */}
                  {index < array.length - 1 && (
                    <div className="flex justify-center my-2 ml-8">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Only show main Add Step button if no nodes exist */}
          {!currentNodeType && formData.nodes.length === 0 && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setCurrentNodeType("validate")}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Step
            </Button>
          )}
        </div>
      </ScrollArea>

      {/* Graph View */}
      <div className="border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{ custom: CustomNode }}
          fitView
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
