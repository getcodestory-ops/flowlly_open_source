import { useEffect, useState } from "react";

interface WebSocketHook {
  isConnected: boolean;
  lastMessage: any | null;
  sendMessage: (message: string) => void;
}

export const useWebSocket = (): WebSocketHook => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/ws/c65422b7-3356-4876-a216-7b0ed270ceed`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      console.log("Message received:", event.data);
      setLastMessage(event.data);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: string): void => {
    if (socket && isConnected) {
      socket.send(message);
    }
  };

  return { isConnected, lastMessage, sendMessage };
};
