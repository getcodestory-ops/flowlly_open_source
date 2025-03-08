import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
	WorkflowNode,
	NodeStatus,
	NodeType,
	ConversationNodeConfig,
} from "../../types";
import { NodeTypeSelector } from "./NodeTypeSelector";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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
	const [config, setConfig] = useState<ConversationNodeConfig>({
		message_template: "",
		format_as_table: false,
		notification_channels: ["twilio"],
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.CONVERSATION) {
			setConfig(editingNode.config as ConversationNodeConfig);
		}
	}, [editingNode]);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="message_template">Message Template</Label>
						<Input
							id="message_template"
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									message_template: e.target.value,
								}))
							}
							placeholder="Enter message template..."
							value={config.message_template}
						/>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={config.format_as_table}
							id="format_as_table"
							onCheckedChange={(checked) =>
								setConfig((prev) => ({
									...prev,
									format_as_table: checked as boolean,
								}))
							}
						/>
						<Label htmlFor="format_as_table">Format response as table</Label>
					</div>
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
						disabled={!config.message_template}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.CONVERSATION,
								title: "Conversation Step",
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
