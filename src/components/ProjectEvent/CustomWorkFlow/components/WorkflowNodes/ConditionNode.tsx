import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowNode, ConditionNodeConfig } from "../../types";

interface ConditionNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function ConditionNode({
  onSave,
  onCancel,
  editingNode,
}: ConditionNodeProps) {
  const [config, setConfig] = useState<ConditionNodeConfig>({
    conditionPrompt: "",
    trueSteps: [],
    falseSteps: [],
  });

  useEffect(() => {
    if (editingNode && editingNode.type === "condition") {
      setConfig(editingNode.config as ConditionNodeConfig);
    }
  }, [editingNode]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="conditionPrompt">Condition Prompt</Label>
          <Textarea
            id="conditionPrompt"
            value={config.conditionPrompt}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                conditionPrompt: e.target.value,
              }))
            }
            placeholder="Enter the condition prompt..."
            required
          />
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
                type: "condition",
                config,
              });
            }}
            disabled={!config.conditionPrompt}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
