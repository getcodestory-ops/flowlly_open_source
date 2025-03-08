import { useEffect, useState } from "react";
import { useStore } from "@/utils/store";
import { getWebSocketAuthToken } from "@/api/websocket_routes";
interface WebSocketHook {
  isConnected: boolean;
  lastMessage: any | null;
  sendMessage: (message: string) => void;
}

export const useWebSocket = (): WebSocketHook => {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [lastMessage, setLastMessage] = useState<any | null>(null);
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	useEffect(() => {
		async function connect() {
			if (!activeProject?.project_id || !session) {
				console.error("No active project");
				return;
			}

			try {
				const token = await getWebSocketAuthToken(
					session,
					activeProject.project_id,
				);

				const ws = new WebSocket(
					`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/ws/${activeProject.project_id}/${token}`,
				);

				ws.onopen = () => {
					//console.log("WebSocket connected");
					setIsConnected(true);
				};

				ws.onmessage = (event: MessageEvent) => {
					//console.log("Message received:", event.data);
					setLastMessage(JSON.parse(event.data));
				};

				ws.onclose = (event: any) => {
					//console.log("WebSocket disconnected");
					//log error message sent from server
					//console.log(event);
					setIsConnected(false);
				};

				setSocket(ws);
			} catch (error) {
				console.error("Error connecting to WebSocket", error);
			}
		}
		connect();

		return () => {
			socket?.close();
		};
	}, [session]);

	const sendMessage = (message: string): void => {
		if (socket && isConnected) {
			socket.send(message);
		}
	};

	return { isConnected, lastMessage, sendMessage };
};
