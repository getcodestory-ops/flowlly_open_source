import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	UpdateOrCreateResourceNodeConfig,
	NodeStatus,
	NodeType,
	WorkflowNode,
} from "../../types";
import { Textarea } from "@/components/ui/textarea";
interface UpdateOrCreateResourceNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function UpdateOrCreateResourceNode({
	onSave,
	onCancel,
	editingNode,
}: UpdateOrCreateResourceNodeProps) {
	const [config, setConfig] = useState<UpdateOrCreateResourceNodeConfig>({
		prompt:
      (editingNode?.config as UpdateOrCreateResourceNodeConfig)?.prompt || "",
		resourceType:
      (editingNode?.config as UpdateOrCreateResourceNodeConfig)?.resourceType ||
      "text",
		resourceName:
      (editingNode?.config as UpdateOrCreateResourceNodeConfig)?.resourceName ||
      "",
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<Label htmlFor="resourceName">Resource Name</Label>
					<Input
						id="resourceName"
						onChange={(e) =>
							setConfig({ ...config, resourceName: e.target.value })
						}
						placeholder="Enter the name of the resource"
						value={config.resourceName}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="prompt">Update Prompt</Label>
					<Textarea
						id="prompt"
						onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
						placeholder="Enter the prompt for updating or creating the resource"
						value={config.prompt}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="resourceType">Resource Type</Label>
					<Select
						onValueChange={(value: "text" | "table") =>
							setConfig({ ...config, resourceType: value })
						}
						value={config.resourceType}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select resource type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="text">Text</SelectItem>
							<SelectItem value="table">Table</SelectItem>
						</SelectContent>
					</Select>
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
								type: NodeType.UPDATE_RESOURCE,
								title: "Update or Create Resource",
								status: NodeStatus.PENDING,
								timestamp: new Date().toISOString(),
								retry_count: 0,
								config,
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
