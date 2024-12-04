import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { WorkflowNode } from "../../types";

interface DataCollectionNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function DataCollectionNode({
  onSave,
  onCancel,
  editingNode,
}: DataCollectionNodeProps) {
  const [triggerWord, setTriggerWord] = useState(
    (editingNode?.config as any)?.triggerWord || ""
  );
  const [prompt, setPrompt] = useState(
    (editingNode?.config as any)?.prompt || ""
  );

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="prompt">Collection Prompt</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the prompt to show users (e.g., 'Please provide your feedback')"
          />

          <Label htmlFor="triggerWord">End Trigger Word</Label>
          <Input
            id="triggerWord"
            value={triggerWord}
            onChange={(e) => setTriggerWord(e.target.value)}
            placeholder="Word that ends data collection (e.g., 'done')"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!triggerWord || !prompt}
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: "dataCollection",
                config: {
                  triggerWord,
                  prompt,
                  collectedData: [], // This will store the collected data during runtime
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
