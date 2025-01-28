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
    activeProject?.project_id
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
              value={config.project?.id}
              onValueChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  project: projects.find(
                    (project: ProcoreProject) => project.id === value
                  ),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
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
              value={config.category}
              onValueChange={(value) =>
                setConfig((prev) => ({ ...prev, category: value as any }))
              }
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
                <SelectItem value="quality_safety" disabled>
                  Quality & Safety (Coming Soon)
                </SelectItem>
                <SelectItem value="utilities" disabled>
                  Utilities (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.category && (
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Select
                value={config.endpoint}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, endpoint: value as any }))
                }
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
                value={config.action}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, action: value as any }))
                }
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
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
            disabled={
              !config.project ||
              !config.category ||
              !config.endpoint ||
              !config.action
            }
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
