import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  WorkflowNode,
  NodeStatus,
  NodeType,
  UserInputNodeConfig,
} from "../../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
interface UserInputNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}
export function UserInputNode({
  onSave,
  onCancel,
  editingNode,
}: UserInputNodeProps) {
  const [config, setConfig] = useState<UserInputNodeConfig>({
    instructions: "",
    required: false,
    type: "user_input",
    next_steps: [],
    retry_count: 0,
    max_retries: 0,
  });
  useEffect(() => {
    if (editingNode && editingNode.type === NodeType.USER_INPUT) {
      setConfig(editingNode.config as UserInputNodeConfig);
    }
  }, [editingNode]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={config.instructions}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, instructions: e.target.value }))
              }
              placeholder="Enter instructions for the agent..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={config.required}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, required: checked as boolean }))
              }
            />
            <Label htmlFor="required">Required Field</Label>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: NodeType.USER_INPUT,
                title: "Your instructions",
                config,
                status: NodeStatus.PENDING,
                timestamp: new Date().toISOString(),
                retry_count: 0,
              })
            }
            disabled={!config.instructions}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
