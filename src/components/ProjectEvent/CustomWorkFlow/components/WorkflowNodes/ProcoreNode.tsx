import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
	WorkflowNode,
	NodeStatus,
	NodeType,
	ProcoreNodeConfig,
	ProcoreProject,
} from "../../types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProcoreProjects } from "@/hooks/useProcore";
import { useStore } from "@/utils/store";

interface ProcoreNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function ProcoreNode({
	onSave,
	onCancel,
	editingNode,
}: ProcoreNodeProps) {
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { projects, loading } = useProcoreProjects(
		session,
		activeProject?.project_id,
	);

	const [config, setConfig] = useState<ProcoreNodeConfig>({
		project: undefined,
		category: undefined,
		endpoint: undefined,
		action: undefined,
		type: NodeType.PROCORE,
		next_steps: [],
		retry_count: 0,
		max_retries: 3,
	});

	useEffect(() => {
		if (editingNode && editingNode.type === NodeType.PROCORE) {
			setConfig(editingNode.config as ProcoreNodeConfig);
		}
	}, [editingNode]);

	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label>Procore Project</Label>
						<Select
							onValueChange={(value) =>
								setConfig((prev) => ({
									...prev,
									project: projects.find(
										(project: ProcoreProject) => project.id === value,
									),
								}))
							}
							value={config.project?.id}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select project" />
							</SelectTrigger>
							<SelectContent>
								{loading ? (
									<SelectItem disabled value="loading">
                    Loading projects...
									</SelectItem>
								) : (
									projects.map((project: ProcoreProject) => (
										<SelectItem key={project.id} value={project.id}>
											{project.name}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label>Category</Label>
						<Select
							onValueChange={(value) =>
								setConfig((prev) => ({ ...prev, category: value as any }))
							}
							value={config.category}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="project_management">
                  Project Management
								</SelectItem>
								<SelectItem value="construction_financials">
                  Construction Financials
								</SelectItem>
								<SelectItem disabled value="quality_safety">
                  Quality & Safety (Coming Soon)
								</SelectItem>
								<SelectItem disabled value="utilities">
                  Utilities (Coming Soon)
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{config.category && (
						<div className="space-y-2">
							<Label>Endpoint</Label>
							<Select
								onValueChange={(value) =>
									setConfig((prev) => ({ ...prev, endpoint: value as any }))
								}
								value={config.endpoint}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select endpoint" />
								</SelectTrigger>
								<SelectContent>
									{config.category === "project_management" && (
										<SelectItem value="daily_reports">Daily Reports</SelectItem>
									)}
									{config.category === "construction_financials" && (
										<SelectItem value="change_orders">Change Orders</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					)}
					{config.endpoint && (
						<div className="space-y-2">
							<Label>Action</Label>
							<Select
								onValueChange={(value) =>
									setConfig((prev) => ({ ...prev, action: value as any }))
								}
								value={config.action}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select action" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="create">Create</SelectItem>
									<SelectItem value="get">Get</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}
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
						disabled={
							!config.project ||
              !config.category ||
              !config.endpoint ||
              !config.action
						}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.PROCORE,
								title: "Procore Integration",
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
