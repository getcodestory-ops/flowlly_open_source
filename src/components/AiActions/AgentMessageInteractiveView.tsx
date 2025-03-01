import React, { useState } from "react";
import { AgentMessage } from "@/types/agentChats";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import ArtifactViewer from "./ArtifactViewer";
import { useStore } from "@/utils/store";
import {
  File,
  FileImage,
  FileText,
  FileArchive,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function AgentMessageInteractiveView({ message }: { message: AgentMessage }) {
  const sessionToken = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [expandedContexts, setExpandedContexts] = useState<string[]>([]);

  const toggleContext = (contextId: string) => {
    setExpandedContexts((prev) =>
      prev.includes(contextId)
        ? prev.filter((id) => id !== contextId)
        : [...prev, contextId]
    );
  };

  const groupedContexts =
    message.antartifact?.context?.reduce((acc, context, index) => {
      const groupIndex = Math.floor(index / 3);
      if (!acc[groupIndex]) acc[groupIndex] = [];
      acc[groupIndex].push(context);
      return acc;
    }, [] as Array<typeof message.antartifact.context>) || [];

  // Function to get appropriate file icon based on extension
  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
      return <FileImage className="h-4 w-4 mr-1" />;
    } else if (["doc", "docx", "txt", "rtf", "pdf"].includes(ext)) {
      return <FileText className="h-4 w-4 mr-1" />;
    } else if (["xls", "xlsx", "csv"].includes(ext)) {
      return <FileSpreadsheet className="h-4 w-4 mr-1" />;
    } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return <FileArchive className="h-4 w-4 mr-1" />;
    } else {
      return <File className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="flex flex-col ">
      {message.response ? (
        <MarkDownDisplay content={message.response} />
      ) : (
        <>
          {typeof message.content === "string" && (
            <div className=" ">
              <MarkDownDisplay content={message.content} />
            </div>
          )}
        </>
      )}

      {/* Display file attachments if present */}
      {message.files && message.files.length > 0 && (
        <div className="mt-2 mb-2">
          <div className="text-xs text-gray-500 mb-1">Attachments:</div>
          <div className="flex flex-wrap gap-2">
            {message.files.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="py-1 px-2 flex items-center"
              >
                {getFileIcon(file.extension || "")}
                <span className="truncate max-w-[150px]">
                  {file.resource_name || file.resource_id}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {message.child_task_id && sessionToken && activeProject?.project_id && (
        <div>
          <ArtifactViewer
            childTaskId={message.child_task_id}
            projectId={activeProject.project_id}
            sessionToken={sessionToken}
          />
        </div>
      )}
      {groupedContexts.length > 0 && (
        <div className="mt-4 text-sm">
          {groupedContexts.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <div className="mb-2 flex flex-wrap gap-2">
                {group.map((context) => (
                  <div
                    key={context.metadata?.file_sha1}
                    className="flex-1 min-w-[200px]"
                  >
                    <button
                      onClick={() =>
                        toggleContext(context.metadata?.file_sha1 || "")
                      }
                      className="flex items-center justify-between w-full p-2 bg-gray-100 rounded-md hover:bg-gray-200 text-xs"
                    >
                      <span className="truncate">
                        {context.metadata?.file_name || "Unknown file"}
                      </span>
                      <span>
                        {expandedContexts.includes(
                          context.metadata?.file_sha1 || ""
                        )
                          ? "▲"
                          : "▼"}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              {group.map(
                (context) =>
                  expandedContexts.includes(
                    context.metadata?.file_sha1 || ""
                  ) && (
                    <div
                      key={`expanded-${context.metadata?.file_sha1}`}
                      className="mb-4 p-2 bg-gray-50 rounded-md text-xs w-full"
                    >
                      <MarkDownDisplay content={context.context} />
                    </div>
                  )
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentMessageInteractiveView;
