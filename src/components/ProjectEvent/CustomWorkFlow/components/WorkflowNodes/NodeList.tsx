import { Button } from "@/components/ui/button";
import { NodeType, WorkflowNode } from "../../types";
import { Edit2, Trash2 } from "lucide-react";
import { getNodeIcon, getNodeDescription } from "./nodeUtils";

interface NodeListProps {
  nodes: WorkflowNode[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function NodeList({ nodes, onEdit, onDelete }: NodeListProps) {
  return (
    <div className="space-y-2">
      {nodes.map((node, index) => (
        <div
          key={node.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-background"
        >
          <div className="flex items-center space-x-4">
            <span className="text-xl">{getNodeIcon(node.type)}</span>
            <div>
              <h4 className="font-medium capitalize">{node.type}</h4>
              <p className="text-sm text-muted-foreground">
                {getNodeDescription(node)}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(index)}
              disabled={node.type === NodeType.TRIGGER}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(index)}
              disabled={node.type === NodeType.TRIGGER}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {nodes.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No workflow steps added yet. Select a node type above to get started.
        </div>
      )}
    </div>
  );
}
