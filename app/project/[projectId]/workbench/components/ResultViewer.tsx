import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronDown, ChevronUp, Maximize2 } from "lucide-react";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import ActionItemViewer from "@/components/AiActions/ActionItemViewer";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import { renderJsonValue, truncateObject } from "./utils";
import { Button } from "@/components/ui/button";
import type { NodeData, ActionData, EventResult } from "./types";

interface ResultViewerProps {
  currentResult: EventResult;
  selectedNode: NodeData | null;
  onSelectNode: (node: NodeData) => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  currentResult,
  selectedNode,
  onSelectNode,
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-100px)] w-full mx-auto bg-gradient-to-b from-purple-400 to-blue-600 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-2 pb-8 pr-4">
        {currentResult?.nodes
          ?.filter(
            (node) =>
              ![
                "write_meeting_minutes",
                "write_meeting_outline",
                "assign_action_items",
              ].includes(node.id.toLowerCase())
          )
          .map((node) => (
            <ResultBox key={node.id} node={node} />
          ))}
      </div>
    </ScrollArea>
  );
};

interface ResultBoxProps {
  node: NodeData;
}

const ResultBox: React.FC<ResultBoxProps> = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isFullScreen && !isExpanded) {
      setIsFullScreen(true);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (isFullScreen) {
      setIsExpanded(false);
    }
  };

  const baseClassName = "transition-all duration-300 relative";
  const fullScreenClass = isFullScreen
    ? "fixed top-0 left-0 w-full h-full z-50 m-0 bg-background"
    : "";

  return (
    <Card
      className={`${baseClassName} ${fullScreenClass} ${
        isFullScreen ? "p-8" : "p-4"
      } ${!isFullScreen ? getNodeColumnSpan(node) : ""}`}
    >
      <div className={`${isFullScreen ? "max-w-6xl mx-auto" : ""} h-full`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">{node.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullScreen}
            className="p-1"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div
          className={`${
            isExpanded || isFullScreen ? "h-[calc(100%-4rem)]" : "h-[400px]"
          } overflow-hidden transition-all duration-300 relative`}
        >
          <ScrollArea className="h-full pr-4">
            {renderNodeContent(node, isFullScreen)}
          </ScrollArea>

          {hasExpandableContent(node) && !isExpanded && !isFullScreen && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-20 bg-gradient-to-t from-background to-transparent" />
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpand}
                  className="mb-2 hover:bg-transparent"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show More
                </Button>
              </div>
            </div>
          )}

          {hasExpandableContent(node) && isExpanded && !isFullScreen && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpand}
                className="mb-2 hover:bg-transparent"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const getNodeColumnSpan = (node: NodeData): string => {
  const nodeId = node.id.toLowerCase();
  switch (nodeId) {
    case "determine_action_items":
    case "transcribe_meeting":
      return "col-span-1 md:col-span-2";
    case "record_meeting":
      return "col-span-1 xl:col-span-2";
    case "write_meeting_minutes":
    case "save_document":
    case "save_minutes_in_project_documents":
      return "col-span-1 md:col-span-2 xl:col-span-3";
    default:
      return "col-span-1";
  }
};

const hasExpandableContent = (node: NodeData): boolean => {
  const nodeId = node.id.toLowerCase();
  return (
    [
      "write_meeting_minutes",
      "determine_action_items",
      "save_document",
      "save_minutes_in_project_documents",
    ].includes(nodeId) ||
    (typeof node.output === "object" &&
      Object.keys(node.output || {}).length > 5)
  );
};

const renderNodeContent = (node: NodeData, isFullScreen: boolean) => {
  if (node.status !== "completed") {
    return <p className="text-gray-500">Processing...</p>;
  }

  const nodeId = node.id.toLowerCase();
  switch (nodeId) {
    case "record_meeting":
      return (
        typeof node.output === "object" &&
        node.output?.url && (
          <AspectRatio ratio={16 / 9}>
            <video controls className="rounded-lg">
              <source src={node.output.url} type="video/mp4" />
              Your browser does not support the video tag
            </video>
          </AspectRatio>
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
      return typeof node.output === "string" ? (
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {node.output}
        </p>
      ) : (
        <div className="h-full">
          {renderJsonValue(
            isFullScreen ? node.output : truncateObject(node.output, 1)
          )}
        </div>
      );
  }
};
