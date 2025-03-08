import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	WorkflowNode,
	ChatNodeConfig,
	NodeType,
	NodeStatus,
} from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChatNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function ChatNode({ onSave, onCancel, editingNode }: ChatNodeProps) {
	const [config, setConfig] = useState<ChatNodeConfig>({
		type: "chat",
		config: {
			systemPrompt: "",
		},
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.CHAT) {
			setConfig(editingNode.config as ChatNodeConfig);
		}
	}, [editingNode]);

	const handleChange =
    (field: keyof ChatNodeConfig["config"]) =>
    	(e: React.ChangeEvent<HTMLInputElement>) => {
    		setConfig((prev) => ({
    			...prev,
    			config: {
    				...prev.config,
    				[field]: e.target.value,
    			},
    		}));
    	};

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<Label>System Prompt (Optional)</Label>
					<Input
						onChange={handleChange("systemPrompt")}
						placeholder="Enter system prompt..."
						value={config.config.systemPrompt || ""}
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
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.CHAT,
								title: "Chat Step",
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
