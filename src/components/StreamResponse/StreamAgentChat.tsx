import React, { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";

interface StreamComponentProps {
  streamingKey: string;
  authToken: string;
  taskId?: string;
}

const StreamComponent: React.FC<StreamComponentProps> = ({
  streamingKey,
  authToken,
  taskId,
}) => {
  const [displayValue, setDisplayValue] = useState<string>("");
  const [rawString, setRawString] = useState<string>("");
  const [isPending, setIsPending] = useState(true);
  const queryClient = useQueryClient();

  const processChunk = useCallback(() => {
    const regex = new RegExp("<response>(.*?)</response>|<response>(.*)", "s");
    const match = rawString.match(regex);
    if (match) {
      setDisplayValue((prev) => prev + (match[1] || match[2] || ""));
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/${streamingKey}`
      // {
      //   withCredentials: true, // Include credentials if needed
      // }
    );

    eventSource.onopen = () => {
      console.log("Connection opened");
      setIsPending(true);
    };

    eventSource.onmessage = (event) => {
      setDisplayValue((prev) => prev + event.data);
      // processChunk();
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      setIsPending(false);
      eventSource.close();
      queryClient.invalidateQueries({ queryKey: ["agentChats"] });
      if (taskId)
        queryClient.invalidateQueries({ queryKey: [`taskResult${taskId}`] });
    };

    eventSource.addEventListener("END", () => {
      console.log("Stream ended");
      setIsPending(false);
      queryClient.invalidateQueries({ queryKey: ["agentChats"] });
      if (taskId)
        queryClient.invalidateQueries({ queryKey: [`taskResult${taskId}`] });
      eventSource.close();
    });

    // Clean up function
    return () => {
      console.log("Closing connection");
      eventSource.close();
    };
  }, [streamingKey, authToken, queryClient, processChunk]);

  return (
    <div className="">
      {isPending && <MarkDownDisplay content={displayValue} />}
    </div>
  );
};

export default StreamComponent;
