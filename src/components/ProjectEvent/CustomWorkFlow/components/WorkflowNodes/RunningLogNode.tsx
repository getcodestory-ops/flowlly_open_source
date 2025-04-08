import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	NodeStatus,
	NodeType,
	RunningLogNodeConfig,
	WorkflowNode,
} from "../../types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
interface RunningLogNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}


const dataTypes = ["string", "number", "date", "boolean", "attachment"] as const;

export function RunningLogNode({
	onSave,
	onCancel,
	editingNode,
}: RunningLogNodeProps): React.ReactNode {
	const [config, setConfig] = useState<RunningLogNodeConfig>({
		logName: "",
		systemPrompt: "",
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
		logType: "sheet",
		logSchema: {
			columns: [],
		},
		logRefreshFrequency: "never",
	});

	useEffect(() => {
		if (editingNode?.type === NodeType.RUNNING_LOG) {
			const logConfig = editingNode.config as RunningLogNodeConfig;
			setConfig(logConfig);
		}
	}, [editingNode]);

	const addColumn = (): void => {
		setConfig((prev) => ({
			...prev,
			logSchema: {
				...prev.logSchema,
				columns: [
					...(prev.logSchema.columns || []),
					{ name: "", description: "", dataType: "string", required: true },
				],
			},
		}));
	};

	const removeColumn = (index: number): void => {
		setConfig((prev) => ({
			...prev,
			logSchema: {
				...prev.logSchema,
				columns: (prev.logSchema.columns || []).filter((_, idx: number) => idx !== index),
			},
		}));
	};

	const updateColumn = (
		index: number,
		field: string,
		value: string | boolean,
	): void => {
		setConfig((prev) => ({
			...prev,
			logSchema: {
				...prev.logSchema,
				columns: (prev.logSchema.columns || []).map((col, idx: number) =>
					idx === index ? { ...col, [field]: value } : col,
				),
			},
		}));
	};

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<Label htmlFor="logName">Name for this log</Label>
					<Input
						id="logName"
						onChange={(e) => setConfig({ ...config, logName: e.target.value })}
						placeholder="Enter log name"
						value={config.logName}
					/>
					<Label htmlFor="systemPrompt">Log Description</Label>
					<Textarea
						className="min-h-[100px]"
						id="systemPrompt"
						onChange={(e) =>
							setConfig({ ...config, systemPrompt: e.target.value })
						}
						placeholder="Describe the use and purpose of this log in detail. Edge cases, special requirements, etc."
						value={config.systemPrompt}
					/>
				</div>
				<div className="space-y-4">
					<Label>Log Refresh Frequency</Label>
					<Select
						onValueChange={(value) => setConfig({ ...config, logRefreshFrequency: value as "daily" | "weekly" | "monthly" | "yearly" | "never" })}
						value={config.logRefreshFrequency}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="daily">Daily</SelectItem>
							<SelectItem value="weekly">Weekly</SelectItem>
							<SelectItem value="monthly">Monthly</SelectItem>
							<SelectItem value="yearly">Yearly</SelectItem>
							<SelectItem value="never">Never</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-4">
					<Label>Row Schema</Label>
					{(config.logSchema.columns || []).map((column, index: number) => (
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
									onValueChange={(value) =>
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
							<div className="space-y-2 ">
								<Label>Required</Label>
								<div className="flex items-center gap-2 justify-end p-2">
									<Checkbox
										checked={column.required}
										onCheckedChange={(checked) => updateColumn(index, "required", checked)}
									/>
								</div>
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
						disabled={!config.logName || !config.systemPrompt}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.RUNNING_LOG,
								config,
								title: "Running Log",
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

export default RunningLogNode;
