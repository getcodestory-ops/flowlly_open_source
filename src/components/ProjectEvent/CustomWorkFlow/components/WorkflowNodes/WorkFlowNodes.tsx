import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { WorkflowFormData, WorkflowNode } from "../../types";
import { useWorkflowNodes } from "../../hooks/useWorkflowNodes";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import { NodeTypeSelector } from "./NodeTypeSelector";
import { ValidateNodeConfig } from "../../types";

interface WorkflowNodesProps {
  formData: WorkflowFormData;
  onChange: (updates: Partial<WorkflowFormData>) => void;
}

export function WorkflowNodes({ formData, onChange }: WorkflowNodesProps) {
  const {
    currentNodeType,
    setCurrentNodeType,
    editingNodeIndex,
    handleAddNode,
    handleDeleteNode,
    handleEditNode,
    getEditingNode,
    resetNodeState,
  } = useWorkflowNodes({ formData, onChange });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleNodeSave = (node: WorkflowNode) => {
    handleAddNode(node);
    resetNodeState(); // Clear the current node type after saving
  };

  // Helper function to process nodes recursively
  const processNodesRecursively = (
    parentNode: Node,
    childNodes: WorkflowNode[],
    isValidPath: boolean,
    baseX: number,
    baseY: number
  ): { nodes: Node[]; edges: Edge[] } => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    let lastNodeId = parentNode.id;

    childNodes.forEach((node, index) => {
      const nodeId = `${parentNode.id}-${
        isValidPath ? "valid" : "invalid"
      }-${index}`;
      const xOffset = isValidPath ? 200 : -200;

      const childNode: Node = {
        id: nodeId,
        type: "custom",
        position: {
          x: baseX + xOffset,
          y: baseY + (index + 1) * 150,
        },
        data: {
          label: node.type,
          node: node,
          isChild: true,
          parentType: isValidPath ? "valid" : "invalid",
          onEdit: () => handleEditNode(nodeId),
          onDelete: () => handleDeleteNode(nodeId),
        },
      };
      flowNodes.push(childNode);

      // Connect to previous node
      flowEdges.push({
        id: `edge-${isValidPath ? "valid" : "invalid"}-${
          parentNode.id
        }-${index}`,
        source: lastNodeId,
        target: nodeId,
        type: "default",
        animated: true,
        label: index === 0 ? (isValidPath ? "Valid" : "Invalid") : undefined,
        className: isValidPath ? "text-green-500" : "text-red-500",
        style: { strokeWidth: 2 },
      });

      // Recursively process if this is a validate node
      if (node.type === "validate") {
        const { nodes: nestedNodes, edges: nestedEdges } =
          processNodesRecursively(
            childNode,
            node.ifValid?.nodes || [],
            true,
            childNode.position.x,
            childNode.position.y
          );
        flowNodes.push(...nestedNodes);
        flowEdges.push(...nestedEdges);

        const { nodes: nestedInvalidNodes, edges: nestedInvalidEdges } =
          processNodesRecursively(
            childNode,
            node.ifInvalid?.nodes || [],
            false,
            childNode.position.x,
            childNode.position.y
          );
        flowNodes.push(...nestedInvalidNodes);
        flowEdges.push(...nestedInvalidEdges);
      } else if (node.type === "conversation") {
        const config = node.config as { steps: WorkflowNode[] };
        const { nodes: subNodes, edges: subEdges } = processNodesRecursively(
          childNode,
          config.steps || [],
          true, // Always use the "valid" path styling for conversation nodes
          childNode.position.x,
          childNode.position.y
        );
        flowNodes.push(...subNodes);
        flowEdges.push(...subEdges);
      }

      // Add loop connections if this is a loop node
      if (
        node.type === "loop" &&
        node.config &&
        "targetNodeId" in node.config
      ) {
        flowEdges.push({
          id: `loop-edge-${nodeId}-${node.config.targetNodeId}`,
          source: nodeId,
          target: node.config.targetNodeId,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#9333ea", // Purple color for loop connections
            strokeWidth: 2,
          },
          label: "Loop",
          labelStyle: { fill: "#9333ea" },
          className: "loop-edge",
        });
      }

      lastNodeId = nodeId;
    });

    return { nodes: flowNodes, edges: flowEdges };
  };

  useEffect(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    formData.nodes.forEach((node, index) => {
      // Create main node
      const mainNode: Node = {
        id: node.id || `node-${index}`,
        type: "custom",
        position: {
          x: 250 + (index % 2) * 300,
          y: index * 200,
        },
        data: {
          label: node.type,
          node: node,
          onEdit: () => handleEditNode(node.id),
          onDelete: () => handleDeleteNode(node.id),
        },
      };
      flowNodes.push(mainNode);

      // Handle validate node branches recursively
      if (node.type === "validate") {
        const config = node.config as ValidateNodeConfig;
        const { nodes: validNodes, edges: validEdges } =
          processNodesRecursively(
            mainNode,
            config.successSteps || [],
            true,
            mainNode.position.x,
            mainNode.position.y
          );
        flowNodes.push(...validNodes);
        flowEdges.push(...validEdges);

        const { nodes: invalidNodes, edges: invalidEdges } =
          processNodesRecursively(
            mainNode,
            config.failureSteps || [],
            false,
            mainNode.position.x,
            mainNode.position.y
          );
        flowNodes.push(...invalidNodes);
        flowEdges.push(...invalidEdges);
      } else if (node.type === "conversation") {
        const config = node.config as { steps: WorkflowNode[] };
        const { nodes: subNodes, edges: subEdges } = processNodesRecursively(
          mainNode,
          config.steps || [],
          true, // Always use the "valid" path styling for conversation nodes
          mainNode.position.x,
          mainNode.position.y
        );
        flowNodes.push(...subNodes);
        flowEdges.push(...subEdges);
      }

      // Add loop connections with different styling
      if (node.type === "loop") {
        const config = node.config as any; // You might want to type this properly
        const targetNodeId = config.targetNodeId;

        if (targetNodeId) {
          flowEdges.push({
            id: `loop-edge-${node.id}-${targetNodeId}`,
            source: node.id,
            target: targetNodeId,
            type: "default",
            animated: true,
            style: {
              stroke: "#9333ea",
              strokeWidth: 2,
            },
            label: "Loop",
            labelStyle: { fill: "#9333ea" },
            className: "loop-edge",
          });
        }
      } else if (
        index < formData.nodes.length - 1 &&
        node.type !== "validate"
      ) {
        // Existing regular connections code
        flowEdges.push({
          id: `edge-${index}`,
          source: mainNode.id,
          target: formData.nodes[index + 1].id || `node-${index + 1}`,
          type: "smoothstep",
          animated: true,
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [formData.nodes]);

  // Modified CustomNode component to show different styling for child nodes
  const CustomNode = ({ data }: any) => (
    <div
      className={`relative bg-white p-4 rounded-lg shadow-lg border-2 
      ${
        data.isChild
          ? data.parentType === "valid"
            ? "border-green-500"
            : "border-red-500"
          : "border-primary"
      } 
      min-w-[200px]`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-primary"
      />
      <div
        className={`font-semibold capitalize ${
          data.isChild
            ? data.parentType === "valid"
              ? "text-green-500"
              : "text-red-500"
            : "text-primary"
        }`}
      >
        {data.node.type}
      </div>
      <div className="text-sm text-gray-600 mt-2">
        {data.node.description || "No description"}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={data.onEdit}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={data.onDelete}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-primary"
      />
    </div>
  );

  return (
    <div className="flex gap-4">
      <div className="w-1/2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nodeType">Add Workflow Step</Label>
          <NodeTypeSelector
            currentNodeType={currentNodeType}
            setCurrentNodeType={setCurrentNodeType}
            onSave={handleNodeSave}
            onCancel={resetNodeState}
            editingNode={getEditingNode()}
            existingNodes={formData.nodes}
          />
        </div>
      </div>
      <div className="w-1/2 border rounded-lg h-[600px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{ custom: CustomNode }}
          fitView
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
          className="bg-gray-50"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
