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
	StopCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlatformChat } from "./usePlatformChat";
import { useToast } from "@/components/ui/use-toast";
import { usePasteUpload } from "@/hooks/usePasteUpload";
import { FileUploadProgress } from "@/components/Folder/FilesTable/FileUploadProgress";
import { FileUploadStatus as FolderFileUploadStatus } from "@/components/Folder/FilesTable/types";
import { FileUploadStatus } from "./PlatformChatInterface/types";
// Removed Badge, File, X imports since we no longer render separate file attachments
import clsx from "clsx";
import AtSelectorComponent from "./components/AtSelectorComponent";
import { useChatStore } from "@/hooks/useChatStore";
import EmptyChatInterface from "./PlatformChatInterface/components/EmptyChatInterface/EmptyChatInterface";
import { requestHelp, stopAgent } from "@/api/agentRoutes";
import ModelSelector from "./components/ModelSelector";
import AgentTypeSelector from "./components/AgentTypeSelector";


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
	const { setSidePanel, setCollapsed, contextFolder, selectedModel, setSelectedModel, selectedAgentType, setSelectedAgentType, selectedContexts, setSelectedContexts } = useChatStore();
	
	// Paste upload functionality
	const { handlePasteEvent } = usePasteUpload({
		session,
		activeProject,
		onUploadStart: (file) => {
			const fileStatus: FileUploadStatus = {
				file,
				status: "uploading",
				progress: 0,
			};
			setUploadingFiles([fileStatus]);
			setShowUploadProgress(true);
		},
		onUploadProgress: (progress) => {
			setUploadingFiles((prev) =>
				prev.map((item) => ({ ...item, progress })),
			);
		},
		onProcessingStart: () => {
			// Update status to processing when async processing starts
			setUploadingFiles((prev) =>
				prev.map((item) => ({ 
					...item, 
					status: "processing", 
					progress: 100,
				})),
			);
		},
		onUploadComplete: (_result, processedFile) => {
			setUploadingFiles((prev) =>
				prev.map((item) => ({ 
					...item, 
					status: "success", 
					progress: 100,
					result: processedFile,
				})),
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
		onUploadError: (error) => {
			setUploadingFiles((prev) =>
				prev.map((item) => ({ ...item, status: "error", error })),
			);
		},
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

	useLayoutEffect(() => {
		scrollToBottom();
		const timer = setTimeout(scrollToBottom, 500);
		return () => clearTimeout(timer);
	}, [chats]);

	useEffect(() => {
		const timer = setTimeout(scrollToBottom, 100);
		const timer2 = setTimeout(scrollToBottom, 300);
		return () => {
			clearTimeout(timer);
			clearTimeout(timer2);
		};
	}, [chats]);
	
	// Add paste event listener to both textareas (regular and empty state)
	useEffect(() => {
		const handlePaste = (event: ClipboardEvent): void => {
			handlePasteEvent(event);
		};
		
		// Add listener to regular chat textarea (when chats exist)
		const regularTextarea = textareaRef.current;
		if (regularTextarea) {
			regularTextarea.addEventListener("paste", handlePaste);
		}
		
		// Add listener to empty state textarea (when no chats)
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

	// Auto-expand textarea as text grows
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			// Reset height to auto to get the correct scrollHeight
			textarea.style.height = "auto";
			// Set height to scrollHeight with min and max constraints
			const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 400); // min 40px, max 400px
			textarea.style.height = `${newHeight}px`;
		}
	}, [chatInput]);

	// Update the button click handlers to use the new handleSubmit function
	const handleSubmit = (): void => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "No session or active project",
				variant: "destructive",
			});
			return;
		}

		// Get combined message (chatInput + chatContext)
		const combinedMessage = getCombinedMessage();
		
		// The pasted files are now in selectedContexts, so we don't need to pass them separately
		// The usePlatformChat hook will handle adding them to the message as ::attachments[...]
		handleChatSubmit({
			message: combinedMessage,
			files: [], // Empty since we're using selectedContexts system
		});
		
		// Clear uploaded files after submission
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

	// Create a more reliable function to extract text content (currently unused)
	// const getTextFromHtml = (html: string): string => {
	// 	const tempDiv = document.createElement("div");
	// 	tempDiv.innerHTML = html;
	// 	return tempDiv.textContent || tempDiv.innerText || "";
	// };

	// Function to copy formatted content (currently unused but kept for future use)
	// const copyFormattedContent = (index: number): void => {
	// 	const history = chats[index];
	// 	let textContent = "";
	// 
	// 	if (typeof history.message === "string") {
	// 		textContent = history.message;
	// 	} else if (history.message && typeof history.message === "object") {
	// 		// Convert HTML to plain text for copying
	// 		const tempDiv = document.createElement("div");
	// 		tempDiv.innerHTML = history.message.toString();
	// 		textContent = getTextFromHtml(tempDiv.innerHTML);
	// 	}
	// 
	// 	if (textContent) {
	// 		navigator.clipboard.writeText(textContent)
	// 			.then(() => {
	// 				// Successfully copied to clipboard
	// 			})
	// 			.catch(() => {
	// 				// Failed to copy content
	// 			});
	// 	}
	// };

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
		<div className="px-4 py-2 flex flex-col justify-end">
			<div className="relative overflow-hidden rounded-lg border border-black bg-background focus-within:ring-1 focus-within:ring-ring">
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
				<div className="absolute top-0 left-2 z-10">
					<AtSelectorComponent />
				</div>
				<Textarea
					className="min-h-10 resize-none border-0 p-3 pb-4 mt-4 shadow-none focus-visible:ring-0"
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
				<div className="flex items-center justify-between p-3 pt-0">
					<div className="flex items-center gap-2">
						{loadDocumentPanel()}
						<AgentTypeSelector 
							onAgentTypeChange={setSelectedAgentType}
							selectedAgentType={selectedAgentType}
						/>
						<ModelSelector 
							onModelChange={setSelectedModel}
							selectedModel={selectedModel}
						/>
					</div>
					<Button
						className={`gap-1.5 transition-colors ${
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
		<div className="flex flex-col h-full max-w-4xl mx-auto">
			{chats && chats.length > 0 ? (
			// Regular chat view when there are messages
				<ScrollArea
					className="flex-grow px-1 sm:px-3 pb-4"
					ref={chatContainerRef}
				>
					<div className="pt-2">
						
						{chats.map((history, index) => (
							<div className="flex flex-col gap-2" key={index}>
								{  (typeof history.message === "string" ||  !["run_workflow", "send_data_to_workflow", "continue_conversation", "start_new_conversation"].includes(history.message.function_call?.name || "")) && (
									<div
										className={`${
											history.sender.toLowerCase() === "user"
												? "flex justify-end mb-4"
												: "block w-full"
										}`}
									>
										<div
											className={`${
												history.sender.toLowerCase() === "user"
													? "max-w-3xl bg-gray-50 border border-gray-100 rounded-xl p-2 shadow-sm mx-2"
													: "w-full bg-white py-3 px-2 border-b border-slate-100 last:border-b-0 min-h-[40px] transition-all duration-200"
											}`}
										>
											{shouldShowFlowllyLabel(index) && (
												<div className="flex text-xs text-slate-400 mb-1 pl-1">
													Flowlly
												</div>
											)}
											<div
												ref={messageRefs.current[index] || null}
											>
												{history.message && (
													<AgentMessageInteractiveView id={history.id}
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
						))}
						
					</div>
					<div className="flex justify-start px-2 py-2">
						<Button
							className="text-xs text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 border-none px-2 py-1 gap-1 h-auto transition-colors"
							onClick={async() => {
								try {
									if (!session || !activeProject) {
										toast({
											title: "Error",
											description: "No session or active project available",
											variant: "destructive",
										});
										return;
									}
									
									await requestHelp(session, activeProject.project_id, activeChatEntity?.id ?? "");
									toast({
										title: "Help Request Sent",
										description: "The Flowlly team has been notified and will assist you shortly.",
										duration: 3000,
									});
								} catch (error) {
									console.error("Failed to request help:", error);
									toast({
										title: "Request Failed",
										description: "Failed to send help request. Please try again.",
										variant: "destructive",
									});
								}
							}}
							size="sm"
							variant="ghost"
						>
							<Bird className="w-3 h-3" />
							<span title="Flowlly team will review the chat and complete the task !">Get Help</span>
						</Button>
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
					/>
				</div>
			)}
			{/* Only show this input area when there are chats */}
			{chats && chats.length > 0 && (
				<div className="sticky bottom-0 px-4 py-3 bg-white border-t border-slate-100 backdrop-blur-sm">
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
