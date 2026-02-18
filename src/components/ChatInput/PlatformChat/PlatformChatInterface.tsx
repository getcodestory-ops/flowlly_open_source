import React, {
	useRef,
	useEffect,
	useLayoutEffect,
	createRef,
	useState,
} from "react";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	CornerDownLeft,
	Paperclip,
	Bird,
	FolderOpen,
	StopCircle,
} from "lucide-react";
import LayoutModeToggle from "./components/LayoutModeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlatformChat } from "./usePlatformChat";
import { useToast } from "@/components/ui/use-toast";
import { usePasteUpload } from "@/hooks/usePasteUpload";
import { useDragDropUpload } from "@/hooks/useDragDropUpload";
import { FileUploadProgress } from "@/components/Folder/FilesTable/FileUploadProgress";
import { FileUploadStatus as FolderFileUploadStatus } from "@/components/Folder/FilesTable/types";
import { FileUploadStatus } from "./PlatformChatInterface/types";
import { Upload } from "lucide-react";
// Removed Badge, File, X imports since we no longer render separate file attachments
import clsx from "clsx";
import AtSelectorComponent from "./components/AtSelectorComponent";
import { useChatStore } from "@/hooks/useChatStore";
import { useViewStore } from "@/utils/store";
import EmptyChatInterface from "./PlatformChatInterface/components/EmptyChatInterface/EmptyChatInterface";
import { requestHelp, stopAgent } from "@/api/agentRoutes";
import ModelSelector from "./components/ModelSelector";
import AgentTypeSelector from "./components/AgentTypeSelector";
import { MODELS } from "./PlatformChatInterface/types";
import ChatResponseFeedback from "./PlatformChatInterface/ChatResponseFeedback";

