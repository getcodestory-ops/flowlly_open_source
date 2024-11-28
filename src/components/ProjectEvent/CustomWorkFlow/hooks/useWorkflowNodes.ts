import { useState } from "react";
import { WorkflowNode, WorkflowFormData } from "../types";

interface UseWorkflowNodesProps {
  formData: WorkflowFormData;
  onChange: (updates: Partial<WorkflowFormData>) => void;
}

export function useWorkflowNodes({
  formData,
  onChange,
}: UseWorkflowNodesProps) {
  const [currentNodeType, setCurrentNodeType] = useState("");
  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null);

  const resetNodeState = () => {
    setCurrentNodeType("");
    setEditingNodeIndex(null);
  };

  const handleAddNode = (node: WorkflowNode) => {
    const newNodes = [...formData.nodes];
    if (editingNodeIndex !== null) {
      newNodes[editingNodeIndex] = node;
    } else {
      newNodes.push(node);
    }
    onChange({ nodes: newNodes });
  };

  const handleDeleteNode = (nodeId: string) => {
    const newNodes = formData.nodes.filter((node) => node.id !== nodeId);
    onChange({ nodes: newNodes });
    resetNodeState();
  };

  const handleEditNode = (nodeId: string) => {
    const node = formData.nodes.find((node) => node.id === nodeId);
    setEditingNodeIndex(node ? formData.nodes.indexOf(node) : null);
    setCurrentNodeType(node?.type || "");
  };

  const getEditingNode = () =>
    editingNodeIndex !== null ? formData.nodes[editingNodeIndex] : undefined;

  return {
    currentNodeType,
    setCurrentNodeType,
    editingNodeIndex,
    handleAddNode,
    handleDeleteNode,
    handleEditNode,
    getEditingNode,
    resetNodeState,
  };
}
