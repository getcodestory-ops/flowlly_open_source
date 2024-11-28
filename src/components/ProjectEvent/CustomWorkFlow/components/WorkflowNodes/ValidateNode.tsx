import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowNode, ValidateNodeConfig } from "../../types";
import { Card, CardContent } from "@/components/ui/card";

import { NodeTypeSelector } from "./NodeTypeSelector";

interface ValidateNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
  editingChildPath?: {
    branch: "success" | "failure";
    index: number;
  };
}

export function ValidateNode({
  onSave,
  onCancel,
  editingNode,
  existingNodes,
  editingChildPath,
}: ValidateNodeProps) {
  const [config, setConfig] = useState<ValidateNodeConfig>({
    validationPrompt: "",
    validationRules: "",
    successSteps: [],
    failureSteps: [],
  });

  const [editingBranch, setEditingBranch] = useState<
    "success" | "failure" | null
  >(null);
  const [currentNodeType, setCurrentNodeType] = useState("");

  useEffect(() => {
    if (editingNode && editingNode.type === "validate") {
      setConfig(editingNode.config as ValidateNodeConfig);

      if (editingChildPath) {
        setEditingBranch(editingChildPath.branch);
      }
    }
  }, [editingNode, editingChildPath]);

  const handleSubNodeSave = (
    branch: "success" | "failure",
    node: WorkflowNode,
    editIndex?: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [branch === "success" ? "successSteps" : "failureSteps"]:
        editIndex !== undefined
          ? (branch === "success" ? prev.successSteps : prev.failureSteps).map(
              (step, i) => (i === editIndex ? node : step)
            )
          : [
              ...(branch === "success" ? prev.successSteps : prev.failureSteps),
              node,
            ],
    }));
    setCurrentNodeType("");
  };

  const handleDeleteStep = (branch: "success" | "failure", index: number) => {
    setConfig((prev) => ({
      ...prev,
      [branch === "success" ? "successSteps" : "failureSteps"]: (branch ===
      "success"
        ? prev.successSteps
        : prev.failureSteps
      ).filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="validationPrompt">Validation Instructions</Label>
          <Textarea
            id="validationPrompt"
            value={config.validationPrompt}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                validationPrompt: e.target.value,
              }))
            }
            placeholder="Example: Check if the message contains a complete name and place"
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Configure Validation Steps</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={editingBranch === "success" ? "default" : "outline"}
              onClick={() => setEditingBranch("success")}
            >
              If Valid Steps ({config.successSteps.length})
            </Button>
            <Button
              type="button"
              variant={editingBranch === "failure" ? "default" : "outline"}
              onClick={() => setEditingBranch("failure")}
            >
              If Invalid Steps ({config.failureSteps.length})
            </Button>
          </div>
        </div>

        {editingBranch && (
          <div className="space-y-4 border p-4 rounded">
            <h4 className="font-medium">
              {editingBranch === "success"
                ? "If Valid Steps"
                : "If Invalid Steps"}
            </h4>

            <NodeTypeSelector
              currentNodeType={currentNodeType}
              setCurrentNodeType={setCurrentNodeType}
              onSave={(node) => handleSubNodeSave(editingBranch, node)}
              onCancel={() => setCurrentNodeType("")}
              existingNodes={existingNodes}
            />

            <div className="space-y-2">
              {(editingBranch === "success"
                ? config.successSteps
                : config.failureSteps
              ).map((step, index) => (
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
                    onClick={() => handleDeleteStep(editingBranch, index)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: "validate",
                config,
              });
            }}
            disabled={!config.validationPrompt}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
