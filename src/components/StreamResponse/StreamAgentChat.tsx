import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import MarkdownDisplay from "../Markdown/MarkDownDisplay";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Loader2, ArrowUpRight, Box, CheckCircle2, Circle, CircleDot, Zap } from "lucide-react";
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
  | { type: "todo"; fileId: string; ts: number }
  | { type: "task"; toolName: string; message: string; ts: number };

// Helper to extract extension from filename
const getExtension = (fileName: string): string => {
	const lastDot = fileName.lastIndexOf(".");
	if (lastDot > 0 && lastDot < fileName.length - 1) {
		return fileName.slice(lastDot + 1);
	}
	return "";
};

// File content type categories for preview rendering
type FileContentType = "code" | "markdown" | "text" | "config" | "data";

// Map extension to Prism language for syntax highlighting
const EXT_TO_LANGUAGE: Record<string, string> = {
	js: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx",
	html: "html", htm: "html", css: "css", scss: "scss", sass: "sass", less: "less",
	py: "python", rb: "ruby", java: "java", kt: "kotlin", kts: "kotlin",
	swift: "swift", go: "go", rs: "rust", c: "c", cpp: "cpp", cc: "cpp", cxx: "cpp",
	h: "c", hpp: "cpp", cs: "csharp", php: "php", pl: "perl", r: "r", scala: "scala",
	sh: "bash", bash: "bash", zsh: "bash", fish: "bash", ps1: "powershell",
	bat: "batch", cmd: "batch",
	json: "json", yaml: "yaml", yml: "yaml", toml: "toml", xml: "xml", ini: "ini",
	sql: "sql", graphql: "graphql", gql: "graphql",
	dockerfile: "docker", makefile: "makefile", lua: "lua", diff: "diff", patch: "diff",
};

const CODE_EXTENSIONS = new Set([
	"js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "h", "hpp", "cs", "go", "rs",
	"rb", "php", "swift", "kt", "kts", "html", "htm", "css", "scss", "sass", "less",
	"sql", "sh", "bash", "zsh", "lua", "scala", "r", "pl", "diff", "patch",
	"dockerfile", "makefile",
]);

const CONFIG_EXTENSIONS = new Set([
	"json", "jsonl", "toml", "ini", "env", "config", "yaml", "yml", "xml",
	"template", "database", "graphql", "gql",
]);

const MARKDOWN_EXTENSIONS = new Set(["md", "mdx", "markdown"]);

const TEXT_EXTENSIONS = new Set(["txt", "text", "log", "rtf"]);

const DATA_EXTENSIONS = new Set(["csv", "tsv"]);

const getFileContentType = (ext: string): FileContentType => {
	const e = ext.toLowerCase();
	if (CODE_EXTENSIONS.has(e)) return "code";
	if (CONFIG_EXTENSIONS.has(e)) return "config";
	if (MARKDOWN_EXTENSIONS.has(e)) return "markdown";
	if (DATA_EXTENSIONS.has(e)) return "data";
	if (TEXT_EXTENSIONS.has(e)) return "text";
	// Fallback: if we have a Prism language for it, treat as code
	if (EXT_TO_LANGUAGE[e]) return "code";
	return "text";
};

const getPrismLanguage = (ext: string): string =>
	EXT_TO_LANGUAGE[ext.toLowerCase()] || "text";

// Compact preview styles for SyntaxHighlighter in the streaming card
const compactCodeStyle: React.CSSProperties = {
	margin: 0,
	padding: "8px 10px",
	fontSize: "11px",
	lineHeight: "16px",
	borderRadius: "6px",
	background: "#fafafa",
	border: "1px solid #f0f0f0",
	overflow: "hidden",
};

// Throttle a rapidly changing value so downstream renderers only update at most once per interval
function useThrottledValue<T>(value: T, intervalMs: number): T {
	const [throttled, setThrottled] = useState(value);
	const lastUpdateRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latestRef = useRef(value);
	latestRef.current = value;

	useEffect(() => {
		const now = Date.now();
		const elapsed = now - lastUpdateRef.current;

		if (elapsed >= intervalMs) {
			lastUpdateRef.current = now;
			setThrottled(value);
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		} else if (!timerRef.current) {
			timerRef.current = setTimeout(() => {
				lastUpdateRef.current = Date.now();
				setThrottled(latestRef.current);
				timerRef.current = null;
			}, intervalMs - elapsed);
		}
	}, [value, intervalMs]);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	return throttled;
}

const PREVIEW_THROTTLE_MS = 300;

