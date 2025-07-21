import React, { useEffect, useState, useCallback, useRef } from "react";
import { useStore } from "@/utils/store";
import { getTaskStatusById } from "@/api/taskQueue";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import StreamComponent from "./StreamAgentChat";
import { stopAgent } from "@/api/agentRoutes";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { StopCircle } from "lucide-react";

// Notification utility functions
const requestNotificationPermission = async(): Promise<boolean> => {
	if (!("Notification" in window)) {
		return false;
	}

	if (Notification.permission === "granted") {
		return true;
	}

	if (Notification.permission !== "denied") {
		const permission = await Notification.requestPermission();
		return permission === "granted";
	}

	return false;
};

const sendNotification = (title: string, options?: NotificationOptions) => {
	// Only send notification if the tab is not active/visible
	if (document.hidden && Notification.permission === "granted") {
		const notification = new Notification(title, {
			icon: "/favicon.ico", // Use your app's favicon
			badge: "/favicon.ico",
			tag: "flowlly-task-complete", // Prevents duplicate notifications
			requireInteraction: false, // Auto-dismiss after a few seconds
			...options,
		});

		// Auto-close notification after 5 seconds
		setTimeout(() => {
			notification.close();
		}, 5000);

		// Optional: Focus the tab when notification is clicked
		notification.onclick = () => {
			window.focus();
			notification.close();
		};

		return notification;
	}
	return null;
};

interface StreamMessageWrapperProps {
  streamingKey: string;
  authToken: string;
  messageId: string;
  setIsWaitingForResponse: (value: boolean) => void;
}

