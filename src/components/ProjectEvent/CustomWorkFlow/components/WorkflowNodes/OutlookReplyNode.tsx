import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  WorkflowNode,
  NodeStatus,
  NodeType,
  OutlookReplyNodeConfig,
} from "../../types";

interface OutlookReplyNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function OutlookReplyNode({
  onSave,
  onCancel,
  editingNode,
  existingNodes,
}: OutlookReplyNodeProps) {
  const [config, setConfig] = useState<OutlookReplyNodeConfig>({
    type: "outlook_reply",
    include_original_message: false,
    signature: "",
    next_steps: [],
    retry_count: 0,
    max_retries: 3,
  });

  useEffect(() => {
    if (editingNode && editingNode.type === NodeType.OUTLOOK_REPLY) {
      setConfig(editingNode.config as OutlookReplyNodeConfig);
    }
  }, [editingNode]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include_original_message"
              checked={config.include_original_message}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  include_original_message: checked as boolean,
                }))
              }
            />
            <Label htmlFor="include_original_message">
              Include original message
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Signature</Label>
            <Input
              id="signature"
              value={config.signature}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  signature: e.target.value,
                }))
              }
              placeholder="Enter email signature..."
            />
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
                type: NodeType.OUTLOOK_REPLY,
                title: "Outlook Reply",
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
