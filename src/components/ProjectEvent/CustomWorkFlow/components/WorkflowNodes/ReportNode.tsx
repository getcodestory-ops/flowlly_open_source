import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NodeStatus,
  NodeType,
  ReportNodeConfig,
  WorkflowNode,
} from "../../types";

interface ReportNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function ReportNode({ onSave, onCancel, editingNode }: ReportNodeProps) {
  const [config, setConfig] = useState<ReportNodeConfig>({
    folder_path: "",
    file_name: "",
    report_prompt: "",
    generated_reports: [],
    next_steps: [],
    retry_count: 0,
    max_retries: 0,
  });

  const [folderPath, setFolderPath] = useState(
    (editingNode?.config as any)?.folderPath || ""
  );
  const [fileName, setFileName] = useState(
    (editingNode?.config as any)?.fileName || ""
  );
  const [reportPrompt, setReportPrompt] = useState(
    (editingNode?.config as any)?.reportPrompt || ""
  );

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="folderPath">Save Location</Label>
          <Input
            id="folderPath"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="Enter folder path (e.g., 'reports/feedback')"
          />

          <Label htmlFor="fileName">File Name Template</Label>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name (e.g., 'report-{date}')"
          />

          <Label htmlFor="reportPrompt">Report Generation Prompt</Label>
          <Textarea
            id="reportPrompt"
            value={reportPrompt}
            onChange={(e) => setReportPrompt(e.target.value)}
            placeholder="Enter detailed instructions for report generation (e.g., 'Generate a comprehensive report summarizing the collected feedback...')"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!folderPath || !fileName || !reportPrompt}
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: NodeType.REPORT_GENERATION,
                config,
                title: "Report Generation",
                status: NodeStatus.PENDING,
                timestamp: new Date().toISOString(),
                retry_count: 0,
              });
            }}
          >
            {editingNode ? "Update" : "Add"} Node
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
