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
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/${streamingKey}`
    );

    eventSource.onopen = () => {
      console.log("Connection opened");
      setIsPending(true);
    };

    eventSource.onmessage = (event) => {
      // Handle different types of messages and maintain formatting
      if (event.data.trim()) {
        // Only process non-empty data
        setDisplayValue((prev) => {
          const newData = event.data;
          // Add double newline for section completions and headers
          if (
            newData.includes("Section Completed") ||
            newData.startsWith("##")
          ) {
            return prev + newData + "\n\n";
          }
          // Add single newline for regular content
          return prev + newData + "\n";
        });
      }
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
  }, [streamingKey, authToken]);

  return (
    <div className="whitespace-pre-wrap">
      {isPending && <MarkDownDisplay content={displayValue} />}
    </div>
  );
};

export default StreamComponent;
