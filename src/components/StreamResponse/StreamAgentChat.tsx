import React, { useEffect, useState, useRef } from "react";
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
	const [isPending, setIsPending] = useState(true);
	const [streamComplete, setStreamComplete] = useState(false);
	const eventSourceRef = useRef<EventSource | null>(null);

	// Reset state when streamingKey changes
	useEffect(() => {
		setDisplayValue("");
		setIsPending(true);
		setStreamComplete(false);
		
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

				setDisplayValue((prev) => {
					const newData = event.data.replace(/\\n/g, "\n"); // Convert escaped newlines to actual newlines
					return prev + newData;
				});
			}
		};

		// Handle heartbeat events separately
		eventSource.addEventListener("heartbeat", (event) => {
			// Heartbeat received, can be used for connection monitoring if needed
			// //console.log("Heartbeat received");
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
	}, [streamingKey, authToken, onStreamComplete]);

	// Continue displaying content even after streaming is complete
	return (
		<div className="mb-4">
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
