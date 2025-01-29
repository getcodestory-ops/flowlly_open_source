import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronDown, ChevronUp, Maximize2, Loader2 } from "lucide-react";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import ActionItemViewer from "@/components/AiActions/ActionItemViewer";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import { renderJsonValue, truncateObject } from "./utils";
import { Button } from "@/components/ui/button";
import type { NodeData, ActionData, EventResult } from "./types";
import { useStore } from "@/utils/store";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { triggerEvent, triggerWorkflowNode } from "@/api/taskQueue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";
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
  const projectId = useStore((state) => state.activeProject?.project_id);
  const isWorkflowRunning = !!currentResult?.workflow_id;
  const [pendingEvent, setPendingEvent] = useState(true);

  return (
    <ScrollArea className=" ">
      <div className="flex flex-col gap-4 p-2">
        {currentResult?.listen && (
          <Card className="p-4 mb-4 border-2 border-green-500">
            {currentResult.workflow_id && projectId && (
              <>
                {pendingEvent ? (
                  <UserInputForm
                    eventId={currentResult.event_id}
                    projectId={projectId}
                    setPendingEvent={setPendingEvent}
                  />
                ) : (
                  <div className="text-gray-500">User Input processing...</div>
                )}
              </>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {currentResult?.nodes &&
            currentResult?.nodes?.map((node) => (
              <ResultBox
                key={node.id}
                node={node}
                eventId={currentResult.event_id || ""}
                isWorkflowRunning={isWorkflowRunning}
              />
            ))}
        </div>
      </div>
    </ScrollArea>
  );
};

interface ResultBoxProps {
  node: NodeData;
  eventId: string;
  isWorkflowRunning: boolean;
}

const ResultBox: React.FC<ResultBoxProps> = ({
  node,
  eventId,
  isWorkflowRunning,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const queryClient = useQueryClient();

  const { mutate: rerunNode, isPending: isRerunning } = useMutation({
    mutationFn: async () => {
      if (!session || !activeProject) throw new Error("No session or project");
      return triggerWorkflowNode({
        session,
        projectId: activeProject.project_id,
        eventId,
        nodeId: node.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventResult"] });
    },
  });

  const canRerun =
    isWorkflowRunning &&
    (node.status === "failed" || (node.status === "completed" && eventId));

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
      className={`border-2 ${
        node.status === "failed" ? "border-red-500" : "border-black"
      } ${baseClassName} ${fullScreenClass} ${isFullScreen ? "p-8" : "p-4"} ${
        !isFullScreen ? getNodeColumnSpan(node) : ""
      }`}
    >
      <div className={`${isFullScreen ? "max-w-6xl mx-auto" : ""} h-full`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{node.title}</h3>
            {canRerun && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => rerunNode()}
                disabled={isRerunning}
                className="h-7 px-2"
              >
                {isRerunning ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Rerun"
                )}
              </Button>
            )}
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

const UserInputForm = ({
  eventId,
  projectId,
  setPendingEvent,
}: {
  eventId?: string;
  projectId: string;
  setPendingEvent: (pending: boolean) => void;
}) => {
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useStore((state) => state.session);

  const handleSubmit = async () => {
    if (!session || !projectId || !eventId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("body", inputText);
      files.forEach((file) => formData.append("files", file));

      await triggerEvent({
        session,
        projectId,
        eventId: eventId,
        formData,
      });

      setInputText("");
      setFiles([]);
    } finally {
      setIsLoading(false);
      setPendingEvent(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
          >
            <span className="truncate max-w-[200px]">{file.name}</span>
            <button
              onClick={() => setFiles(files.filter((_, i) => i !== index))}
              className="hover:text-destructive"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your response here..."
        className="min-h-[100px]"
      />

      <div className="flex gap-2 items-center">
        <Input
          type="file"
          multiple
          onChange={(e) =>
            e.target.files &&
            setFiles([...files, ...Array.from(e.target.files)])
          }
          className="hidden"
          id={`file-upload-${eventId}`}
        />
        <Label
          htmlFor={`file-upload-${eventId}`}
          className="cursor-pointer hover:bg-muted px-3 py-2 rounded-md text-sm"
        >
          📎 Attach Files
        </Label>

        <Button onClick={handleSubmit} disabled={isLoading} className="ml-auto">
          {isLoading ? "Submitting..." : "Submit Response"}
        </Button>
      </div>
    </div>
  );
};

const getNodeColumnSpan = (node: NodeData): string => {
  const nodeId = node.id.toLowerCase();
  const nodeTitle = node.title?.toLowerCase() ?? "";

  if (nodeId === "user_input") {
    return "col-span-1 md:col-span-2 xl:col-span-3";
  }

  // First check specific node IDs
  switch (nodeId) {
    case "determine_action_items":
      return "col-span-1 xl:col-span-2";
    case "transcribe_meeting":
      return "col-span-1 md:col-span-1";
    case "record_meeting":
      return "col-span-1 xl:col-span-2";
    case "write_meeting_minutes":
    case "save_document":
    case "save_minutes_in_project_documents":
      return "col-span-1 md:col-span-2 xl:col-span-3";
  }

  // Then check titles
  if (nodeTitle === "reportgeneration" || nodeTitle === "microsoftword") {
    return "col-span-3";
  }
  console.log("nodeTitle", nodeTitle);

  return "col-span-1";
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
          <MarkDownDisplay content={node.output} />
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
