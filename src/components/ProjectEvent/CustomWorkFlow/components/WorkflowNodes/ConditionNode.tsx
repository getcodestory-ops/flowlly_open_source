import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
	WorkflowNode,
	ConditionNodeConfig,
	NodeType,
	NodeStatus,
} from "../../types";

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
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.CONDITIONAL) {
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
						onChange={(e) =>
							setConfig((prev) => ({
								...prev,
								conditionPrompt: e.target.value,
							}))
						}
						placeholder="Enter the condition prompt..."
						required
						value={config.conditionPrompt}
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
						disabled={!config.conditionPrompt}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.CONDITIONAL,
								title: "Condition Step",
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
