import React from "react";
import { AgentMessage } from "@/types/agentChats";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import ArtifactViewer from "./ArtifactViewer";
import { useStore } from "@/utils/store";

function AgentMessageInteractiveView({ message }: { message: AgentMessage }) {
  const sessionToken = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  return (
    <div className="flex flex-col">
      {message.response ? (
        <MarkDownDisplay content={message.response} />
      ) : (
        <>
          {typeof message.content === "string" && (
            <MarkDownDisplay content={message.content} />
          )}
        </>
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
    </div>
  );
}

export default AgentMessageInteractiveView;
