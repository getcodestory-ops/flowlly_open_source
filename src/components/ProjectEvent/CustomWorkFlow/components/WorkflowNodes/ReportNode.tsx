import { useState, useEffect } from "react";
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
import { File, Folder, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DocumentSelector from "@/components/ProjectEvent/DocumentSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function ReportNode({ onSave, onCancel, editingNode }: ReportNodeProps) {
  const [selectedItems, setSelectedItems] = useState<
    Array<{ id: string; name: string; type: "folder" | "file" }>
  >([]);
  const [config, setConfig] = useState<ReportNodeConfig>({
    folder_path: "",
    file_name: "",
    report_prompt: "",
    generated_reports: [],
    next_steps: [],
    retry_count: 0,
    max_retries: 0,
    folder_id: "",
  });

  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
  const [fileName, setFileName] = useState(
    (editingNode?.config as ReportNodeConfig)?.file_name || ""
  );

  const [reportPrompt, setReportPrompt] = useState(
    (editingNode?.config as ReportNodeConfig)?.report_prompt || ""
  );

  useEffect(() => {
    if (editingNode?.type === NodeType.REPORT_GENERATION) {
      const reportConfig = editingNode.config as ReportNodeConfig;
      setConfig(reportConfig);
      // If there's a folder path, create a dummy selected item
      if (reportConfig.folder_path) {
        setSelectedItems([
          {
            id: reportConfig.folder_path,
            name: reportConfig.folder_path,
            type: "folder",
          },
        ]);
      }
    }
  }, [editingNode]);

  useEffect(() => {
    // Update config when selected folder changes
    const folderPath =
      selectedItems.find((item) => item.type === "folder")?.name || "";
    const folderId =
      selectedItems.find((item) => item.type === "folder")?.id || "";
    setConfig((prev) => ({
      ...prev,
      folder_path: folderPath,
      file_name: fileName,
      report_prompt: reportPrompt,
      folder_id: folderId,
    }));
  }, [selectedItems, fileName, reportPrompt]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label>Save Location</Label>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => setIsDocumentSelectorOpen(true)}
              className="flex-1"
            >
              {selectedItems.length > 0
                ? selectedItems[0].name
                : "Select destination folder"}
            </Button>
          </div>

          {selectedItems.length > 0 && (
            <Card className="border p-3">
              <ScrollArea className="h-[60px]">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex items-center text-sm flex-1">
                      <Folder
                        className="mr-2 text-blue-500 flex-shrink-0"
                        size={12}
                      />
                      <span className="truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItems([])}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}

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
            disabled={!selectedItems.length || !fileName || !reportPrompt}
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

      <Dialog
        open={isDocumentSelectorOpen}
        onOpenChange={setIsDocumentSelectorOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Destination Folder</DialogTitle>
          </DialogHeader>
          <DocumentSelector
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            folderSelectOnly={true}
          />
          <DialogFooter>
            <Button onClick={() => setIsDocumentSelectorOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
