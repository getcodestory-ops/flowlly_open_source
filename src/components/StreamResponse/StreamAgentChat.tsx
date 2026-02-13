import React, { useEffect, useState, useRef, useCallback } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import MarkdownDisplay from "../Markdown/MarkDownDisplay";
import { Loader2, ArrowUpRight, Box, CheckCircle2, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";


interface StreamComponentProps {
  streamingKey: string;
  authToken: string;
  taskId?: string;
  onStreamComplete?: (content: string) => void;
  onThinkingChange?: (thinking: boolean) => void;
  onThinkingContentChange?: (content: string) => void;
}

// Unified stream event type - all events in one chronological list
type StreamEvent =
  | { type: "file"; fileName: string; action: string; status: "generating"; ts: number }
  | { type: "attachment"; name: string; uuid: string; is_sandbox_file?: boolean; resourceId: string; fileType: string; sandbox_id?: string; ts: number }
  | { type: "todo"; fileId: string; ts: number };

// Helper to extract extension from filename
const getExtension = (fileName: string): string => {
	const lastDot = fileName.lastIndexOf(".");
	if (lastDot > 0 && lastDot < fileName.length - 1) {
		return fileName.slice(lastDot + 1);
	}
	return "";
};

const FLUSH_INTERVAL_MS = 100; // Flush buffered tokens/deltas every 100ms

const StreamComponent: React.FC<StreamComponentProps> = ({
	streamingKey,
	authToken,
	taskId: _taskId,
	onStreamComplete,
	onThinkingChange,
	onThinkingContentChange,
}) => {
	const [displayValue, setDisplayValue] = useState<string>("");
	const displayValueRef = useRef<string>("");
	const [isPending, setIsPending] = useState(true);
	const [STREAM_COMPLETE, setStreamComplete] = useState(false);
	const [isThinking, setIsThinking] = useState(false);
	const [THINKING_CONTENT, setThinkingContent] = useState<string>("");
	const eventSourceRef = useRef<EventSource | null>(null);

	// Unified chronological event list (newest at the end = bottom of rendered list)
	const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);

	// Token buffering refs for throttled rendering
	const pendingTokensRef = useRef<string>("");
	const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// File progress delta buffering (for create/append actions)
	const pendingFileDeltasRef = useRef<{ [fileName: string]: string }>({});
	const fileProgressFlushRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const { setSidePanel, setCollapsed, setTodoState, todoStates, initFileProgress, appendFileProgressDelta, endFileProgress, clearStreamTabs } = useChatStore() as any;

	// Keep ref in sync with state
	useEffect(() => {
		displayValueRef.current = displayValue;
	}, [displayValue]);

	// Flush buffered tokens to state (called by interval)
	const flushTokens = useCallback(() => {
		if (pendingTokensRef.current) {
			const tokens = pendingTokensRef.current;
			pendingTokensRef.current = "";
			setDisplayValue((prev) => prev + tokens);
		}
	}, []);

	// Flush buffered create/append file progress deltas to store
	const flushFileDeltas = useCallback(() => {
		const pending = pendingFileDeltasRef.current;
		const fileNames = Object.keys(pending);
		if (fileNames.length === 0) return;

		// Clear buffer first to avoid double-flushing
		pendingFileDeltasRef.current = {};

		for (const fileName of fileNames) {
			const delta = pending[fileName];
			if (delta) {
				appendFileProgressDelta(fileName, delta, "delta");
			}
		}
	}, [appendFileProgressDelta]);

	// Handle attachment events - stores locally for inline indicator instead of auto-opening tab
	const handleAttachmentEvent = useCallback((attachmentDataString: string): void => {
		try {
			const attachment = JSON.parse(attachmentDataString);
			const fileType = attachment.is_sandbox_file === "sandbox" ? "sandbox" : "sandbox";
			const resourceId = attachment.is_sandbox_file
				? `${attachment.uuid}::${attachment.name}`
				: attachment.uuid;

			// Append to unified event list (newest at end = bottom)
			setStreamEvents((prev) => {
				if (prev.some((e) => e.type === "attachment" && e.resourceId === resourceId)) return prev;
				return [...prev, {
					type: "attachment" as const,
					name: attachment.name,
					uuid: attachment.uuid,
					is_sandbox_file: attachment.is_sandbox_file,
					resourceId,
					fileType,
					sandbox_id: attachment.is_sandbox_file ? attachment.uuid : undefined,
					ts: Date.now(),
				}];
			});
		} catch (error) {
			console.error("Error parsing attachment data:", error);
		}
	}, []);

	// Click handlers for inline indicators - open the relevant tab on demand
	const handleFileEventClick = useCallback((fileName: string) => {
		setSidePanel({
			isOpen: true,
			type: "fileProgress",
			resourceId: "file-progress",
			title: fileName,
		});
		setCollapsed(true);
	}, [setSidePanel, setCollapsed]);

	const handleAttachmentClick = useCallback((event: Extract<StreamEvent, { type: "attachment" }>) => {
		setSidePanel({
			isOpen: true,
			type: event.fileType,
			resourceId: event.resourceId,
			filename: event.name,
			sandbox_id: event.sandbox_id,
		});
		setCollapsed(true);
	}, [setSidePanel, setCollapsed]);

	const handleTodoClick = useCallback((fileId: string) => {
		setSidePanel({
			isOpen: true,
			type: "todo",
			resourceId: fileId,
			title: "Task Progress",
		});
		setCollapsed(true);
	}, [setSidePanel, setCollapsed]);


	useEffect(() => {
		setDisplayValue("");
		setIsPending(true);
		setStreamComplete(false);
		setIsThinking(false);
		setThinkingContent("");
		setStreamEvents([]);
		pendingTokensRef.current = "";
		pendingFileDeltasRef.current = {};

		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		// Start flush intervals for throttled rendering
		flushIntervalRef.current = setInterval(flushTokens, FLUSH_INTERVAL_MS);
		fileProgressFlushRef.current = setInterval(flushFileDeltas, FLUSH_INTERVAL_MS);

		const eventSource = new EventSource(
			`${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/stream/${streamingKey}`,
		);
		eventSourceRef.current = eventSource;

		eventSource.onopen = () => {
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
					const dataPart = event.data.split("data: ")[1];
					if (dataPart) {
						const thinkingData = dataPart.trim();
						if (thinkingData === "STARTED") {
							setIsThinking(true);
							setThinkingContent("");
							setTimeout(() => {
								onThinkingChange?.(true);
								onThinkingContentChange?.("");
							}, 0);
						} else if (thinkingData === "ENDED") {
							setIsThinking(false);
							setThinkingContent("");
							setTimeout(() => {
								onThinkingChange?.(false);
								onThinkingContentChange?.("");
							}, 0);
						} else {
							setIsThinking(true);
							setThinkingContent((prev) => {
								const processedData = thinkingData.replace(/\\n/g, "\n");
								const newContent = prev + processedData;
								setTimeout(() => {
									onThinkingContentChange?.(newContent);
								}, 0);
								return newContent;
							});
							setTimeout(() => {
								onThinkingChange?.(true);
							}, 0);
						}
					}
					return;
				}

				// Check if this is an ATTACHMENT event that came through as regular message data
				if (event.data.includes("event: ATTACHMENT")) {
					const dataPart = event.data.split("data: ")[1];
					if (dataPart) {
						handleAttachmentEvent(dataPart.trim());
					}
					return;
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
							// Add to unified event list (don't auto-open tab)
							setStreamEvents((prev) => {
								if (prev.some((e) => e.type === "todo" && e.fileId === fileId)) return prev;
								return [...prev, { type: "todo" as const, fileId, ts: Date.now() }];
							});
						} catch (e) {
							console.error("Error parsing TODO data:", e);
						}
					}
					return;
				}

				// Clear thinking state when regular data comes in
				setIsThinking(false);

				// Buffer tokens instead of immediately updating state
				const newData = event.data.replace(/\\n/g, "\n");
				pendingTokensRef.current += newData;
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
					setTimeout(() => {
						onThinkingChange?.(true);
						onThinkingContentChange?.("");
					}, 0);
				} else if (thinkingData === "ENDED") {
					setIsThinking(false);
					setThinkingContent("");
					setTimeout(() => {
						onThinkingChange?.(false);
						onThinkingContentChange?.("");
					}, 0);
				} else {
					setIsThinking(true);
					setThinkingContent((prev) => {
						const processedData = thinkingData.replace(/\\n/g, "\n");
						const newContent = prev + processedData;
						setTimeout(() => {
							onThinkingContentChange?.(newContent);
						}, 0);
						return newContent;
					});
					setTimeout(() => {
						onThinkingChange?.(true);
					}, 0);
				}
			}
		});

		// Handle attachment events - store locally instead of auto-opening tab
		eventSource.addEventListener("ATTACHMENT", (event) => {
			if (event.data) {
				handleAttachmentEvent(event.data);
			}
		});

		// Handle TODO events - store data but don't auto-open tab
		eventSource.addEventListener("TODO", (event) => {
			if (event.data) {
				try {
					const todoPayload = JSON.parse(event.data);
					const fileId = todoPayload.file || "todo_state.json";
					if (todoPayload.state) {
						setTodoState(fileId, todoPayload.state);
					}
					// Add to unified event list (don't auto-open tab)
					setStreamEvents((prev) => {
						if (prev.some((e) => e.type === "todo" && e.fileId === fileId)) return prev;
						return [...prev, { type: "todo" as const, fileId, ts: Date.now() }];
					});
				} catch (e) {
					console.error("Error parsing TODO event:", e);
				}
			}
		});

		// Handle FILE_PROGRESS events - buffer deltas, don't auto-open tabs
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

				if (action === "create" || action === "append") {
					if (status === "started") {
						initFileProgress(fileName, action);
						// Add to unified event list (newest at end = bottom)
						setStreamEvents((prev) => {
							if (prev.some((e) => e.type === "file" && e.fileName === fileName)) return prev;
							return [...prev, { type: "file" as const, fileName, action, status: "generating", ts: Date.now() }];
						});
					} else if (status === "delta") {
						// Buffer delta instead of immediately updating store
						pendingFileDeltasRef.current[fileName] =
							(pendingFileDeltasRef.current[fileName] || "") + delta;
					} else if (status === "ended") {
						// Flush any remaining buffered deltas for this file
						if (pendingFileDeltasRef.current[fileName]) {
							const buffered = pendingFileDeltasRef.current[fileName];
							delete pendingFileDeltasRef.current[fileName];
							appendFileProgressDelta(fileName, buffered, "delta");
						}
						endFileProgress(fileName);
						// Remove generating indicator - attachment event will show the final file
						setStreamEvents((prev) => prev.filter((e) =>
							!(e.type === "file" && e.fileName === fileName)
						));
					}
				} else if (action === "edit") {
					if (status === "started") {
						initFileProgress(fileName, "edit");
						// Add to unified event list (newest at end = bottom)
						setStreamEvents((prev) => {
							if (prev.some((e) => e.type === "file" && e.fileName === fileName)) return prev;
							return [...prev, { type: "file" as const, fileName, action, status: "generating", ts: Date.now() }];
						});
					} else if (status === "delta") {
						// Edit operations interact with existing content, keep direct updates
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
						// Remove generating indicator - attachment event will show the final file
						setStreamEvents((prev) => prev.filter((e) =>
							!(e.type === "file" && e.fileName === fileName)
						));
					}
				}
			} catch (e) {
				console.error("Error parsing FILE_PROGRESS:", e);
			}
		});

		// Helper to flush remaining buffers and clean up intervals
		const cleanupIntervals = () => {
			// Flush any remaining buffered tokens
			if (pendingTokensRef.current) {
				const remaining = pendingTokensRef.current;
				pendingTokensRef.current = "";
				setDisplayValue((prev) => prev + remaining);
			}
			// Flush remaining file deltas
			const pendingDeltas = pendingFileDeltasRef.current;
			pendingFileDeltasRef.current = {};
			for (const fName of Object.keys(pendingDeltas)) {
				if (pendingDeltas[fName]) {
					appendFileProgressDelta(fName, pendingDeltas[fName], "delta");
				}
			}
			if (flushIntervalRef.current) {
				clearInterval(flushIntervalRef.current);
				flushIntervalRef.current = null;
			}
			if (fileProgressFlushRef.current) {
				clearInterval(fileProgressFlushRef.current);
				fileProgressFlushRef.current = null;
			}
		};

		eventSource.onerror = (error) => {
			console.error("EventSource failed:", error);
			cleanupIntervals();
			setIsPending(false);
			setStreamComplete(true);
			eventSource.close();
			eventSourceRef.current = null;

			// Clear stream-related tabs when stream ends (even on error)
			clearStreamTabs();

			// Call the callback if provided, regardless of displayValue content
			if (onStreamComplete) {
				onStreamComplete(displayValueRef.current);
			}
		};

		eventSource.addEventListener("END", () => {
			cleanupIntervals();
			setIsPending(false);
			setStreamComplete(true);

			// Clear stream-related tabs (attachments, todos, file progress) when stream completes
			clearStreamTabs();

			// Call the callback if provided, regardless of displayValue content
			if (onStreamComplete) {
				onStreamComplete(displayValueRef.current);
			}

			eventSource.close();
			eventSourceRef.current = null;
		});

		// Clean up function
		return () => {
			cleanupIntervals();
			eventSource.close();
			eventSourceRef.current = null;
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [streamingKey, authToken, onStreamComplete, onThinkingChange, onThinkingContentChange, setTodoState, handleAttachmentEvent, initFileProgress, appendFileProgressDelta, endFileProgress, clearStreamTabs, flushTokens, flushFileDeltas]);

	// Render a single stream event inline indicator
	const renderStreamEvent = (event: StreamEvent, index: number) => {
		if (event.type === "file") {
			// Only "generating" status exists now - removed on completion
			const ext = getExtension(event.fileName);
			const config = getFileConfig(ext);
			return (
				<div className="my-1.5" key={`file-${event.fileName}-${index}`}>
					<button
						className={cn(
							"group inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer",
							"border shadow-sm hover:shadow-md active:scale-[0.98]",
							"bg-white border-gray-100 hover:border-gray-200",
						)}
						onClick={() => handleFileEventClick(event.fileName)}
						title={`Click to view progress for ${event.fileName}`}
						type="button"
					>
						<span className={cn(
							"flex items-center justify-center w-7 h-7 rounded-md overflow-hidden",
							config.bg, config.color,
						)}>
							<Loader2 className="h-4 w-4 animate-spin" />
						</span>
						<span className="truncate max-w-[180px] font-medium text-gray-800">
							{event.fileName}
						</span>
						{ext && (
							<span className={cn("text-[10px] font-semibold uppercase tracking-wide", config.color)}>
								{ext}
							</span>
						)}
					</button>
				</div>
			);
		}

		if (event.type === "attachment") {
			// Attachment - matches AttachmentViewer InlineAttachment exactly
			const ext = getExtension(event.name);
			const config = getFileConfig(ext);
			const isSandbox = event.fileType === "sandbox";
			return (
				<div className="my-1.5" key={`attach-${event.resourceId}-${index}`}>
					<button
						className={cn(
							"group inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer",
							"border shadow-sm hover:shadow-md active:scale-[0.98]",
							"bg-white border-gray-100 hover:border-gray-200",
						)}
						onClick={() => handleAttachmentClick(event)}
						title={`Click to open ${event.name}`}
						type="button"
					>
						<span className={cn(
							"flex items-center justify-center w-7 h-7 rounded-md transition-transform duration-200 group-hover:scale-105 overflow-hidden",
							config.bg, config.color,
						)}>
							<FileIconSvg className="h-4 w-4" iconKey={config.iconKey} />
						</span>
						<span className="truncate max-w-[180px] font-medium text-gray-800">
							{event.name}
						</span>
						{ext && (
							<span className={cn("text-[10px] font-semibold uppercase tracking-wide", config.color)}>
								{ext}
							</span>
						)}
						{isSandbox && (
							<Box className={cn("h-3.5 w-3.5", config.color)} />
						)}
						<ArrowUpRight className={cn(
							"h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
							config.color.replace("-600", "-400"),
						)} />
					</button>
				</div>
			);
		}

		if (event.type === "todo") {
			const todoState = todoStates?.[event.fileId];
			const tasks = todoState?.tasks || [];
			const currentIndex: number = typeof todoState?.current_index === "number" ? todoState.current_index : -1;
			const completedCount = tasks.filter((t: any) => t.status === "completed").length;
			const totalCount = tasks.length;
			const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

			// Find current task
			const currentTask = tasks.find((t: any, i: number) => i === currentIndex || t.status === "in_progress");

			return (
				<div className="my-1.5" key={`todo-${event.fileId}-${index}`}>
					<button
						className={cn(
							"group flex flex-col gap-2 w-full max-w-sm p-3 rounded-lg text-sm transition-all duration-200 cursor-pointer text-left",
							"border shadow-sm hover:shadow-md active:scale-[0.99]",
							"bg-white border-gray-100 hover:border-gray-200",
						)}
						onClick={() => handleTodoClick(event.fileId)}
						title="Click to view full task progress"
						type="button"
					>
						{/* Header */}
						<div className="flex items-center justify-between w-full">
							<span className="text-xs font-semibold text-gray-800">Task Progress</span>
							<span className="text-[10px] text-gray-400">
								{completedCount}/{totalCount}
							</span>
						</div>

						{/* Progress bar */}
						{totalCount > 0 && (
							<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
								<div
									className="h-full bg-indigo-500 rounded-full transition-all duration-500"
									style={{ width: `${progressPct}%` }}
								/>
							</div>
						)}

						{/* Task list preview (show up to 4 tasks) */}
						{tasks.length > 0 && (
							<div className="flex flex-col gap-1 w-full">
								{tasks.slice(0, 4).map((task: any, i: number) => {
									const isCompleted = task.status === "completed";
									const isCurrent = i === currentIndex || task.status === "in_progress";
									return (
										<div
											className="flex items-center gap-1.5"
											key={task.id || i}
										>
											{isCompleted ? (
												<CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
											) : isCurrent ? (
												<CircleDot className="h-3 w-3 text-indigo-500 animate-pulse flex-shrink-0" />
											) : (
												<Circle className="h-3 w-3 text-gray-300 flex-shrink-0" />
											)}
											<span className={cn(
												"text-xs truncate",
												isCompleted ? "text-gray-400 line-through" : isCurrent ? "text-gray-800 font-medium" : "text-gray-500",
											)}>
												{task.title || `Task ${i + 1}`}
											</span>
										</div>
									);
								})}
								{tasks.length > 4 && (
									<span className="text-[10px] text-gray-400 pl-4.5">
										+{tasks.length - 4} more
									</span>
								)}
							</div>
						)}

						{/* Loading state when no tasks yet */}
						{tasks.length === 0 && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
								<span className="text-xs text-gray-400">Waiting for tasks...</span>
							</div>
						)}
					</button>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="pb-4">
			{displayValue && (
				<MarkdownDisplay content={displayValue} />
			)}

			{/* Unified chronological stream events - newest at bottom */}
			{streamEvents.length > 0 && (
				<div className="flex flex-col gap-0 mt-2 px-2">
					{streamEvents.map((event, index) => renderStreamEvent(event, index))}
				</div>
			)}
		</div>
	);
};

export default StreamComponent;
