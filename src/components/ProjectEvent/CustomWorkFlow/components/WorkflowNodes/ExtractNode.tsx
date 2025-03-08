import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	WorkflowNode,
	ExtractNodeConfig,
	NodeType,
	NodeStatus,
} from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

interface ExtractNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

const dataTypes = ["string", "number", "date", "boolean"];

export function ExtractNode({
	onSave,
	onCancel,
	editingNode,
}: ExtractNodeProps) {
	const [config, setConfig] = useState<ExtractNodeConfig>({
		columns: [],
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.EXTRACTION) {
			setConfig(editingNode.config as ExtractNodeConfig);
		}
	}, [editingNode]);

	const addColumn = () => {
		setConfig((prev) => ({
			...prev,
			columns: [
				...prev.columns,
				{ name: "", description: "", dataType: "string" },
			],
		}));
	};

	const removeColumn = (index: number) => {
		setConfig((prev) => ({
			...prev,
			columns: prev.columns.filter((_, idx) => idx !== index),
		}));
	};

	const updateColumn = (
		index: number,
		field: keyof (typeof config.columns)[0],
		value: string,
	) => {
		setConfig((prev) => ({
			...prev,
			columns: prev.columns.map((col, idx) =>
				idx === index ? { ...col, [field]: value } : col,
			),
		}));
	};

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				{config.columns.map((column, index) => (
					<div className="flex gap-4 items-start" key={index}>
						<div className="flex-1 space-y-2">
							<Label>Column Name</Label>
							<Input
								onChange={(e) => updateColumn(index, "name", e.target.value)}
								placeholder="Enter column name..."
								value={column.name}
							/>
						</div>
						<div className="flex-1 space-y-2">
							<Label>Description</Label>
							<Input
								onChange={(e) =>
									updateColumn(index, "description", e.target.value)
								}
								placeholder="Enter description..."
								value={column.description}
							/>
						</div>
						<div className="space-y-2">
							<Label>Data Type</Label>
							<Select
								onValueChange={(value: any) =>
									updateColumn(index, "dataType", value)
								}
								value={column.dataType}
							>
								<SelectTrigger className="w-[140px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{dataTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button
							onClick={() => removeColumn(index)}
							size="icon"
							type="button"
							variant="ghost"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				))}
				<Button
					className="w-full"
					onClick={addColumn}
					type="button"
					variant="outline"
				>
					<PlusCircle className="h-4 w-4 mr-2" />
          Add Column
				</Button>
				<div className="flex justify-end space-x-2">
					<Button
						onClick={onCancel}
						type="button"
						variant="outline"
					>
            Cancel
					</Button>
					<Button
						disabled={config.columns.length === 0}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.EXTRACTION,
								title: "Extract Step",
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
