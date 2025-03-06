import React, { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import { CircleIcon } from "lucide-react";

interface StreamComponentProps {
  streamingKey: string;
  authToken: string;
  taskId?: string;
  onStreamComplete?: (content: string) => void;
}

const StreamComponent: React.FC<StreamComponentProps> = ({
  streamingKey,
  authToken,
  taskId,
  onStreamComplete,
}) => {
  const [displayValue, setDisplayValue] = useState<string>("");
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(true);
  const [streamComplete, setStreamComplete] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/${streamingKey}`
    );

    eventSource.onopen = () => {
      console.log("Connection opened");
      setIsPending(true);
      setStreamComplete(false);
    };

    eventSource.onmessage = (event) => {
      // Only process message events (heartbeats come through 'heartbeat' event type)
      if (event.data) {
        // Filter out the END:{streaming_key} message
        if (event.data.startsWith("END:")) {
          console.log("Received end marker in message data, ignoring");
          return;
        }

        setDisplayValue((prev) => {
          const newData = event.data.replace(/\\n/g, "\n"); // Convert escaped newlines to actual newlines
          return prev + newData;
        });
      }
    };

    // Handle heartbeat events separately
    eventSource.addEventListener("heartbeat", (event) => {
      // Heartbeat received, can be used for connection monitoring if needed
      // console.log("Heartbeat received");
    });

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      setIsPending(false);
      setStreamComplete(true);
      eventSource.close();

      // Instead of invalidating queries, use the callback if provided
      if (onStreamComplete && displayValue) {
        onStreamComplete(displayValue);
      }
    };

    eventSource.addEventListener("END", () => {
      console.log("Stream ended");
      setIsPending(false);
      setStreamComplete(true);

      // Instead of invalidating queries, use the callback if provided
      if (onStreamComplete && displayValue) {
        onStreamComplete(displayValue);
      }

      eventSource.close();
    });

    // Clean up function
    return () => {
      console.log("Closing connection");
      eventSource.close();
    };
  }, [streamingKey, authToken, onStreamComplete]);

  // Continue displaying content even after streaming is complete
  return (
    <div className="whitespace-pre-wrap mb-4">
      {displayValue ? (
        <div className="pb-4">
          <MarkDownDisplay content={displayValue} />
          {isPending && (
            <div className="flex gap-1 items-center mt-2">
              <CircleIcon
                className="w-3 h-3 text-gray-400 animate-pulse delay-0"
                fill="currentColor"
              />
              <CircleIcon
                className="w-3 h-3 text-gray-400 animate-pulse delay-150"
                fill="currentColor"
              />
              <CircleIcon
                className="w-3 h-3 text-gray-400 animate-pulse delay-300"
                fill="currentColor"
              />
            </div>
          )}
        </div>
      ) : isPending ? (
        <div className="flex gap-1 items-center justify-center pb-4">
          <CircleIcon
            className="w-3 h-3 text-gray-400 animate-pulse delay-0"
            fill="currentColor"
          />
          <CircleIcon
            className="w-3 h-3 text-gray-400 animate-pulse delay-150"
            fill="currentColor"
          />
          <CircleIcon
            className="w-3 h-3 text-gray-400 animate-pulse delay-300"
            fill="currentColor"
          />
        </div>
      ) : null}
    </div>
  );
};

export default StreamComponent;
