import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import MarkdownTerminal from "../Markdown/style/MarkdownTerminal";
import { useChatStore } from "@/hooks/useChatStore";


interface StreamComponentProps {
  streamingKey: string;
  authToken: string;
  taskId?: string;
  onStreamComplete?: (content: string) => void;
  onThinkingChange?: (thinking: boolean) => void;
  onThinkingContentChange?: (content: string) => void;
  isExpanded?: boolean;
}

interface ATTACHMENT_DATA {
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
	onThinkingChange,
	onThinkingContentChange,
	isExpanded = false,
}) => {
	const [displayValue, setDisplayValue] = useState<string>("");
	const displayValueRef = useRef<string>("");
	const [isPending, setIsPending] = useState(true);
	const [STREAM_COMPLETE, setStreamComplete] = useState(false);
	const [isThinking, setIsThinking] = useState(false);
	const [THINKING_CONTENT, setThinkingContent] = useState<string>("");
	const eventSourceRef = useRef<EventSource | null>(null);
	const { setSidePanel, setCollapsed, setTodoState, initFileProgress, appendFileProgressDelta, endFileProgress } = useChatStore() as any;

	// Keep ref in sync with state
	useEffect(() => {
		displayValueRef.current = displayValue;
	}, [displayValue]);

	// Helper function to handle attachment events
	const handleAttachmentEvent = useCallback((attachmentDataString: string): void => {
		try {
			// Parse the attachment data from the stream
			const attachment = JSON.parse(attachmentDataString);
			const fileType = attachment.is_sandbox_file === "sandbox" ? "sandbox" : "sandbox"; 
			setSidePanel({
				isOpen: true,
				type: fileType,
				resourceId: attachment.is_sandbox_file 
					? `${attachment.uuid}::${attachment.name}` // Use sandbox_id::filename for unique identification
					: attachment.uuid,
				filename: attachment.name,
				sandbox_id: attachment.is_sandbox_file ? attachment.uuid : undefined, // Store original sandbox_id for API calls
			});
			setCollapsed(true);
		} catch (error) {
			console.error("Error parsing attachment data:", error);
		}
	}, [setSidePanel, setCollapsed]);

	// Reset state when streamingKey changes
	useEffect(() => {
		setDisplayValue("");
		setIsPending(true);
		setStreamComplete(false);
		setIsThinking(false);
		setThinkingContent("");
		
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
					// Extract the data part after "data: "
					const dataPart = event.data.split("data: ")[1];
					if (dataPart) {
						const thinkingData = dataPart.trim();
						if (thinkingData === "STARTED") {
							setIsThinking(true);
							setThinkingContent("");
							// Defer the callback to avoid setState during render
							setTimeout(() => {
								onThinkingChange?.(true);
								onThinkingContentChange?.("");
							}, 0);
						} else if (thinkingData === "ENDED") {
							setIsThinking(false);
							setThinkingContent("");
							// Defer the callback to avoid setState during render
							setTimeout(() => {
								onThinkingChange?.(false);
								onThinkingContentChange?.("");
							}, 0);
						} else {
							// This is thinking content - accumulate it
							setIsThinking(true);
							setThinkingContent((prev) => {
								// Convert escaped newlines to actual newlines
								const processedData = thinkingData.replace(/\\n/g, "\n");
								const newContent = prev + processedData;
								// Defer the callback to avoid setState during render
								setTimeout(() => {
									onThinkingContentChange?.(newContent);
								}, 0);
								return newContent;
							});
							// Defer the callback to avoid setState during render
							setTimeout(() => {
								onThinkingChange?.(true);
							}, 0);
						}
					}
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

				// Check if this is a TODO event that came through as regular message data
				if (event.data.includes("event: TODO")) {
					const dataPart = event.data.split("data: ")[1];
					if (dataPart) {
						try {
							const todoPayload = JSON.parse(dataPart.trim());
							const fileId = todoPayload.file || "todo_state.json";
							if (todoPayload.state) {
								setTodoState(fileId, todoPayload.state);
							}
							setSidePanel({
								isOpen: true,
								type: "todo",
								resourceId: fileId,
								title: "Task Progress",
							});
							setCollapsed(true);
						} catch (e) {
							console.error("Error parsing TODO data:", e);
						}
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
		});

		// Handle thinking events
		eventSource.addEventListener("THINKING", (event) => {
			if (event.data) {
				const thinkingData = event.data;
				if (thinkingData === "STARTED") {
					setIsThinking(true);
					setThinkingContent("");
					// Defer the callback to avoid setState during render
					setTimeout(() => {
						onThinkingChange?.(true);
						onThinkingContentChange?.("");
					}, 0);
				} else if (thinkingData === "ENDED") {
					setIsThinking(false);
					setThinkingContent("");
					// Defer the callback to avoid setState during render
					setTimeout(() => {
						onThinkingChange?.(false);
						onThinkingContentChange?.("");
					}, 0);
				} else {
					// This is thinking content - accumulate it
					setIsThinking(true);
					setThinkingContent((prev) => {
						// Convert escaped newlines to actual newlines
						const processedData = thinkingData.replace(/\\n/g, "\n");
						const newContent = prev + processedData;
						// Defer the callback to avoid setState during render
						setTimeout(() => {
							onThinkingContentChange?.(newContent);
						}, 0);
						return newContent;
					});
					// Defer the callback to avoid setState during render
					setTimeout(() => {
						onThinkingChange?.(true);
					}, 0);
				}
			}
		});

		// Handle attachment events
		eventSource.addEventListener("ATTACHMENT", (event) => {
			if (event.data) {
				handleAttachmentEvent(event.data);
			}
		});

		// Handle TODO events
		eventSource.addEventListener("TODO", (event) => {
			if (event.data) {
				try {
					const todoPayload = JSON.parse(event.data);
					const fileId = todoPayload.file || "todo_state.json";
					if (todoPayload.state) {
						setTodoState(fileId, todoPayload.state);
					}
					setSidePanel({
						isOpen: true,
						type: "todo",
						resourceId: fileId,
						title: "Task Progress",
					});
					setCollapsed(true);
				} catch (e) {
					console.error("Error parsing TODO event:", e);
				}
			}
		});

		// Handle FILE_PROGRESS events
		eventSource.addEventListener("FILE_PROGRESS", (event) => {
			if (!event.data) return;
			try {
				const payload = JSON.parse(event.data);
				const action = payload.action as string;
				const status = payload.status as string;
				const fileName = payload.file_name as string;
				const delta = (payload.delta as string) || "";
				const op = (payload.op as string) || undefined;

				if (!fileName || !action || !status) return;

				const consolidatedId = "file-progress";
				const openConsolidatedTab = () => setSidePanel({
					isOpen: true,
					type: "fileProgress",
					resourceId: consolidatedId,
					title: fileName,
				});

				if (action === "create" || action === "append") {
					if (status === "started") {
						initFileProgress(fileName, action);
						openConsolidatedTab();
						setCollapsed(true);
					} else if (status === "delta") {
						appendFileProgressDelta(fileName, delta, "delta");
					} else if (status === "ended") {
						endFileProgress(fileName);
					}
				} else if (action === "edit") {
					if (status === "started") {
						initFileProgress(fileName, "edit");
						openConsolidatedTab();
						setCollapsed(true);
					} else if (status === "delta") {
						// Simple text ops: delete removes first occurrence; insert appends
						const state = (useChatStore.getState() as any);
						const current = state.fileProgress[fileName]?.content || "";
						if (op === "delete" && delta) {
							const idx = current.indexOf(delta);
							if (idx !== -1) {
								const updated = current.slice(0, idx) + current.slice(idx + delta.length);
								state.setFileProgressContent(fileName, updated, "delta");
							} else {
								state.setFileProgressContent(fileName, current, "delta");
							}
						} else if (op === "insert") {
							state.setFileProgressContent(fileName, current + delta, "delta");
						} else {
							state.setFileProgressContent(fileName, current + delta, "delta");
						}
					} else if (status === "ended") {
						endFileProgress(fileName);
					}
				}
			} catch (e) {
				console.error("Error parsing FILE_PROGRESS:", e);
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
				onStreamComplete(displayValueRef.current);
			}
		};

		eventSource.addEventListener("END", () => {
			//console.log("Stream ended");
			setIsPending(false);
			setStreamComplete(true);

			// Call the callback if provided, regardless of displayValue content
			if (onStreamComplete) {
				onStreamComplete(displayValueRef.current);
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [streamingKey, authToken, onStreamComplete, onThinkingChange, onThinkingContentChange, setSidePanel, setCollapsed, setTodoState, handleAttachmentEvent, initFileProgress, appendFileProgressDelta, endFileProgress, isExpanded]);

	// Render content into the appropriate container based on expanded state
	const targetContainerId = isExpanded ? `stream-expanded-${streamingKey}` : `stream-preview-${streamingKey}`;
	const targetContainer = document.getElementById(targetContainerId);

	const content = (
		<div className="mb-4">
			{displayValue && (
				<div className="pb-4">
					<MarkdownTerminal content={displayValue} />
				</div>
			)}
			{(isThinking || isPending) && (
				<div className="pb-4">
					<LoadingDots centered showThinking={isThinking} />
				</div>
			)}
		</div>
	);

	// Use portal to render content in the target container, fallback to normal render if container not found
	return targetContainer ? createPortal(content, targetContainer) : content;
};

export default StreamComponent;
