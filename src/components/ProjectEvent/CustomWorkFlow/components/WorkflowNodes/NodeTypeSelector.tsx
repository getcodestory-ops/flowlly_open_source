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
import { DocumentExtractionNode } from "./DocumentExtractionNode";
import { DocumentSelectionNode } from "./DocumentSelectionNode";
import { UpdateOrCreateResourceNode } from "./UpdateOrCreateResourceNode";
import { ChatNode } from "./ChatNode";
import RunningLogNode from "./RunningLogNode";
import { OutlookAttachmentsNode } from "./OutlookAttachmentsNode";
import { OutlookReplyNode } from "./OutlookReplyNode";
import { RecipeNode } from "./RecipeNode";
import { ProcoreNode } from "./ProcoreNode";
import { UserInputNode } from "./UserInputNode";

interface NodeTypeSelectorProps {
  currentNodeType: string;
  setCurrentNodeType: (type: string) => void;
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
  existingNodes: WorkflowNode[];
}

const nodeComponents: Record<string, React.FC<any>> = {
  validate: ValidateNode,
  extract: ExtractNode,
  condition: ConditionNode,
  conversation: ConversationNode,
  loop: LoopNode,
  microsoftExcel: MicrosoftExcelNode,
  dataCollection: DataCollectionNode,
  reportGeneration: ReportNode,
  documentExtraction: DocumentExtractionNode,
  documentSelection: DocumentSelectionNode,
  updateResource: UpdateOrCreateResourceNode,
  chat: ChatNode,
  runningLog: RunningLogNode,
  outlook_attachments: OutlookAttachmentsNode,
  outlook_reply: OutlookReplyNode,
  recipe: RecipeNode,
  procore: ProcoreNode,
  user_input: UserInputNode,
};

export function NodeTypeSelector({
  currentNodeType,
  setCurrentNodeType,
  onSave,
  onCancel,
  editingNode,
  existingNodes,
}: NodeTypeSelectorProps) {
  const renderNodeEditor = () => {
    const NodeEditor = nodeComponents[currentNodeType];
    if (NodeEditor) {
      return (
        <NodeEditor
          onSave={onSave}
          editingNode={editingNode}
          existingNodes={existingNodes || []}
          onCancel={onCancel}
        />
      );
    }
    return null;
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
      {/* {currentNodeType && renderNodeComponent()} */}
    </div>
  );
}
