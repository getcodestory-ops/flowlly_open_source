import { Button } from "@/components/ui/button";
import { WorkflowNode } from "../../types";
import { Edit2, Trash2 } from "lucide-react";

interface NodeListProps {
  nodes: WorkflowNode[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function NodeList({ nodes, onEdit, onDelete }: NodeListProps) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "validate":
        return "✓";
      case "extract":
        return "⇥";
      case "condition":
        return "⋈";
      case "conversation":
        return "💬";
      case "loop":
        return "🔄";
      case "microsoftExcel":
        return "📊";
      default:
        return "•";
    }
  };

  const getNodeDescription = (node: WorkflowNode) => {
    switch (node.type) {
      case "validate":
        return (node.config as any).validationPrompt?.slice(0, 50) + "...";
      case "extract":
        return `Extract ${(node.config as any).columns?.length || 0} columns`;
      case "condition":
        return (node.config as any).conditionPrompt?.slice(0, 50) + "...";
      case "conversation":
        return (node.config as any).conversationPrompt?.slice(0, 50) + "...";
      case "loop":
        return (node.config as any).loopPrompt?.slice(0, 50) + "...";
      case "microsoftExcel":
        return `Update Excel sheet: ${
          (node.config as any).sheetName || "Unnamed sheet"
        }`;
      default:
        return "No description available";
    }
  };

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
              disabled={node.type === "trigger"}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(index)}
              disabled={node.type === "trigger"}
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
