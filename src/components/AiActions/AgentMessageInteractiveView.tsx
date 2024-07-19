import React from "react";
import { Flex } from "@chakra-ui/react";
import { AgentMessage } from "@/types/agentChats";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import ArtifactViewer from "./ArtifactViewer";
/**
 * Represents the props for the AgentMessageInteractiveView component.
 */

function AgentMessageInteractiveView({ message }: { message: AgentMessage }) {
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
      {message.antartifact && message.antartifact.attributes?.type && (
        <Flex>
          <ArtifactViewer antartifact={message.antartifact} />
        </Flex>
      )}
    </Flex>
  );
}

export default AgentMessageInteractiveView;
