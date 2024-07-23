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
          <ArtifactViewer
            antartifact={message.antartifact}
            sessionToken={sessionToken}
          />
        </Flex>
      )}
    </Flex>
  );
}

export default AgentMessageInteractiveView;
