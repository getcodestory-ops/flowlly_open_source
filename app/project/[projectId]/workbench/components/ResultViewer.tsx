import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Loader2,
  Video,
  Mic,
  Edit3,
  List,
  FileText,
  MessageSquare,
} from "lucide-react";
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
import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
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
  const session = useStore((state) => state.session);
  const isWorkflowRunning = !!currentResult?.workflow_id;
  const [pendingEvent, setPendingEvent] = useState(true);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // Set the first node as expanded initially
  useEffect(() => {
    if (currentResult?.nodes && currentResult.nodes.length > 0) {
      setExpandedNodeId(currentResult.nodes[0].id);
    }
  }, [currentResult?.nodes]);

  return (
    <div className="p-6  min-h-screen">
      {currentResult?.listen && (
        <Card className="p-4 mb-4 border-2 border-green-500 shadow-md rounded-lg">
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

      {currentResult.workflow_id &&
        session?.access_token &&
        currentResult.streaming && (
          <StreamComponent
            streamingKey={currentResult.workflow_id}
            authToken={session.access_token}
          />
        )}

      <div className="flex flex-col gap-6">
        {currentResult?.nodes &&
          currentResult?.nodes?.map((node) => (
            <ResultBox
              key={node.id}
              node={node}
              workflowId={currentResult.workflow_id || ""}
              isWorkflowRunning={isWorkflowRunning}
              isExpanded={expandedNodeId === node.id}
              onToggleExpand={() => {
                setExpandedNodeId(expandedNodeId === node.id ? null : node.id);
              }}
            />
          ))}
      </div>
    </div>
  );
};

interface ResultBoxProps {
  node: NodeData;
  workflowId: string;
  isWorkflowRunning: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ResultBox: React.FC<ResultBoxProps> = ({
  node,
  workflowId,
  isWorkflowRunning,
  isExpanded,
  onToggleExpand,
}) => {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const queryClient = useQueryClient();

  const { mutate: rerunNode, isPending: isRerunning } = useMutation({
    mutationFn: async () => {
      if (!session || !activeProject) throw new Error("No session or project");
      return triggerWorkflowNode({
        session,
        projectId: activeProject.project_id,
        workflowId,
        nodeId: node.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventResult"] });
    },
  });

  const canRerun =
    isWorkflowRunning &&
    (node.status === "failed" || (node.status === "completed" && workflowId));

  const getBorderColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-l-green-500";
      case "failed":
        return "border-l-red-500";
      case "processing":
      case "pending":
        return "border-l-yellow-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "processing":
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`border-l-4 ${getBorderColor(
        node.status
      )} transition-all duration-300 shadow-md rounded-lg overflow-hidden`}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 p-2">
          {getNodeIcon(node)}
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{node.title}</h3>
              <span className={`text-sm ${getStatusColor(node.status)}`}>
                • {node.status}
              </span>
            </div>
            {!isExpanded && node.output && typeof node.output === "string" && (
              <p className="text-sm text-gray-500 line-clamp-1 truncate">
                {node.output}
              </p>
            )}
          </div>
        </div>

        {canRerun && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              rerunNode();
            }}
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

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 border-t">
          <div className=" overflow-y-auto p-4 max-h-screen">
            {renderNodeContent(node, false)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Returns an appropriate icon for the node based on its ID.
const getNodeIcon = (node: NodeData) => {
  const nodeId = node.id.toLowerCase();
  switch (nodeId) {
    case "record_meeting":
      return <Video className="h-5 w-5 text-gray-600" />;
    case "transcribe_meeting":
      return <Mic className="h-5 w-5 text-gray-600" />;
    case "write_meeting_minutes":
      return <Edit3 className="h-5 w-5 text-gray-600" />;
    case "determine_action_items":
      return <List className="h-5 w-5 text-gray-600" />;
    case "save_document":
    case "save_minutes_in_project_documents":
      return <FileText className="h-5 w-5 text-gray-600" />;
    case "user_input":
      return <MessageSquare className="h-5 w-5 text-gray-600" />;
    case "report_generation":
      return <FileText className="h-5 w-5 text-gray-600" />;
    default:
      return <FileText className="h-5 w-5 text-gray-600" />;
  }
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

// const getNodeColumnSpan = (node: NodeData): string => {
//   const nodeId = node.id.toLowerCase();
//   const nodeTitle = node.title?.toLowerCase() ?? "";

//   if (nodeId === "user_input") {
//     return "col-span-1 md:col-span-2 xl:col-span-3";
//   }

//   // First check specific node IDs
//   switch (nodeId) {
//     case "determine_action_items":
//       return "col-span-1 xl:col-span-2";
//     case "transcribe_meeting":
//       return "col-span-1 md:col-span-1";
//     case "record_meeting":
//       return "col-span-1 xl:col-span-2";
//     case "write_meeting_minutes":
//     case "save_document":
//     case "save_minutes_in_project_documents":
//       return "col-span-1 md:col-span-2 xl:col-span-3";
//   }

//   // Then check titles
//   if (nodeTitle === "reportgeneration" || nodeTitle === "microsoftword") {
//     return "col-span-3";
//   }
//   console.log("nodeTitle", nodeTitle);

//   return "col-span-1";
// };

// const hasExpandableContent = (node: NodeData): boolean => {
//   const nodeId = node.id.toLowerCase();
//   return (
//     [
//       "write_meeting_minutes",
//       "determine_action_items",
//       "save_document",
//       "save_minutes_in_project_documents",
//     ].includes(nodeId) ||
//     (typeof node.output === "object" &&
//       Object.keys(node.output || {}).length > 5)
//   );
// };

const renderNodeContent = (node: NodeData, isFullScreen: boolean) => {
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
      ) : node.output?.report_path || node.output?.resource_id ? (
        <ResourceTextViewer
          resource_id={node.output?.report_path || node.output?.resource_id}
        />
      ) : (
        <div className="h-full">{renderJsonValue(node.output)}</div>
      );
  }
};
