import React, { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import { useWebSocket } from "@/hooks/useWebSocket";

function StreamingResponse() {
  const [notification, setNotification] = useState("");
  const { isConnected, lastMessage, sendMessage } = useWebSocket();

  useEffect(() => {
    if (isConnected && lastMessage) {
      setNotification((state) => `${state}${JSON.stringify(lastMessage)}`);
    }
  }, [isConnected, lastMessage]);

  return (
    <Flex direction="column" align="center">
      <Box>
        <MarkDownDisplay content={notification} />
      </Box>
    </Flex>
  );
}

export default StreamingResponse;
