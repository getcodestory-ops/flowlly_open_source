import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	WorkflowNode,
	NodeStatus,
	NodeType,
	DocumentSearchNodeConfig,
} from "../../types";

interface DocumentSearchNodeProps {
	onSave: (node: WorkflowNode) => void;
	onCancel: () => void;
	editingNode?: WorkflowNode;
	existingNodes: WorkflowNode[];
}

export function DocumentSearchNode({
	onSave,
	onCancel,
	editingNode,
	existingNodes,
}: DocumentSearchNodeProps) {
	const [config] = useState<DocumentSearchNodeConfig>({
		type: "document_search",
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.DOCUMENT_SEARCH) {
			// No need to set config since it's static
		}
	}, [editingNode]);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="flex justify-end space-x-2">
					<Button onClick={onCancel}
						type="button"
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.DOCUMENT_SEARCH,
								title: "Document Search",
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