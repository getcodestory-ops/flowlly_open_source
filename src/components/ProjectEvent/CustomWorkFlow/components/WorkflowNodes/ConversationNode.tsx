import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowNode } from "../../types";
import { NodeTypeSelector } from "./NodeTypeSelector";

interface ConversationNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function ConversationNode({
  onSave,
  onCancel,
  editingNode,
  existingNodes,
}: ConversationNodeProps) {
  const [config, setConfig] = useState<{ steps: WorkflowNode[] }>({
    steps: [],
  });
  const [currentNodeType, setCurrentNodeType] = useState("");

  useEffect(() => {
    if (editingNode) {
      setConfig(editingNode.config as { steps: WorkflowNode[] });
    }
  }, [editingNode]);

  const handleSubNodeSave = (node: WorkflowNode) => {
    setConfig((prev) => ({
      ...prev,
      steps: [...prev.steps, node],
    }));
    setCurrentNodeType("");
  };

  const handleDeleteStep = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label>Configure Conversation Steps</Label>

          <NodeTypeSelector
            currentNodeType={currentNodeType}
            setCurrentNodeType={setCurrentNodeType}
            onSave={handleSubNodeSave}
            onCancel={() => setCurrentNodeType("")}
            existingNodes={existingNodes}
          />

          <div className="space-y-2">
            {config.steps.map((step, index) => (
              <div
                key={step.id}
                className="p-2 border rounded flex justify-between items-center"
              >
                <span>
                  {index + 1}. {step.type}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteStep(index)}
                >
                  Delete
                </Button>
              </div>
            ))}
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
                type: "conversation",
                config,
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
