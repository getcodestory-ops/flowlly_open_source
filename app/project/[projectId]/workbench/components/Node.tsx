import React from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { NodeProps, NodeData } from "./types";
import { colorMapping } from "./utils";
import { SPECIAL_NODE_IDS, STATUS_STYLES } from "./constants";

// Helper function to check if node is special
const isSpecialNode = (nodeId: string): boolean => {
  const lowercaseId = nodeId.toLowerCase();
  return Object.values(SPECIAL_NODE_IDS).includes(lowercaseId as any);
};

// Helper function to get status style
const getStatusStyle = (status: string): string => {
  return (
    STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.default
  );
};

export const Node: React.FC<NodeProps> = ({
  node,
  isLast,
  onSelect,
  isSelected,
}) => (
  <div className="flex flex-col items-center">
    <div
      className={`
        w-64 p-4 rounded-lg shadow-md cursor-pointer 
        transition-all duration-200 ease-in-out
        ${colorMapping[node.status].border || "border-2 border-gray-200"}
        ${isSelected ? "bg-blue-100 scale-105" : "hover:bg-gray-100"}
        ${isSpecialNode(node.id) ? "opacity-100" : "opacity-50"}
      `}
      onClick={() => onSelect(node)}
    >
      <h3 className="text-md font-semibold mb-2">{node.title}</h3>
      <p className="text-sm text-gray-600">{node.description}</p>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(
          node.status
        )}`}
      >
        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
      </span>
      {isSpecialNode(node.id) && (
        <Badge className="mt-1">content available</Badge>
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

type NodeRowProps = {
  nodes: NodeData[];
  isLast: boolean;
  onSelectNode: (node: NodeData) => void;
  selectedNode: NodeData | null;
};

export const NodeRow: React.FC<NodeRowProps> = ({
  nodes,
  isLast,
  onSelectNode,
  selectedNode,
}) => (
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

export const renderNodes = (
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

export default Node;
