import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import EventSource, {
  EventSourceListener,
  MessageEvent,
  ErrorEvent,
  OpenEvent,
  TimeoutEvent,
  ExceptionEvent,
} from "react-native-sse";
import { useStore } from "../utils/store";
import { getChatHistory } from "../api/chatApi";

interface StreamChatProps {
  streamingKey: string;
  authToken: string;
}

// Custom type for our EventSource that includes the END event
type CustomEventSource = EventSource & {
  addEventListener(type: "END", listener: (event: MessageEvent) => void): void;
  removeEventListener(
    type: "END",
    listener: (event: MessageEvent) => void
  ): void;
};

const API_URL = "https://fastapi.eastus.cloudapp.azure.com";

export default function StreamChat({
  streamingKey,
  authToken,
}: StreamChatProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isPending, setIsPending] = useState(true);
  const session = useStore((state) => state.session);
  const activeChatEntity = useStore((state) => state.activeChatEntity);

  const refreshChatHistory = async () => {
    if (!session || !activeChatEntity) return;
    try {
      const history = await getChatHistory(session, activeChatEntity.id);
      if (history) {
        useStore.getState().setMessages(history);
      }
    } catch (error) {
      console.error("Error refreshing chat history:", error);
    }
  };

  useEffect(() => {
    const es = new EventSource(`${API_URL}/stream/${streamingKey}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }) as CustomEventSource;

    const handleOpen = (event: OpenEvent) => {
      console.log("Connection opened");
      setIsPending(true);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        setDisplayValue((prev) => prev + event.data);
      }
    };

    const handleEnd = (event: MessageEvent) => {
      console.log("Stream ended");
      setIsPending(false);
      refreshChatHistory();
      es.close();
    };

    const handleError: EventSourceListener<never, "error"> = (event) => {
      let errorMessage = "EventSource failed";
      if (event.type === "error" && (event as ErrorEvent).message) {
        errorMessage = (event as ErrorEvent).message;
      } else if (event.type === "timeout") {
        errorMessage = "Connection timed out";
      } else if (event.type === "exception") {
        errorMessage = "Connection exception";
      }
      console.error(errorMessage, event);
      setIsPending(false);
      refreshChatHistory();
      es.close();
    };

    es.addEventListener("open", handleOpen);
    es.addEventListener("message", handleMessage);
    es.addEventListener("END", handleEnd);
    es.addEventListener("error", handleError);

    return () => {
      console.log("Closing connection");
      es.removeEventListener("open", handleOpen);
      es.removeEventListener("message", handleMessage);
      es.removeEventListener("END", handleEnd);
      es.removeEventListener("error", handleError);
      es.close();
    };
  }, [streamingKey, authToken]);

  if (!isPending || !displayValue) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.streamText}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginVertical: 5,
  },
  streamText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
