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
import {
  WorkflowNode,
  LoopNodeConfig,
  NodeType,
  NodeStatus,
  FlowCondition,
} from "../../types";

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
  const [config, setConfig] = useState<LoopNodeConfig>({
    target_node_id: "",
    retry_count: 0,
    max_retries: 3,
    next_steps: [],
  });

  // Get the node number for display
  const getNodeLabel = (node: WorkflowNode, index: number) => {
    const nodeNumber = index + 1;
    return `#${nodeNumber} - ${node.type} Node`;
  };

  // Find the selected node's number for the placeholder
  const selectedNodeLabel = config.target_node_id
    ? getNodeLabel(
        existingNodes.find((node) => node.id === config.target_node_id)!,
        existingNodes.findIndex((node) => node.id === config.target_node_id)
      )
    : "Select a node to loop";

  // Get the target node's type for display
  const targetNodeType = config.target_node_id
    ? existingNodes.find((node) => node.id === config.target_node_id)?.type
    : null;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="targetNode">Select Node to Loop</Label>
          <Select
            name="targetNode"
            value={config.target_node_id}
            onValueChange={(value) => {
              setConfig({
                ...config,
                target_node_id: value,
              });
            }}
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
            disabled={!config.target_node_id}
            onClick={() => {
              const updatedConfig = {
                ...config,
                next_steps: [
                  {
                    target_node_id: config.target_node_id,
                    condition: FlowCondition.SUCCESS,
                    metadata: {},
                  },
                ],
              };

              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: NodeType.LOOP,
                title: "Loop Step",
                config: updatedConfig,
                status: NodeStatus.PENDING,
                timestamp: new Date().toISOString(),
                retry_count: 0,
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
