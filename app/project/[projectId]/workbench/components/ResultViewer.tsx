import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ChevronRight,
  Loader2,
  Video,
  Mic,
  Edit3,
  List,
  FileText,
  MessageSquare,
  LogsIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
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
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import PdfLoader from "./PdfLoader";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Update how we determine if a workflow is running
  // A workflow is running if:
  // 1. It has a workflow_id AND status is not "completed", OR
  // 2. It has the listen flag set (waiting for input)
  const isWorkflowRunning =
    (!!currentResult?.workflow_id && currentResult.status !== "completed") ||
    !!currentResult?.listen;

  // For workflows with null/undefined status, we'll consider them completed
  // if they don't have any running indicators
  const isImplicitlyCompleted =
    (currentResult.status === null || currentResult.status === undefined) &&
    !currentResult?.workflow_id &&
    !currentResult?.listen;

  const [pendingEvent, setPendingEvent] = useState(true);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [detailView, setDetailView] = useState<NodeData | null>(null);

  // Set the first node as expanded initially
  useEffect(() => {
    if (currentResult?.nodes && currentResult.nodes.length > 0) {
      setExpandedNodeId(currentResult.nodes[0].id);
    }
  }, [currentResult?.nodes]);

  // Calculate completion percentage for workflow
  const calculateProgress = () => {
    if (!currentResult?.nodes) return 0;

    const totalNodes = currentResult.nodes.length;
    if (totalNodes === 0) return 0;

    const completedNodes = currentResult.nodes.filter(
      (node) => node.status === "completed"
    ).length;

    return Math.round((completedNodes / totalNodes) * 100);
  };

  const progressPercentage = calculateProgress();
  const hasFailedNodes = currentResult?.nodes?.some(
    (node) => node.status === "failed"
  );

  return (
    <div className="p-6 min-h-screen">
      {/* Workflow Status Summary */}

      {currentResult?.listen && (
        <Card className="p-4 mb-6 border-2 border-yellow-500 shadow-md rounded-lg">
          {currentResult.workflow_id && projectId && (
            <>
              {pendingEvent ? (
                <UserInputForm
                  eventId={currentResult.event_id}
                  projectId={projectId}
                  setPendingEvent={setPendingEvent}
                  resultId={currentResult.id}
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-[heartbeat_1.5s_ease-in-out_infinite]" />
                  <span>
                    Reading through attached files and your instructions
                  </span>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {session?.access_token && currentResult.streaming && (
        <div className="mb-6">
          <div className="border rounded-lg overflow-hidden relative border-l-green-500 border-l-4 shadow-sm">
            <div className="relative">
              <div className="h-1 w-full bg-gray-100 overflow-hidden">
                <div
                  className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 absolute"
                  style={{
                    animation: "progressLine 10s ease-in-out infinite",
                  }}
                />
              </div>

              <div className="p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <LogsIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium">Workflow Logs</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogs(!showLogs)}
                  className="h-7 px-2"
                >
                  {showLogs ? "Hide Logs" : "Show Logs"}
                </Button>
              </div>
            </div>

            {showLogs && (
              <div className="border-t">
                <div className="max-h-[400px] overflow-y-auto p-4">
                  <StreamComponent
                    streamingKey={currentResult.id}
                    authToken={session.access_token}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Timeline View */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Workflow Steps Timeline */}

        {/* Node Details */}
        <div className="w-full lg:w-3/4 bg-white rounded-lg border shadow-sm p-4">
          {detailView ? (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getNodeIcon(detailView)}
                  <h3 className="font-medium text-lg">{detailView.title}</h3>
                  <StatusBadge status={detailView.status} />
                </div>
                <NodeActions
                  node={detailView}
                  workflowId={currentResult.workflow_id || ""}
                  isWorkflowRunning={isWorkflowRunning}
                />
              </div>
              <ScrollArea className="border-t pt-4 h-[calc(100vh-100px)] ">
                {renderNodeContent(detailView, false)}
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 p-8">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a step from the timeline to view details</p>
              </div>
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/4 bg-white rounded-lg border shadow-sm p-4">
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-purple-800" />
                </div>
                <h2 className="text-xl font-semibold">
                  {currentResult.name || "Workflow Result"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-full",
                    isWorkflowRunning
                      ? "bg-purple-100 text-purple-800 border-purple-200"
                      : "bg-green-100 text-green-800 border-green-200"
                  )}
                >
                  {isWorkflowRunning ? (
                    <span className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                      </span>
                      Running
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  )}
                </Badge>
                <div className="text-sm">
                  {isWorkflowRunning ? (
                    <span className="text-gray-600">
                      {progressPercentage}% in progress
                    </span>
                  ) : (
                    (currentResult.status === "completed" ||
                      isImplicitlyCompleted) && (
                      <span className="text-green-600 font-medium">
                        100% complete
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
              <div
                className={`h-full ${
                  hasFailedNodes
                    ? "bg-red-500"
                    : isWorkflowRunning
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${isWorkflowRunning ? progressPercentage : 100}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-4 px-2">Workflow Timeline</h3>
          <div className="relative">
            {(() => {
              const nodes = currentResult?.nodes || [];
              return nodes.length > 0 ? (
                nodes.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <TimelineNode
                      node={node}
                      isFirst={index === 0}
                      isLast={index === nodes.length - 1}
                      isSelected={detailView?.id === node.id}
                      onClick={() => setDetailView(node)}
                      workflowId={currentResult.workflow_id || ""}
                      isWorkflowRunning={isWorkflowRunning}
                    />
                  </React.Fragment>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No workflow steps available</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineNodeProps {
  node: NodeData;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onClick: () => void;
  workflowId: string;
  isWorkflowRunning: boolean;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({
  node,
  isFirst,
  isLast,
  isSelected,
  onClick,
  workflowId,
  isWorkflowRunning,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div
      className={cn(
        "relative pl-10 pr-4 py-3 border-l-2 cursor-pointer",
        isSelected
          ? "bg-blue-50 border-blue-500"
          : node.status === "completed"
          ? "border-green-500"
          : node.status === "failed"
          ? "border-red-500"
          : node.status === "running"
          ? "border-blue-500"
          : "border-gray-300",
        !isLast && "pb-5",
        "hover:bg-gray-50 transition-colors duration-200"
      )}
      onClick={onClick}
    >
      {/* Status Circle */}
      <div
        className={cn(
          "absolute left-[-8px] w-4 h-4 rounded-full border-2",
          node.status === "completed"
            ? "bg-green-100 border-green-500"
            : node.status === "failed"
            ? "bg-red-100 border-red-500"
            : node.status === "running"
            ? "bg-blue-100 border-blue-500"
            : "bg-gray-100 border-gray-300"
        )}
      />

      {/* Content */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {getStatusIcon(node.status)}
            <span className="font-medium">{node.title}</span>
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
          </span>
        </div>
        <ArrowRight
          className={cn("h-4 w-4 text-gray-400", isSelected && "text-blue-500")}
        />
      </div>

      {/* Connecting line to next node */}
      {!isLast && (
        <div className="absolute left-[-6px] top-7 h-full border-l-2 border-dashed border-gray-300" />
      )}
    </div>
  );
};

interface NodeActionsProps {
  node: NodeData;
  workflowId: string;
  isWorkflowRunning: boolean;
}

const NodeActions: React.FC<NodeActionsProps> = ({
  node,
  workflowId,
  isWorkflowRunning,
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

  if (!canRerun) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => rerunNode()}
            disabled={isRerunning}
            className="h-8 px-3"
          >
            {isRerunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5" />
                Rerun Step
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reprocess this step with the same inputs</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor()}`}
    >
      {status}
    </Badge>
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
      case "running":
        return "border-l-blue-500";
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
      case "running":
        return "text-blue-600";
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
      )} transition-all duration-300 border rounded-lg overflow-hidden animate-[fadeInDown_0.5s_ease-in-out] mb-3 shadow-sm`}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4 p-2 h-6">
          <ChevronRight
            className={`h-5 w-5 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <div className="flex items-center gap-2">
            {getNodeIcon(node)}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{node.title}</h3>
                <span className={`text-sm ${getStatusColor(node.status)}`}>
                  • {node.status}
                </span>
              </div>
            </div>
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
          <div className="overflow-y-auto p-4 max-h-screen">
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
  resultId,
}: {
  eventId?: string;
  projectId: string;
  setPendingEvent: (pending: boolean) => void;
  resultId: string;
}) => {
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [drawings, setDrawings] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useStore((state) => state.session);

  const handleSubmit = async () => {
    if (!session || !projectId || !eventId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("body", inputText);
      files.forEach((file) => formData.append("files", file));
      drawings.forEach((file) => formData.append("drawings", file));
      formData.append("streaming_key", resultId);

      await triggerEvent({
        session,
        projectId,
        eventId: eventId,
        formData,
      });

      setInputText("");
      setFiles([]);
      setDrawings([]);
    } finally {
      setIsLoading(false);
      setPendingEvent(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium">
          What do you want to do? Attach files if needed.
        </h3>
      </div>

      {files.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md text-sm border"
                >
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button
                    onClick={() =>
                      setFiles(files.filter((_, i) => i !== index))
                    }
                    className="hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {drawings.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {drawings.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md text-sm border"
                >
                  <Edit3 className="h-4 w-4 text-gray-500" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button
                    onClick={() =>
                      setDrawings(drawings.filter((_, i) => i !== index))
                    }
                    className="hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your instructions here..."
        className="min-h-[100px] resize-none"
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
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() =>
            document.getElementById(`file-upload-${eventId}`)?.click()
          }
        >
          <FileText className="h-4 w-4 mr-2" />
          Attach Files
        </Button>

        <Input
          type="file"
          multiple
          onChange={(e) =>
            e.target.files &&
            setDrawings([...drawings, ...Array.from(e.target.files)])
          }
          className="hidden"
          id={`drawing-upload-${eventId}`}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() =>
            document.getElementById(`drawing-upload-${eventId}`)?.click()
          }
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Attach Drawings
        </Button>

        <Button onClick={handleSubmit} disabled={isLoading} className="ml-auto">
          {isLoading ? (
            <>
              <LoaderAnimation />
            </>
          ) : (
            "Submit Response"
          )}
        </Button>
      </div>
    </div>
  );
};

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
      if (
        node.output &&
        typeof node.output === "object" &&
        "drawings" in node.output
      ) {
        const drawings = node.output.drawings;
        const body = node.output.body || "";
        return Array.isArray(drawings) ? (
          <>
            <p className="text-sm text-gray-700 whitespace-pre-line my-2">
              {body}
            </p>
            <PdfLoader drawings={drawings} />
          </>
        ) : (
          <div className="text-sm text-gray-700">Invalid drawings format</div>
        );
      }

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
