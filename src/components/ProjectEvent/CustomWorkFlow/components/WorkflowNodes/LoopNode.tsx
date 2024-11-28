import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowNode } from "../../types";

interface LoopNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function LoopNode({
  onSave,
  onCancel,
  editingNode,
  existingNodes,
}: LoopNodeProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    (editingNode?.config as any)?.targetNodeId || ""
  );

  // Get the node number for display
  const getNodeLabel = (node: WorkflowNode, index: number) => {
    const nodeNumber = index + 1;
    return `#${nodeNumber} - ${node.type} Node`;
  };

  // Find the selected node's number for the placeholder
  const selectedNodeLabel = selectedNodeId
    ? getNodeLabel(
        existingNodes.find((node) => node.id === selectedNodeId)!,
        existingNodes.findIndex((node) => node.id === selectedNodeId)
      )
    : "Select a node to loop";

  // Get the target node's type for display
  const targetNodeType = selectedNodeId
    ? existingNodes.find((node) => node.id === selectedNodeId)?.type
    : null;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="targetNode">Select Node to Loop</Label>
          <Select
            name="targetNode"
            value={selectedNodeId}
            onValueChange={setSelectedNodeId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a node to loop">
                {selectedNodeLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {existingNodes.map((node, index) => (
                <SelectItem key={node.id} value={node.id}>
                  {getNodeLabel(node, index)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {targetNodeType && (
          <div className="text-sm text-gray-600">
            Connecting to: {targetNodeType} Node
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedNodeId}
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: "loop",
                config: {
                  targetNodeId: selectedNodeId,
                },
              });
            }}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
