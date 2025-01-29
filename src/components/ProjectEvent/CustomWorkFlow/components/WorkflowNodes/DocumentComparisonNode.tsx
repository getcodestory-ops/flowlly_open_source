import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  WorkflowNode,
  NodeStatus,
  NodeType,
  DocumentComparisonNodeConfig,
} from "../../types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface DocumentComparisonNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function DocumentComparisonNode({
  onSave,
  onCancel,
  editingNode,
  existingNodes,
}: DocumentComparisonNodeProps) {
  const [config, setConfig] = useState<DocumentComparisonNodeConfig>({
    type: "document_comparison",
    instruction: "",
    analyze_implications: true,
    next_steps: [],
    retry_count: 0,
    max_retries: 3,
  });

  useEffect(() => {
    if (editingNode && editingNode.type === NodeType.DOCUMENT_COMPARISON) {
      setConfig(editingNode.config as DocumentComparisonNodeConfig);
    }
  }, [editingNode]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instruction">Custom Comparison Instructions</Label>
            <Textarea
              id="instruction"
              value={config.instruction || ""}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  instruction: e.target.value,
                }))
              }
              placeholder="Enter custom instructions for document comparison..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="analyze_implications"
              checked={config.analyze_implications}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  analyze_implications: checked as boolean,
                }))
              }
            />
            <Label htmlFor="analyze_implications">
              Analyze implications of changes
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: NodeType.DOCUMENT_COMPARISON,
                title: "Document Comparison",
                config,
                status: NodeStatus.PENDING,
                timestamp: new Date().toISOString(),
                retry_count: 0,
              } as WorkflowNode);
            }}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
