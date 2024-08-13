import React, { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import { NotificationInterface } from "@/types/updateCollection";

function StreamingResponse() {
  const [notification, setNotification] = useState<NotificationInterface[]>([]);
  const { isConnected, lastMessage, sendMessage } = useWebSocket();

  useEffect(() => {
    if (isConnected && lastMessage) {
      setNotification((state) => [
        ...state,
        {
          title: lastMessage?.title,
          message: lastMessage?.message,
          status: lastMessage?.status,
        },
      ]);
    }
  }, [isConnected, lastMessage]);

  return (
    <div className="flex flex-col w-full gap-2">
      {notification.map((note, index) => (
        <Alert
          key={index}
          className="w-full"
          variant={note.status === "info" ? "default" : "destructive"}
        >
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>{note?.title}</AlertTitle>
          <AlertDescription>{note?.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

export default StreamingResponse;
