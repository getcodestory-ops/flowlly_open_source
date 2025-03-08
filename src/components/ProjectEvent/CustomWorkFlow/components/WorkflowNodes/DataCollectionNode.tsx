import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	DataCollectionNodeConfig,
	NodeStatus,
	NodeType,
	WorkflowNode,
} from "../../types";

interface DataCollectionNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes?: WorkflowNode[];
}

export function DataCollectionNode({
	onSave,
	onCancel,
	editingNode,
}: DataCollectionNodeProps) {
	const [config, setConfig] = useState<DataCollectionNodeConfig>({
		triggerWord: "",
		prompt: "",
		next_steps: [],
		retry_count: 0,
		max_retries: 0,
	});

	const [triggerWord, setTriggerWord] = useState(
		(editingNode?.config as any)?.triggerWord || "",
	);
	const [prompt, setPrompt] = useState(
		(editingNode?.config as any)?.prompt || "",
	);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<Label htmlFor="prompt">Collection Prompt</Label>
					<Input
						id="prompt"
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="Enter the prompt to show users (e.g., 'Please provide your feedback')"
						value={prompt}
					/>
					<Label htmlFor="triggerWord">End Trigger Word</Label>
					<Input
						id="triggerWord"
						onChange={(e) => setTriggerWord(e.target.value)}
						placeholder="Word that ends data collection (e.g., 'done')"
						value={triggerWord}
					/>
				</div>
				<div className="flex justify-end space-x-2">
					<Button
						onClick={onCancel}
						type="button"
						variant="outline"
					>
            Cancel
					</Button>
					<Button
						disabled={!triggerWord || !prompt}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.DATA_COLLECTION,
								title: "Data Collection",
								config,
								status: NodeStatus.PENDING,
								timestamp: new Date().toISOString(),
								retry_count: 0,
							});
						}}
						type="button"
					>
						{editingNode ? "Update" : "Add"} Node
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