const StreamMessageWrapper: React.FC<StreamMessageWrapperProps> = ({
	streamingKey,
	authToken,
	messageId,
	setIsWaitingForResponse,
}) => {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const session = useStore((state) => state.session);
	const localChats = useStore((state) => state.localChats);
	const setLocalChats = useStore((state) => state.setLocalChats);
	const activeChatEntity = useStore((state) => state.activeChatEntity);
	
	// Add state for expand/collapse functionality - default to preview mode
	const [isFullyExpanded, setIsFullyExpanded] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [taskStatus, setTaskStatus] = useState<string>("pending");
	const [isStopping, setIsStopping] = useState(false);
	
	// Add state to track stream completion for optimized polling
	const [isStreamComplete, setIsStreamComplete] = useState(false);
	const streamCompleteRef = useRef(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const checkTaskStatusRef = useRef<(() => Promise<void>) | null>(null);
	
	// Add state for notification permission
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);

	// Request notification permission on mount
	useEffect(() => {
		const initNotifications = async() => {
			const hasPermission = await requestNotificationPermission();
			setNotificationsEnabled(hasPermission);
		};
		
		initNotifications();
	}, []);

	// Handle stream completion callback - memoized to prevent unnecessary re-renders
	const handleStreamComplete = useCallback((content: string) => {
		setIsStreamComplete(true);
		streamCompleteRef.current = true;
		
		// Clear current timeout and immediately schedule a fast poll
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		
		// Trigger immediate fast poll
		if (checkTaskStatusRef.current) {
			setTimeout(() => {
				if (checkTaskStatusRef.current) {
					checkTaskStatusRef.current();
				}
			}, 50);
		}
	}, []);

	useEffect(() => {
		if (!streamingKey || !session) return;

		let isUnmounted = false;
		let pollCount = 0;
		const MAX_POLL_ATTEMPTS = 600; // Max attempts with 100ms intervals = ~1 minute

		const checkTaskStatus = async() => {
			try {
				// Prevent infinite polling
				if (pollCount >= MAX_POLL_ATTEMPTS) {
					console.warn(`Polling timeout for task ${streamingKey} after ${MAX_POLL_ATTEMPTS} attempts`);
					if (!isUnmounted) {
						setIsLoading(false);
						setTaskStatus("timeout");
						toast({
							title: "Request Timeout",
							description: "The request is taking longer than expected. Please try again.",
							variant: "destructive",
						});
					}
					return;
				}

				pollCount++;
				const response = await getTaskStatusById(session, streamingKey);

				if (isUnmounted) return;

				// Validate response structure
				if (!response || typeof response.status !== "string") {
					console.error("Invalid response structure from getTaskStatus:", response);
					if (!isUnmounted) {
						setIsLoading(false);
						setTaskStatus("error");
						toast({
							title: "Error",
							description: "Invalid response from server",
							variant: "destructive",
						});
					}
					return;
				}

				setTaskStatus(response.status);

				if (response.status === "completed" && response.result) {
					setIsLoading(false);
					
					// Send notification to user
					if (notificationsEnabled) {
						sendNotification("Task Completed! 🎉", {
							body: "Your request has been processed successfully.",
							icon: "/favicon.ico",
						});
					}
					
					// Remove the setTimeout to prevent race conditions
					const currentActiveChatEntity = useStore.getState().activeChatEntity;
					if (currentActiveChatEntity?.id === activeChatEntity?.id) {
						// Use a more robust update mechanism with retry logic
						const updateChats = () => {
							const currentLocalChats = useStore.getState().localChats;
							
							// Find the current message to ensure we're updating the right one
							const messageIndex = currentLocalChats.findIndex((chat) => chat.id === messageId);
							if (messageIndex === -1) {
								console.warn(`Message with id ${messageId} not found in local chats`);
								setIsWaitingForResponse(false);
								return false;
							}

							// Check if the message is still a streaming message to prevent overwriting completed messages
							const currentMessage = currentLocalChats[messageIndex];
							if (typeof currentMessage.message === "object" && 
								currentMessage.message.type === "stream" && 
								currentMessage.message.streaming_key === streamingKey) {
								const updatedChats = [...currentLocalChats];
								
								// Replace the streaming message with the completed result
								if (response.result && response.result.length > 0) {
									// Preserve the original message ID and any other metadata
									const completedMessage = {
										...response.result[0],
										id: messageId, // Ensure we keep the original message ID
									};
									updatedChats[messageIndex] = completedMessage;
								}
								
								// Add any additional messages to the end
								if (response.result && response.result.length > 1) {
									const additionalMessages = response.result.slice(1);
									updatedChats.push(...additionalMessages);
								}
								
								// Atomic update of both store and query cache
								setLocalChats(updatedChats);
								queryClient.setQueryData(
									["agentChats", activeChatEntity?.id],
									() => updatedChats,
								);
								return true;
							} else {
								// Message is no longer a streaming message, skipping update
								return false;
							}
						};

						// Attempt to update, with a fallback mechanism
						const updateSuccessful = updateChats();
						if (!updateSuccessful) {
							// If the first attempt failed, try once more after a short delay
							// This handles cases where the store state might be temporarily inconsistent
							setTimeout(() => {
								updateChats();
							}, 50);
						}
						
						setIsWaitingForResponse(false);
					}
				} else if (
					response.status === "pending" ||
					response.status === "processing"
				) {
					setIsWaitingForResponse(true);
					
					// Fast polling after stream completion, no polling during streaming
					const pollInterval = 500; // 500ms after stream ends
					timeoutRef.current = setTimeout(checkTaskStatus, pollInterval);
				} else if (response.status === "failed") {
					setIsLoading(false);
					setIsWaitingForResponse(false); // Allow sending new messages when task fails
					
					// Handle failed task - replace streaming message with error
					const currentLocalChats = useStore.getState().localChats;
					const updatedChats = currentLocalChats.map((chat) => {
						if (chat.id === messageId) {
							return {
								...chat,
								message: {
									content: "Task failed to complete. Please try again.",
									role: "assistant",
								},
							};
						}
						return chat;
					});
					setLocalChats(updatedChats);
					
					toast({
						title: "Task Failed",
						description: "The task failed to complete. Please try again.",
						variant: "destructive",
					});
				} else if (response.status === "error") {
					setIsLoading(false);
					// Handle error - replace streaming message with error
					const currentLocalChats = useStore.getState().localChats;
					const updatedChats = currentLocalChats.map((chat) => {
						if (chat.id === messageId) {
							return {
								...chat,
								message: {
									content: "Failed to process your request. Please try again.",
									role: "assistant",
								},
							};
						}
						return chat;
					});
					setLocalChats(updatedChats);
          
					toast({
						title: "Error",
						description: "Failed to process your request",
						variant: "destructive",
					});
				} else {
					// Handle unknown status
					console.warn(`Unknown task status: ${response.status}`);
					if (!isUnmounted) {
						setIsLoading(false);
						setTaskStatus("unknown");
						toast({
							title: "Error",
							description: `Unknown status: ${response.status}`,
							variant: "destructive",
						});
					}
				}
			} catch (error) {
				console.error("Error checking task status:", error);
				if (!isUnmounted) {
					// Don't immediately fail on network errors, but limit retries
					if (pollCount < 5) {
						timeoutRef.current = setTimeout(checkTaskStatus, 5000); // Longer delay on errors
					} else {
						toast({
							title: "Chat might be disconnected. Please refresh the page.",
							description: "Chat might be disconnected. Please refresh the page.",
							variant: "default",
						});
					}
				}
			}
		};

		// Store the function reference so it can be called from the callback
		checkTaskStatusRef.current = checkTaskStatus;

		// Don't start polling immediately - wait for stream completion
		// checkTaskStatus(); // Removed this line

		return () => {
			isUnmounted = true;
			checkTaskStatusRef.current = null;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [streamingKey, session, messageId, activeChatEntity?.id, queryClient, setLocalChats, toast, notificationsEnabled]);

	const handleStopAgent = async() => {
		if (!session || !streamingKey || isStopping) return;
		
		setIsStopping(true);
		try {
			const response = await stopAgent({
				session,
				streamingId: streamingKey,
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

	const getStatusText = () => {
		switch (taskStatus) {
			case "pending":
			case "processing":
				return "Flowlly is Operating Computer";
			case "completed":
				return "Complete";
			case "failed":
			case "error":
				return "Failed";
			case "timeout":
				return "Working in background !";
			case "stopped":
				return "Stopped";
			default:
				return "Unknown";
		}
	};

	const AnimatedDots = () => {
		const [dots, setDots] = useState(".");
		
		useEffect(() => {
			const interval = setInterval(() => {
				setDots((prev) => {
					if (prev === "...") return ".";
					return prev + ".";
				});
			}, 500);
			
			return () => clearInterval(interval);
		}, []);
		
		return <span className="inline-block w-6 text-left">{dots}</span>;
	};

	return (
		<div className="w-full">
			<Accordion 
				className="rounded-lg"
				collapsible
				onValueChange={(value) => setIsFullyExpanded(value === "stream-content")}
				type="single"
				value={isFullyExpanded ? "stream-content" : undefined}
			>
				<AccordionItem className="border-0" value="stream-content">
					<AccordionTrigger className="px-4 py-3 rounded-lg transition-colors justify-end [&>svg]:hidden">
						<div className="flex items-center gap-2 w-full justify-between">
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-500 flex items-center">
									{getStatusText()}
									{(taskStatus === "pending" || taskStatus === "processing") && (
										<AnimatedDots />
									)}
								</span>
								{(taskStatus === "pending" || taskStatus === "processing") && (
									<button
										className="px-1 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
										disabled={isStopping}
										onClick={(e) => {
											e.stopPropagation();
											handleStopAgent();
										}}
									>
										<StopCircle className="h-3 w-3" />
									</button>
								)}
							</div>
							<div className="text-xs text-gray-400">
								{isFullyExpanded ? "Hide computer process" : "See computer process"}
							</div>
						</div>
					</AccordionTrigger>
					{!isFullyExpanded && (
						<div 
							className="relative max-h-32 overflow-hidden cursor-pointer hover:bg-gray-25 transition-colors"
							onClick={() => setIsFullyExpanded(true)}
						>
							<div className="p-4 text-slate-700 prose prose-slate max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:text-indigo-900 prose-li:my-1">
								<StreamComponent
									authToken={authToken}
									onStreamComplete={handleStreamComplete}
									streamingKey={streamingKey}
								/>
							</div>
							<div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
						</div>
					)}
					<AccordionContent className="px-4 pb-4">
						{isFullyExpanded && (
							<div className="bg-gray-50 rounded-md p-3 ">
								<div className="text-slate-700 prose prose-slate max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:text-indigo-900 prose-li:my-1">
									<StreamComponent
										authToken={authToken}
										onStreamComplete={handleStreamComplete}
										streamingKey={streamingKey}
									/>
								</div>
							</div>
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
};

export default StreamMessageWrapper; 