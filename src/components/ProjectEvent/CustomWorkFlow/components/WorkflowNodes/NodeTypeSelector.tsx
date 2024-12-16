import { WorkflowNode, NodeType } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidateNode } from "./ValidateNode";
import { ExtractNode } from "./ExtractNode";
import { ConditionNode } from "./ConditionNode";
import { ConversationNode } from "./ConversationNode";
import { LoopNode } from "./LoopNode";
import { MicrosoftExcelNode } from "./MicrosoftExcelNode";
import { DataCollectionNode } from "./DataCollectionNode";
import { nodeTypes } from "./nodeUtils";
import { ReportNode } from "./ReportNode";
interface NodeTypeSelectorProps {
  currentNodeType: string;
  setCurrentNodeType: (type: string) => void;
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

export function NodeTypeSelector({
  currentNodeType,
  setCurrentNodeType,
  onSave,
  onCancel,
  editingNode,
  existingNodes,
}: NodeTypeSelectorProps) {
  const renderNodeEditor = () => {
    switch (currentNodeType) {
      case "validate":
        return (
          <ValidateNode
            onSave={onSave}
            editingNode={editingNode}
            existingNodes={existingNodes || []}
            onCancel={onCancel}
          />
        );
      case "extract":
        return (
          <ExtractNode
            onSave={onSave}
            editingNode={editingNode}
            onCancel={onCancel}
          />
        );
      case "condition":
        return (
          <ConditionNode
            onSave={onSave}
            editingNode={editingNode}
            onCancel={onCancel}
          />
        );
      case "conversation":
        return (
          <ConversationNode
            onSave={onSave}
            editingNode={editingNode}
            onCancel={onCancel}
            existingNodes={existingNodes || []}
          />
        );
      case "loop":
        return (
          <LoopNode
            onSave={onSave}
            editingNode={editingNode}
            onCancel={onCancel}
            existingNodes={existingNodes || []}
          />
        );
      case "microsoftExcel":
        return (
          <MicrosoftExcelNode
            onSave={onSave}
            editingNode={editingNode}
            onCancel={onCancel}
          />
        );
      case "dataCollection":
        return (
          <DataCollectionNode
            onSave={onSave}
            editingNode={editingNode}
            onCancel={onCancel}
          />
        );
      case "reportGeneration":
        return (
          <ReportNode
            onSave={onSave}
            editingNode={editingNode}
            onCancel={onCancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Select value={currentNodeType} onValueChange={setCurrentNodeType}>
        <SelectTrigger>
          <SelectValue placeholder="Select step type" />
        </SelectTrigger>
        <SelectContent>
          {nodeTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentNodeType && renderNodeEditor()}
    </div>
  );
}
