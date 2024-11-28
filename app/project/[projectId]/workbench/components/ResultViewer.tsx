import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronDown } from "lucide-react";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import ActionItemViewer from "@/components/AiActions/ActionItemViewer";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import { renderJsonValue } from "./utils";
import { Node } from "./Node";
import type { NodeData, ActionData, EventResult } from "./types";

interface ResultViewerProps {
  currentResult: EventResult;
  selectedNode: NodeData | null;
  onSelectNode: (node: NodeData) => void;
}

const NodeRow: React.FC<{
  nodes: NodeData[];
  isLast: boolean;
  onSelectNode: (node: NodeData) => void;
  selectedNode: NodeData | null;
}> = ({ nodes, isLast, onSelectNode, selectedNode }) => (
  <div className="flex justify-center space-x-4">
    {nodes.map((node) => (
      <Node
        key={node.id}
        node={node}
        isLast={isLast}
        onSelect={onSelectNode}
        isSelected={selectedNode?.id === node.id}
      />
    ))}
  </div>
);

const renderNodes = (
  nodes: NodeData[],
  onSelectNode: (node: NodeData) => void,
  selectedNode: NodeData | null
): JSX.Element[] => {
  return nodes.map((node) => (
    <div key={node.id} className="flex flex-col items-center">
      <NodeRow
        nodes={[node]}
        isLast={!node.children || node.children.length === 0}
        onSelectNode={onSelectNode}
        selectedNode={selectedNode}
      />
      <ChevronDown className="text-gray-400" size={24} />
    </div>
  ));
};

export const ResultViewer: React.FC<ResultViewerProps> = ({
  currentResult,
  selectedNode,
  onSelectNode,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 py-8 bg-background">
      <Card className="p-6 w-96">
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="flex flex-col items-center space-y-4 min-w-max p-2">
            {renderNodes(
              currentResult?.nodes ?? [],
              onSelectNode,
              selectedNode
            )}
          </div>
        </ScrollArea>
      </Card>

      <OutputViewer selectedNode={selectedNode} />
    </div>
  );
};

// Separate component for the output viewing part
const OutputViewer: React.FC<{ selectedNode: NodeData | null }> = ({
  selectedNode,
}) => {
  if (!selectedNode) {
    return (
      <Card className="flex-1 p-6 w-screen-xl">
        <p className="text-gray-500">Select a node to view its output.</p>
      </Card>
    );
  }

  return (
    <Card className="flex-1 p-6 w-screen-xl">
      <div>
        <h3 className="text-xl font-semibold mb-2">{selectedNode.title}</h3>
        <p className="text-gray-600 mb-4">{selectedNode.description}</p>
        <ScrollArea className="h-[calc(100vh-150px)] p-4">
          {renderNodeOutput(selectedNode)}
        </ScrollArea>
      </div>
    </Card>
  );
};

const renderNodeOutput = (node: NodeData) => {
  const nodeId = node.id.toLowerCase();

  if (node.status !== "completed") return null;

  switch (nodeId) {
    case "record_meeting":
      return (
        typeof node.output === "object" &&
        node.output?.url && (
          <div>
            <AspectRatio ratio={1}>
              <video controls>
                <source src={node.output.url} type="video/mp4" />
                Your browser does not support the video tag
              </video>
            </AspectRatio>
          </div>
        )
      );
    case "write_meeting_minutes":
      return <ContentEditor content={node.output} />;
    case "determine_action_items":
      return <ActionItemViewer results={node.output as ActionData} />;
    case "save_document":
    case "save_minutes_in_project_documents":
      return <ResourceTextViewer resource_id={node.output?.resource_id} />;
    default:
      return (
        <div className="space-y-4">
          {typeof node.output === "string" ? (
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {node.output}
            </p>
          ) : (
            renderJsonValue(node.output)
          )}
        </div>
      );
  }
};
