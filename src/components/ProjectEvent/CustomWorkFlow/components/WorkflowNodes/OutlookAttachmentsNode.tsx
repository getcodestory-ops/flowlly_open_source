import React, { useState, useEffect } from "react";
import {
  NodeStatus,
  NodeType,
  OutlookAttachmentsNodeConfig,
  WorkflowNode,
} from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OutlookAttachmentsNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export const OutlookAttachmentsNode: React.FC<OutlookAttachmentsNodeProps> = ({
  onSave,
  onCancel,
  editingNode,
}) => {
  const [config, setConfig] = useState<OutlookAttachmentsNodeConfig>({
    type: "outlook_attachments",
    next_steps: [],
    retry_count: 0,
    max_retries: 3,
  });

  useEffect(() => {
    if (editingNode?.type === NodeType.OUTLOOK_ATTACHMENTS) {
      setConfig(editingNode.config as OutlookAttachmentsNodeConfig);
    }
  }, [editingNode]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave({
                id: editingNode?.id || crypto.randomUUID(),
                type: NodeType.OUTLOOK_ATTACHMENTS,
                config,
                title: "Outlook Attachments",
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
};
