import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NodeStatus,
  NodeType,
  RunningLogNodeConfig,
  WorkflowNode,
} from "../../types";
import { Button } from "@/components/ui/button";
interface RunningLogNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function RunningLogNode({
  onSave,
  onCancel,
  editingNode,
}: RunningLogNodeProps) {
  const [config, setConfig] = useState<RunningLogNodeConfig>({
    logName: "",
    systemPrompt: "",
    description: "",
    next_steps: [],
    retry_count: 0,
    max_retries: 3,
  });

  useEffect(() => {
    if (editingNode?.type === NodeType.RUNNING_LOG) {
      const logConfig = editingNode.config as RunningLogNodeConfig;
      setConfig(logConfig);
    }
  }, [editingNode]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="logName">Name for this log</Label>
          <Input
            id="logName"
            value={config.logName}
            onChange={(e) => setConfig({ ...config, logName: e.target.value })}
            placeholder="Enter log name"
          />

          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            value={config.systemPrompt}
            onChange={(e) =>
              setConfig({ ...config, systemPrompt: e.target.value })
            }
            placeholder="Define how the AI should maintain and update this log"
            className="min-h-[100px]"
          />

          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description || ""}
            onChange={(e) =>
              setConfig({ ...config, description: e.target.value })
            }
            placeholder="Optional description of this log's purpose"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!config.logName || !config.systemPrompt}
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: NodeType.RUNNING_LOG,
                config,
                title: "Running Log",
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

export default RunningLogNode;