export default function PlatformChatInterface({
	chatTarget,
	folderId,
	includeContext,
}: {
  folderId: string;
  chatTarget: string;
  onContentUpdate?: (newContent: string) => void;
  includeContext: boolean;
}): React.ReactNode {
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const emptyTextareaRef = useRef<HTMLTextAreaElement>(null);
	const { toast } = useToast();
	
	// File upload state for pasted images
	const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
	const [showUploadProgress, setShowUploadProgress] = useState(false);

	const {
		chats,
		isPending,
		activeProject,
		handleChatSubmit,
		setChatInput,
		chatInput,
		getCombinedMessage,
		session,
		isWaitingForResponse,
		activeChatEntity,
		setIsWaitingForResponse,
	} = usePlatformChat(folderId, chatTarget, includeContext);
	const { setSidePanel, setCollapsed, contextFolder, selectedContexts, setSelectedContexts, clearChatAttachments } = useChatStore();
	const { preferredModel, setPreferredModel, preferredAgentType, setPreferredAgentType, autoTier, setAutoTier } = useViewStore();
	const isAgentTypeLocked = !!activeChatEntity?.metadata?.agent_type;
	
	// Track previous chat entity ID to only clear attachments on actual chat change
	const prevChatEntityIdRef = useRef<string | null | undefined>(undefined);
	
	// Clear chat attachments only when active chat actually changes (not on mount/remount)
	useEffect(() => {
		const currentId = activeChatEntity?.id;
		const prevId = prevChatEntityIdRef.current;
		
		// Only clear if we had a previous value and it's different
		// This prevents clearing on initial mount or mode switch remount
		if (prevId !== undefined && prevId !== currentId) {
			clearChatAttachments();
		}
		
		prevChatEntityIdRef.current = currentId;
	}, [activeChatEntity?.id, clearChatAttachments]);
	
	// Model change handler - directly updates the persisted store
	const handleModelChange = (model: string) => {
		setPreferredModel(model);
	};
	

	
	// Common upload callbacks - shared between paste and drag/drop
	const uploadCallbacks = {
		onUploadStart: (file: File) => {
			const fileStatus: FileUploadStatus = {
				file,
				status: "uploading",
				progress: 0,
			};
			setUploadingFiles((prev) => [...prev, fileStatus]);
			setShowUploadProgress(true);
		},
		onUploadProgress: (progress: number) => {
			setUploadingFiles((prev) =>
				prev.map((item) => 
					item.status === "uploading" ? { ...item, progress } : item
				),
			);
		},
		onProcessingStart: () => {
			// Update status to processing when async processing starts
			setUploadingFiles((prev) =>
				prev.map((item) => 
					item.status === "uploading" ? { 
						...item, 
						status: "processing" as const, 
						progress: 100,
					} : item
				),
			);
		},
		onUploadComplete: (_result: unknown, processedFile: { type: string; resource_id: string; resource_url: string; resource_name: string; extension: string }) => {
			setUploadingFiles((prev) =>
				prev.map((item) => 
					item.status === "processing" || item.status === "uploading" ? { 
						...item, 
						status: "success" as const, 
						progress: 100,
						result: processedFile,
					} : item
				),
			);
			
			// Add to selectedContexts for consistency with document selector
			const chatEntityId = activeChatEntity?.id || "untitled";
			const currentContexts = selectedContexts[chatEntityId] || [];
			const newContext = {
				id: processedFile.resource_id,
				name: processedFile.resource_name,
				extension: processedFile.extension,
			};
			
			if (!currentContexts.some((ctx) => ctx.id === processedFile.resource_id)) {
				setSelectedContexts(chatEntityId, [...currentContexts, newContext]);
			}
		},
		onUploadError: (error: string) => {
			setUploadingFiles((prev) =>
				prev.map((item) => 
					item.status === "uploading" || item.status === "processing" 
						? { ...item, status: "error" as const, error } 
						: item
				),
			);
		},
	};

	// Paste upload functionality
	const { handlePasteEvent } = usePasteUpload({
		session,
		activeProject,
		...uploadCallbacks,
	});

	// Drag and drop upload functionality
	const { isDragging, dragHandlers } = useDragDropUpload({
		session,
		activeProject,
		...uploadCallbacks,
	});
	
	// Close upload progress modal
	const closeUploadProgress = (): void => {
		const allProcessed = uploadingFiles.every(
			(file) => file.status === "success" || file.status === "error",
		);
		if (allProcessed) {
			setShowUploadProgress(false);
			// Don't clear files here - let them be cleared after chat submission
		}
	};
	
	// Auto-close upload progress modal after all files are processed
	useEffect(() => {
		if (!showUploadProgress || uploadingFiles.length === 0) return;
		
		const allProcessed = uploadingFiles.every(
			(file) => file.status === "success" || file.status === "error",
		);
		
		if (allProcessed) {
			// Auto-close after a short delay to let user see the success state
			const timer = setTimeout(() => {
				setShowUploadProgress(false);
			}, 1500);
			
			return () => clearTimeout(timer);
		}
	}, [uploadingFiles, showUploadProgress]);
	
	// Note: We no longer need separate file attachment display since pasted files
	// are now integrated with selectedContexts and will appear in the standard
	// attachment system used by the document selector
	
	// Check if current chat has an active streaming message
	const getActiveStreamingKey = (): string | null => {
		if (!chats || chats.length === 0) return null;
		
		// Look for the most recent streaming message
		for (let i = chats.length - 1; i >= 0; i--) {
			const chat = chats[i];
			if (typeof chat.message === "object" && 
				chat.message.type === "stream" && 
				chat.message.streaming_key) {
				return chat.message.streaming_key;
			}
		}
		return null;
	};
	
	const activeStreamingKey = getActiveStreamingKey();
	const [isStopping, setIsStopping] = React.useState(false);
	
	const handleStopAgent = async(): Promise<void> => {
		if (!session || !activeStreamingKey || isStopping) return;
		
		setIsStopping(true);
		try {
			const response = await stopAgent({
				session,
				streamingId: activeStreamingKey,
			});
			
			toast({
				title: "Stopping agent gracefully!",
				description: response.message || "Stop signal sent to agent",
			});
		} catch (error) {
			console.error("Error stopping agent:", error);
			toast({
				title: "Error",
				description: "Failed to send stop signal. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsStopping(false);
		}
	};

	const scrollToBottom = (): void => {
		if (chatContainerRef.current) {
			const scrollContainer = chatContainerRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	};

	// Smart scroll behavior: different behavior for streaming vs loaded chat
	useLayoutEffect(() => {
		const isCurrentlyStreaming = !!activeStreamingKey;
		const wasStreaming = wasStreamingRef.current;
		const justFinishedStreaming = wasStreaming && !isCurrentlyStreaming;
		
		if (isCurrentlyStreaming) {
			// During streaming: keep user message at top, stream follows below
			scrollToLastUserMessage();
		} else if (!justFinishedStreaming) {
			// Fresh chat load (not coming from streaming): show bottom of last message at viewport bottom
			scrollToBottomOfLastMessage();
		}
		// If justFinishedStreaming: streaming just ended - maintain scroll position
		// Don't scroll so user doesn't lose their reading position
	}, [chats, activeStreamingKey]);

	// Handle scroll when streaming state changes
	useEffect(() => {
		const isCurrentlyStreaming = !!activeStreamingKey;
		
		// When streaming ends, reset user scroll tracking for next streaming session
		// DON'T scroll - maintain the user's current reading position
		if (wasStreamingRef.current && !isCurrentlyStreaming) {
			userHasScrolledRef.current = false;
		}
		
		// Always update the streaming state ref
		wasStreamingRef.current = isCurrentlyStreaming;
	}, [activeStreamingKey]);
	
	// Detect user scroll during streaming to stop auto-scrolling
	useEffect(() => {
		if (!activeStreamingKey || !chatContainerRef.current) return;
		
		const scrollContainer = chatContainerRef.current.querySelector(
			"[data-radix-scroll-area-viewport]",
		);
		if (!scrollContainer) return;
		
		// Reset the flag when streaming starts
		userHasScrolledRef.current = false;
		
		const handleUserScroll = () => {
			// Mark that user has scrolled manually
			userHasScrolledRef.current = true;
		};
		
		scrollContainer.addEventListener("wheel", handleUserScroll);
		scrollContainer.addEventListener("touchmove", handleUserScroll);
		
		return () => {
			scrollContainer.removeEventListener("wheel", handleUserScroll);
			scrollContainer.removeEventListener("touchmove", handleUserScroll);
		};
	}, [activeStreamingKey]);
	

	useEffect(() => {
		const handlePaste = (event: ClipboardEvent): void => {
			handlePasteEvent(event);
		};
		

		const regularTextarea = textareaRef.current;
		if (regularTextarea) {
			regularTextarea.addEventListener("paste", handlePaste);
		}
		

		const emptyTextarea = emptyTextareaRef.current;
		if (emptyTextarea) {
			emptyTextarea.addEventListener("paste", handlePaste);
		}
		
		return () => {
			if (regularTextarea) {
				regularTextarea.removeEventListener("paste", handlePaste);
			}
			if (emptyTextarea) {
				emptyTextarea.removeEventListener("paste", handlePaste);
			}
		};
	}, [handlePasteEvent, chats]); // Add chats as dependency to re-run when chats change


	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 400);
			textarea.style.height = `${newHeight}px`;
		}
	}, [chatInput]);

	const handleSubmit = (): void => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "No session or active project",
				variant: "destructive",
			});
			return;
		}

		const combinedMessage = getCombinedMessage();
		
		handleChatSubmit({
			message: combinedMessage,
			files: [], 
		});
		

		setUploadingFiles([]);
		setShowUploadProgress(false);
	};


	const loadDocumentPanel = (): React.ReactNode => (
		<>
			<div className="flex gap-2">
			    
				<Button
					className={clsx(
						"text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors rounded-full p-2",
						contextFolder.name && "text-indigo-500 bg-indigo-50/50",
					)}
					disabled={false}
					onClick={() => {
						setCollapsed(true);
						setSidePanel({
							isOpen: true,
							type: "folder",
							resourceId:  folderId,
							title : "Drive"
						});
					}}
					size="sm"
					title={contextFolder.id ? `Using context: ${contextFolder.name}` : "Add context "}
					type="button"
					variant="ghost"
				>
					<Paperclip className="h-4 w-4" />
				</Button>		
			</div>
		</>
	);


	// Create a map of refs for message content elements
	const messageRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement | null>;
  }>({});
	
	// Ref to track the last user message element for smart scrolling
	const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
	
	// Ref to track the last message element (for scrolling to bottom of conversation)
	const lastMessageRef = useRef<HTMLDivElement | null>(null);
	
	// Track if we were previously streaming (to detect when streaming ends)
	const wasStreamingRef = useRef<boolean>(false);
	
	// Track if user has manually scrolled away during streaming
	const userHasScrolledRef = useRef<boolean>(false);

	// Ensure refs are created for each message
	useEffect(() => {
		if (chats && chats.length > 0) {
			chats.forEach((chat, index) => {
				if (!messageRefs.current[index]) {
					messageRefs.current[index] = createRef<HTMLDivElement>();
				}
			});
		}
	}, [chats]);
	
	// Find the index of the last user message
	const getLastUserMessageIndex = (): number => {
		if (!chats || chats.length === 0) return -1;
		for (let i = chats.length - 1; i >= 0; i--) {
			if (chats[i].sender.toLowerCase() === "user") {
				return i;
			}
		}
		return -1;
	};
	
	// Find the index of the last visible message (for scroll to bottom behavior)
	const getLastVisibleMessageIndex = (): number => {
		if (!chats || chats.length === 0) return -1;
		for (let i = chats.length - 1; i >= 0; i--) {
			const message = chats[i].message;
			const isVisible = typeof message === "string" || 
				!["run_workflow", "send_data_to_workflow", "continue_conversation", "start_new_conversation"].includes(message?.function_call?.name || "");
			if (isVisible) {
				return i;
			}
		}
		return -1;
	};
	
	// Scroll to position the last user message at the top of the viewport
	const scrollToLastUserMessage = (): void => {
		if (lastUserMessageRef.current && chatContainerRef.current) {
			const scrollContainer = chatContainerRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				// Get the position of the last user message relative to the scroll container
				const messageRect = lastUserMessageRef.current.getBoundingClientRect();
				const containerRect = scrollContainer.getBoundingClientRect();

				// Keep short messages top-aligned, but for long messages align only the
				// tail (last few lines) near the top so most viewport stays for streaming.
				const topOffset = 16;
				const viewportHeight = containerRect.height;
				const desiredTailHeight = Math.max(96, Math.min(180, viewportHeight * 0.24));
				const messageHeight = messageRect.height;

				let targetScroll: number;
				if (messageHeight <= desiredTailHeight + topOffset) {
					targetScroll =
						scrollContainer.scrollTop + (messageRect.top - containerRect.top) - topOffset;
				} else {
					const tailAnchorY = messageRect.bottom - desiredTailHeight;
					targetScroll =
						scrollContainer.scrollTop + (tailAnchorY - containerRect.top) - topOffset;
				}
				
				scrollContainer.scrollTo({
					top: Math.max(0, targetScroll),
					behavior: "smooth",
				});
			}
		}
	};
	
	// Scroll to show the bottom of the last message at the bottom of the viewport
	const scrollToBottomOfLastMessage = (): void => {
		if (lastMessageRef.current && chatContainerRef.current) {
			const scrollContainer = chatContainerRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				// Get the position of the last message relative to the scroll container
				const messageRect = lastMessageRef.current.getBoundingClientRect();
				const containerRect = scrollContainer.getBoundingClientRect();
				
				// Calculate scroll position to put the bottom of the message at the bottom of viewport
				// with a small offset for visual breathing room
				const offset = 24; // 24px from the bottom
				const targetScroll = scrollContainer.scrollTop + (messageRect.bottom - containerRect.bottom) + offset;
				
				scrollContainer.scrollTo({
					top: Math.max(0, targetScroll),
					behavior: "smooth",
				});
			}
		}
	};



	// Helper function to determine if we should show "Flowlly" label
	const shouldShowFlowllyLabel = (currentIndex: number): boolean => {
		const currentMessage = chats[currentIndex];
		
		// Only show for non-user messages
		if (currentMessage.sender.toLowerCase() === "user") {
			return false;
		}
		
		// Check if this message will be rendered (not filtered out)
		const isCurrentMessageVisible = typeof currentMessage.message === "string" || 
			!["run_workflow", "send_data_to_workflow", "continue_conversation", "start_new_conversation"].includes(currentMessage.message?.function_call?.name || "");
		
		if (!isCurrentMessageVisible) {
			return false;
		}
		
		// Show if it's the first message
		if (currentIndex === 0) {
			return true;
		}
		
		// Show if the previous message was from user
		if (chats[currentIndex - 1].sender.toLowerCase() === "user") {
			return true;
		}
		
		// Show if this is the first visible non-user message in a sequence of non-user messages
		// Look backwards to find if there's any visible non-user message before this one in the current turn
		for (let i = currentIndex - 1; i >= 0; i--) {
			const prevMessage = chats[i];
			
			// If we hit a user message, this is the start of a new turn
			if (prevMessage.sender.toLowerCase() === "user") {
				return true;
			}
			
			// If we find a visible non-user message, don't show label
			const isPrevMessageVisible = typeof prevMessage.message === "string" || 
				!["run_workflow", "send_data_to_workflow", "continue_conversation", "start_new_conversation"].includes(prevMessage.message?.function_call?.name || "");
			
			if (isPrevMessageVisible) {
				return false;
			}
		}
		
		// If we reach here, this is the first visible message in the conversation
		return true;
	};

	// Update the regular chat input section
	const renderChatInput = (): React.ReactNode => (
		<div className="flex flex-col justify-end">
			<div className="relative overflow-hidden rounded-t-2xl  border-t border-l border-r border-gray bg-background shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
				<Label className="sr-only" htmlFor="message">
					Message
				</Label>
				{/* Display selected model and context settings */}
				<div className="absolute bottom-0 right-24 z-10">
					<div className="flex items-center gap-2 py-1">
						{contextFolder.name && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<FolderOpen className="h-3 w-3" />
											<span className="font-bold">{contextFolder.name}</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>New chat generated files will be saved in this folder</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
				</div>
				<div className="absolute top-2 left-4 z-10">
					<AtSelectorComponent />
				</div>
				<Textarea
					className="min-h-10 resize-none border-0 p-4 pb-4 mt-4 shadow-none focus-visible:ring-0"
					disabled={isPending}
					id="message"
					onChange={(e) => setChatInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							if (chatInput.trim() && !isPending) {
								handleSubmit();
							}
						}
					}}
					placeholder={
						activeStreamingKey 
							? "Type message to add to agent queue..." 
							: "Type message here, paste images, or attach relevant files using the clip icon below..."
					}
					ref={textareaRef}
					style={{ height: "auto" }}
					value={chatInput}
				/>
				<div className="flex items-center justify-between p-2 pt-0">
					<div className="flex items-center gap-2">
						{loadDocumentPanel()}
						<AgentTypeSelector 
							onAgentTypeChange={setPreferredAgentType}
							selectedAgentType={preferredAgentType}
							isLocked={isAgentTypeLocked}
						/>
						<ModelSelector 
							autoTier={autoTier}
							onTierChange={setAutoTier}
							onModelChange={handleModelChange}
							selectedModel={preferredModel}
							selectedAgentType={preferredAgentType}
						/>
						<LayoutModeToggle />
					</div>
					<Button
						className={`gap-1.5 transition-colors mr-2 ${
							activeStreamingKey && !chatInput.trim()
								? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
								: "bg-indigo-500 hover:bg-indigo-600 text-white"
						}`}
						disabled={
							(!chatInput.trim() && !activeStreamingKey) ||
							isStopping
						}
						onClick={
							activeStreamingKey && !chatInput.trim() 
								? handleStopAgent 
								: handleSubmit
						}
						size="sm"
						type="submit"
					>
						{activeStreamingKey && !chatInput.trim() ? (
							<>
								<StopCircle className="h-3.5 w-3.5" />
								{isStopping ? "Stopping..." : "Stop"}
							</>
						) : (
							<>
								Send
								<CornerDownLeft className="h-3.5 w-3.5" />
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);

	return (
		<div 
			className="flex flex-col h-full max-w-4xl mx-auto relative"
			{...dragHandlers}
		>
			{/* Drag and drop overlay */}
			{isDragging && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-50/90 border-2 border-dashed border-indigo-400 rounded-xl backdrop-blur-sm">
					<div className="flex flex-col items-center gap-3 text-indigo-600">
						<Upload className="h-12 w-12 animate-bounce" />
						<span className="text-lg font-medium">Drop files here to attach</span>
						<span className="text-sm text-indigo-500">
							Supports images, PDFs, documents, audio, and more
						</span>
					</div>
				</div>
			)}
			{chats && chats.length > 0 ? (
			// Regular chat view when there are messages
				<ScrollArea
					className="flex-grow px-1 sm:px-3 pb-4"
					ref={chatContainerRef}
					scrollbarClassName="!fixed !right-0 !top-0 !h-screen"
				>
					<div className="pt-2">
						
						{chats.map((history, index) => {
						const isUserMessage = history.sender.toLowerCase() === "user";
						const isLastUserMessage = isUserMessage && index === getLastUserMessageIndex();
						const isLastVisibleMessage = index === getLastVisibleMessageIndex();
						
						return (
							<div className="flex flex-col gap-2" key={index}>
								{  (typeof history.message === "string" ||  !["run_workflow", "send_data_to_workflow", "continue_conversation", "start_new_conversation"].includes(history.message.function_call?.name || "")) && (
									<div
										className={`${
											isUserMessage
												? "flex justify-end mb-4"
												: "block w-full"
										}`}
										ref={(el) => {
											if (isLastUserMessage) lastUserMessageRef.current = el;
											if (isLastVisibleMessage) lastMessageRef.current = el;
										}}
									>
										<div
											className={`${
												isUserMessage
													? "max-w-3xl bg-gray-50 border border-gray-100 rounded-xl p-2 shadow-sm mx-2"
													: "w-full bg-white py-3 px-2 border-b border-slate-100 last:border-b-0 min-h-[40px] transition-all duration-200"
											}`}
										>
											{shouldShowFlowllyLabel(index) && !(typeof history.message === "object" && history.message?.type === "stream") && (
												<div className="flex text-xs text-slate-400 mb-1 pl-1">
													Flowlly
												</div>
											)}
											<div
												ref={messageRefs.current[index] || null}
											>
												{history.message && (
													<AgentMessageInteractiveView id={history.id}
														isUserMessage={isUserMessage}
														message={history.message}
														setIsWaitingForResponse={setIsWaitingForResponse}
													/>
												)}
											</div>
											{/* Improve the copy button UI and add proper spacing */}

											{/* {history.sender.toLowerCase() !== "user" &&  (
												<div className="mt-1 flex justify-start items-center">
													<Button
														className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 p-1 h-auto rounded-md opacity-60 hover:opacity-100 transition-opacity"
														onClick={() => copyFormattedContent(index)}
														size="sm"
														variant="ghost"
													>
														<Copy className="w-3 h-3" />
														<span>Copy</span>
													</Button>
												</div>
											)} */}
										</div>
									</div>
								)}
							</div>
						);
					})}
					{/* Spacer to allow scrolling last user message to top */}
					<ChatResponseFeedback isStreaming={isWaitingForResponse} />
					<div className="min-h-[60vh]" />
					</div>
						

				</ScrollArea>
			) : (
				<div className="flex flex-col items-center justify-center h-full">
					<EmptyChatInterface
						chatInput={chatInput}
						handleSubmit={handleSubmit}
						isPending={isPending}
						isWaitingForResponse={isWaitingForResponse}
						loadDocumentPanel={loadDocumentPanel}
						setChatInput={setChatInput}
						textareaRef={emptyTextareaRef}
						isDragging={isDragging}
					/>
				</div>
			)}
			{/* Only show this input area when there are chats */}
			{chats && chats.length > 0 && (
				<div className="sticky bottom-0 px-4 pt-3 bg-white">
					{activeProject && renderChatInput()}
				</div>
			)}
			{/* File upload progress modal for pasted images */}
			{showUploadProgress && uploadingFiles.length > 0 && (
				<FileUploadProgress
					files={uploadingFiles as FolderFileUploadStatus[]}
					onClose={closeUploadProgress}
				/>
			)}
		</div>
	);
}
