import React from "react";
import { Flex } from "@chakra-ui/react";
import { AgentMessage } from "@/types/agentChats";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import ArtifactViewer from "./ArtifactViewer";
import { useStore } from "@/utils/store";

/**
 * Represents the props for the AgentMessageInteractiveView component.
 */

function AgentMessageInteractiveView({ message }: { message: AgentMessage }) {
  const sessionToken = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  return (
    <Flex flexDir="column">
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
        <Flex>
          <ArtifactViewer
            childTaskId={message.child_task_id}
            projectId={activeProject.project_id}
            sessionToken={sessionToken}
          />
        </Flex>
      )}
    </Flex>
  );
}

export default AgentMessageInteractiveView;