// Component that renders file content with an appropriate viewer based on file type
const FileContentPreview: React.FC<{ content: string; fileName: string; maxLines?: number }> = React.memo(
	({ content, fileName, maxLines = 4 }) => {
		const ext = getExtension(fileName);
		const contentType = getFileContentType(ext);

		// Throttle content updates to avoid expensive re-renders during streaming
		const throttledContent = useThrottledValue(content, PREVIEW_THROTTLE_MS);

		// Extract last N non-empty lines for preview
		const previewContent = useMemo(() => {
			const tail = throttledContent.length > 4000 ? throttledContent.slice(-4000) : throttledContent;
			const lines = tail.split("\n").filter((l: string) => l.trim());
			return lines.slice(-maxLines).join("\n");
		}, [throttledContent, maxLines]);

		if (!previewContent) return null;

		if (contentType === "markdown") {
			return (
				<div className="w-full bg-gray-50 rounded-md px-2.5 py-2 overflow-hidden border border-gray-100">
					<div className="stream-md-preview text-[11px] leading-4 line-clamp-4">
						<style>{`
							.stream-md-preview,
							.stream-md-preview * {
								font-size: 11px !important;
								line-height: 16px !important;
								color: #6b7280 !important;
							}
							.stream-md-preview h1,
							.stream-md-preview h2,
							.stream-md-preview h3 {
								font-size: 12px !important;
								font-weight: 600 !important;
								margin: 2px 0 !important;
								color: #374151 !important;
							}
							.stream-md-preview p { margin: 1px 0 !important; }
							.stream-md-preview pre,
							.stream-md-preview code {
								font-size: 10px !important;
								background: #f3f4f6 !important;
								padding: 1px 3px !important;
								border-radius: 3px !important;
							}
							.stream-md-preview ul,
							.stream-md-preview ol {
								margin: 1px 0 !important;
								padding-left: 14px !important;
							}
						`}</style>
						<MarkdownDisplay content={previewContent} />
					</div>
				</div>
			);
		}

		if (contentType === "code" || contentType === "config") {
			const language = getPrismLanguage(ext);
			return (
				<div className="w-full overflow-hidden rounded-md line-clamp-4">
					<SyntaxHighlighter
						customStyle={compactCodeStyle}
						language={language}
						style={oneLight}
						wrapLines
						wrapLongLines
					>
						{previewContent}
					</SyntaxHighlighter>
				</div>
			);
		}

		if (contentType === "data") {
			// CSV / TSV - render as a mini table-like monospace preview
			return (
				<div className="w-full bg-gray-50 rounded-md px-2.5 py-2 overflow-hidden border border-gray-100">
					<pre className="text-[11px] leading-4 text-gray-500 font-mono whitespace-pre-wrap break-words line-clamp-4">
						{previewContent}
					</pre>
				</div>
			);
		}

		// Default: plain text
		return (
			<div className="w-full bg-gray-50 rounded-md px-2.5 py-2 overflow-hidden border border-gray-100">
				<pre className="text-[11px] leading-4 text-gray-600 font-mono whitespace-pre-wrap break-words line-clamp-4">
					{previewContent}
				</pre>
			</div>
		);
	}
);
FileContentPreview.displayName = "FileContentPreview";

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

	const { setSidePanel, setCollapsed, setTodoState, todoStates, fileProgress, initFileProgress, appendFileProgressDelta, endFileProgress, clearStreamTabs } = useChatStore() as any;

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

				// Check if this is an ACTIVE_PROGRESS event that came through as regular message data
				if (event.data.includes("event: ACTIVE_PROGRESS")) {
					const dataPart = event.data.split("data: ")[1];
					if (dataPart) {
						try {
							const data = JSON.parse(dataPart.trim());
							if (data.type === "file_progress" && data.payload) {
								const { action, file_name: fileName } = data.payload;
								if (fileName && action) {
									initFileProgress(fileName, action);
									setStreamEvents((prev) => {
										if (prev.some((e) => e.type === "file" && e.fileName === fileName)) return prev;
										return [...prev, { type: "file" as const, fileName, action, status: "generating" as const, ts: Date.now() }];
									});
								}
							} else if (data.type === "task_progress") {
								const toolName = data.tool_name || "unknown";
								const message = data.message || "";
								setStreamEvents((prev) => {
									const withoutOldTask = prev.filter((e) => e.type !== "task");
									return [...withoutOldTask, { type: "task" as const, toolName, message, ts: Date.now() }];
								});
							}
						} catch (e) {
							console.error("Error parsing ACTIVE_PROGRESS data:", e);
						}
					}
					return;
				}

				// Clear thinking state when regular data comes in
				setIsThinking(false);

				// Clear any active task progress events when text tokens arrive
				// (agent has moved past the tool execution)
				setStreamEvents((prev) => {
					if (prev.some((e) => e.type === "task")) {
						return prev.filter((e) => e.type !== "task");
					}
					return prev;
				});

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

		// Handle ACTIVE_PROGRESS events - catch-up mechanism for reconnects
		// Sent as the first event when the agent is mid-file-write or mid-tool-execution
		eventSource.addEventListener("ACTIVE_PROGRESS", (event) => {
			if (!event.data) return;
			try {
				const data = JSON.parse(event.data);

				if (data.type === "file_progress" && data.payload) {
					const { action, file_name: fileName } = data.payload;
					if (fileName && action) {
						initFileProgress(fileName, action);
						// Add file stream event (same as FILE_PROGRESS started), with dedup
						setStreamEvents((prev) => {
							if (prev.some((e) => e.type === "file" && e.fileName === fileName)) return prev;
							return [...prev, { type: "file" as const, fileName, action, status: "generating" as const, ts: Date.now() }];
						});
					}
				} else if (data.type === "task_progress") {
					const toolName = data.tool_name || "unknown";
					const message = data.message || "";
					// Replace any existing task event (backend overwrites Redis key per tool)
					setStreamEvents((prev) => {
						const withoutOldTask = prev.filter((e) => e.type !== "task");
						return [...withoutOldTask, { type: "task" as const, toolName, message, ts: Date.now() }];
					});
				}
			} catch (e) {
				console.error("Error parsing ACTIVE_PROGRESS:", e);
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
			// Live file writing preview
			const ext = getExtension(event.fileName);
			const config = getFileConfig(ext);
			const fp = fileProgress?.[event.fileName];
			const content = fp?.content || "";
			const charCount = content.length;

			return (
				<div className="my-1.5" key={`file-${event.fileName}-${index}`}>
					<button
						className={cn(
							"group flex flex-col gap-2 w-full max-w-md p-3 rounded-lg text-sm transition-all duration-200 cursor-pointer text-left",
							"border shadow-sm hover:shadow-md active:scale-[0.99]",
							"bg-white border-gray-100 hover:border-gray-200",
						)}
						onClick={() => handleFileEventClick(event.fileName)}
						title={`Click to view full file progress`}
						type="button"
					>
						{/* Header with file info */}
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center gap-2">
								<span className={cn(
									"flex items-center justify-center w-6 h-6 rounded-md overflow-hidden",
									config.bg, config.color,
								)}>
									<FileIconSvg className="h-3.5 w-3.5" iconKey={config.iconKey} />
								</span>
								<span className="font-medium text-gray-800 text-xs">
									{event.fileName}
								</span>
								{ext && (
									<span className={cn("text-[10px] font-semibold uppercase tracking-wide", config.color)}>
										{ext}
									</span>
								)}
							</div>
							<div className="flex items-center gap-1.5">
								<span className="text-[10px] text-gray-400">
									{charCount} chars
								</span>
								<Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
							</div>
						</div>

						{/* Content preview - rendered with appropriate viewer per file type */}
						{charCount > 0 ? (
							<FileContentPreview content={content} fileName={event.fileName} />
						) : (
							<div className="flex items-center gap-2">
								<Loader2 className="h-3 w-3 animate-spin text-gray-300" />
								<span className="text-xs text-gray-400">Writing file...</span>
							</div>
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
						<span className="truncate max-w-[280px] font-medium text-gray-800">
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
							"group flex flex-col gap-2 w-full max-w-md p-3 rounded-lg text-sm transition-all duration-200 cursor-pointer text-left",
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

		if (event.type === "task") {
			return (
				<div className="my-1.5" key={`task-${event.toolName}-${index}`}>
					<div
						className={cn(
							"flex items-center gap-2.5 w-full max-w-md px-3 py-2.5 rounded-lg text-sm",
							"border shadow-sm",
							"bg-white border-gray-100",
						)}
					>
						<span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-50 text-amber-500">
							<Zap className="h-3.5 w-3.5" />
						</span>
						<div className="flex flex-col gap-0.5 min-w-0 flex-1">
							<span className="font-medium text-gray-800 text-xs truncate">
								{event.toolName}
							</span>
							{event.message && (
								<span className="text-[11px] text-gray-400 truncate">
									{event.message}
								</span>
							)}
						</div>
						<Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 flex-shrink-0" />
					</div>
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
