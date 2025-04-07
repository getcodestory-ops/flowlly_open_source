import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
	WorkflowNode,
	NodeStatus,
	NodeType,
	UserInputNodeConfig,
} from "../../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
interface UserInputNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}
export function UserInputNode({
	onSave,
	onCancel,
	editingNode,
}: UserInputNodeProps) {
	const [config, setConfig] = useState<UserInputNodeConfig>({
		instructions: "",
		required: true,
		files_required: false,
		drawings_required: false,
		type: "user_input",
		next_steps: [],
		retry_count: 0,
		max_retries: 0,
		multi_turn_data_collection: false,
	});
	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.USER_INPUT) {
			setConfig(editingNode.config as UserInputNodeConfig);
		}
	}, [editingNode]);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="instructions">Description of information needed to successfully complete the workflow</Label>
						<Textarea
							id="instructions"
							onChange={(e) =>
								setConfig((prev) => ({ ...prev, instructions: e.target.value }))
							}
							placeholder="e.g. 'For starting bid levelling workflow provide atleast 2 bids files in pdf format with instruction on end goal."
							value={config.instructions}
						/>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={config.required}
							id="required"
							onCheckedChange={(checked) =>
								setConfig((prev) => ({ ...prev, required: checked as boolean, multi_turn_data_collection: false  }))
							}
						/>
						<Label htmlFor="required">Need instructions from user before starting the workflow</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={config.files_required}
							id="files_required"
							onCheckedChange={(checked) =>
								setConfig((prev) => ({ ...prev, files_required: checked as boolean, multi_turn_data_collection: false  }))
							}
						/>
						<Label htmlFor="files_required">Files are required to be included.</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={config.drawings_required}
							id="drawings_required"
							onCheckedChange={(checked) =>
								setConfig((prev) => ({ ...prev, drawings_required: checked as boolean, multi_turn_data_collection: false  }))
							}
						/>
						<Label htmlFor="drawings_required">Drawings are required to be included.</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={config.multi_turn_data_collection}
							id="multi_turn_data_collection"
							onCheckedChange={(checked) =>
								setConfig((prev) => ({
									...prev,
									multi_turn_data_collection: checked as boolean,
									required: checked ? false : prev.required,
									files_required: checked ? false : prev.files_required,
									drawings_required: checked ? false : prev.drawings_required,
								}))
							}
						/>
						<Label htmlFor="multi_turn_data_collection">Allow multiple turns for data collection, e.g. inspection report, daily report, etc.</Label>
					</div>
				</div>
				<div className="flex justify-end space-x-2">
					<Button onClick={onCancel} variant="outline">
            Cancel
					</Button>
					<Button
						disabled={!config.instructions}
						onClick={() =>
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.USER_INPUT,
								title: "Your instructions",
								config,
								status: NodeStatus.PENDING,
								timestamp: new Date().toISOString(),
								retry_count: 0,
							})
						}
					>
						{editingNode ? "Update" : "Add"} Node
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
