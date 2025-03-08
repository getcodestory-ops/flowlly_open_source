import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	WorkflowNode,
	ValidateNodeConfig,
	NodeStatus,
	NodeType,
} from "../../types";
import { Card, CardContent } from "@/components/ui/card";

interface ValidateNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function ValidateNode({
	onSave,
	onCancel,
	editingNode,
	existingNodes,
}: ValidateNodeProps) {
	const [config, setConfig] = useState<ValidateNodeConfig>({
		validationPrompt: "",
		validationRules: "",
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.VALIDATE) {
			setConfig(editingNode.config as ValidateNodeConfig);
		}
	}, [editingNode]);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<Label htmlFor="validationPrompt">Validation Instructions</Label>
					<Textarea
						className="min-h-[100px]"
						id="validationPrompt"
						onChange={(e) =>
							setConfig((prev) => ({
								...prev,
								validationPrompt: e.target.value,
							}))
						}
						placeholder="Example: Check if the message contains a complete name and place"
						required
						value={config.validationPrompt}
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
						disabled={!config.validationPrompt}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.VALIDATE,
								title: "Validation Step",
								config,
								status: NodeStatus.PENDING,
								timestamp: new Date().toISOString(),
								retry_count: 0,
							} as WorkflowNode);
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
