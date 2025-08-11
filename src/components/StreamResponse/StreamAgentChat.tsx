import React, { useEffect, useState, useRef } from "react";
import MarkdownTerminal from "../Markdown/style/MarkdownTerminal";
import { useChatStore } from "@/hooks/useChatStore";

interface StreamComponentProps {
  streamingKey: string;
  authToken: string;
  taskId?: string;
  onStreamComplete?: (content: string) => void;
}

interface AttachmentData {
  resource_id: string;
  resource_name: string;
  extension?: string;
  type?: string;
  focus?: boolean;
}

const LoadingDots: React.FC<{ showThinking?: boolean; centered?: boolean }> = ({ 
	showThinking = false, 
	centered = false, 
}) => (
	<div className={`flex gap-2 items-center ${centered ? "justify-center" : ""} ${showThinking ? "mt-2" : "mt-2"}`}>
		<div className="flex gap-0.5 items-center">
			<div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
			<div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75" />
			<div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-150" />
		</div>
		{showThinking && (
			<span className="text-xs text-gray-600 font-medium">
        thinking...
			</span>
		)}
	</div>
);

const StreamComponent: React.FC<StreamComponentProps> = ({
	streamingKey,
	authToken,
	taskId: _taskId,
	onStreamComplete,
}) => {
	const [displayValue, setDisplayValue] = useState<string>("");
	const [isPending, setIsPending] = useState(true);
	const [_STREAM_COMPLETE, setStreamComplete] = useState(false);
	const [isThinking, setIsThinking] = useState(false);
	const eventSourceRef = useRef<EventSource | null>(null);
	const { setSidePanel, setCollapsed } = useChatStore();

	// Helper function to handle attachment events
	const handleAttachmentEvent = (attachmentDataString: string): void => {
		try {
			// Parse the attachment data from the stream
			const attachment = JSON.parse(attachmentDataString);
			const fileType = attachment.is_sandbox_file === "sandbox" ? "sandbox" : "sandbox"; 
			setSidePanel({
				isOpen: true,
				type: fileType,
				resourceId: attachment.uuid,
				filename: attachment.name,
			});
			setCollapsed(true);
		} catch (error) {
			console.error("Error parsing attachment data:", error);
		}
	};

	// Reset state when streamingKey changes
	useEffect(() => {
		setDisplayValue("");
		setIsPending(true);
		setStreamComplete(false);
		setIsThinking(false);
		
		// Clean up previous EventSource if it exists
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}
		
		// Create new EventSource connection
		const eventSource = new EventSource(
			`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/${streamingKey}`,
		);
		eventSourceRef.current = eventSource;

		eventSource.onopen = () => {
			//console.log("Connection opened");
			setIsPending(true);
			setStreamComplete(false);
		};

		eventSource.onmessage = (event) => {
			if (event.data) {
				if (event.data.startsWith("END:")) {
					return;
				}

				// Check if this is a THINKING event that came through as regular message data
				if (event.data.includes("event: THINKING")) {
					setIsThinking(true);
					return; // Don't add this to displayValue
				}

				// Check if this is an ATTACHMENT event that came through as regular message data
				if (event.data.includes("event: ATTACHMENT")) {
					// Extract the data part after "data: "
					const dataPart = event.data.split("data: ")[1];
					if (dataPart) {
						handleAttachmentEvent(dataPart.trim());
					}
					return; // Don't add this to displayValue
				}

				// Clear thinking state when regular data comes in
				setIsThinking(false);

				setDisplayValue((prev) => {
					const newData = event.data.replace(/\\n/g, "\n"); // Convert escaped newlines to actual newlines
					return prev + newData;
				});
			}
		};

		// Handle heartbeat events separately
		eventSource.addEventListener("heartbeat", (_event) => {
			// Heartbeat received, can be used for connection monitoring if needed
			// //console.log("Heartbeat received");
		});

		// Handle thinking events
		eventSource.addEventListener("THINKING", (_event) => {
			setIsThinking(true);
		});

		// Handle attachment events
		eventSource.addEventListener("ATTACHMENT", (event) => {
			if (event.data) {
				handleAttachmentEvent(event.data);
			}
		});

		eventSource.onerror = (error) => {
			console.error("EventSource failed:", error);
			setIsPending(false);
			setStreamComplete(true);
			eventSource.close();
			eventSourceRef.current = null;

			// Call the callback if provided, regardless of displayValue content
			if (onStreamComplete) {
				onStreamComplete(displayValue);
			}
		};

		eventSource.addEventListener("END", () => {
			//console.log("Stream ended");
			setIsPending(false);
			setStreamComplete(true);

			// Call the callback if provided, regardless of displayValue content
			if (onStreamComplete) {
				onStreamComplete(displayValue);
			}

			eventSource.close();
			eventSourceRef.current = null;
		});

		// Clean up function
		return () => {
			//console.log("Closing connection");
			eventSource.close();
			eventSourceRef.current = null;
		};
	}, [streamingKey, authToken, onStreamComplete, setSidePanel, setCollapsed]);

	// Continue displaying content even after streaming is complete
	return (
		<div className="mb-4">
			{displayValue ? (
				<div className="pb-4">
					<MarkdownTerminal content={displayValue} />
					{(isThinking || isPending) && (
						<LoadingDots showThinking={isThinking} />
					)}
				</div>
			) : isPending || isThinking ? (
				<div className="pb-4">
					<LoadingDots centered showThinking={isThinking} />
				</div>
			) : null}
		</div>
	);
};

export default StreamComponent;
