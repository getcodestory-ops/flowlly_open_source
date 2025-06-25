import React, { useEffect, useState, useRef } from "react";
import { useStore } from "@/utils/store";
import { getTaskStatus } from "@/api/schedule_routes";
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

	useEffect(() => {
		if (!streamingKey || !session) return;

		let isUnmounted = false;
		let pollCount = 0;
		const MAX_POLL_ATTEMPTS = 600; // 5 minutes at 2-second intervals
		let timeoutId: NodeJS.Timeout;

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
				const response = await getTaskStatus(session, streamingKey);

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
					setTimeout(() => {
						const currentActiveChatEntity = useStore.getState().activeChatEntity;
						if (currentActiveChatEntity?.id === activeChatEntity?.id) {
							const currentLocalChats = useStore.getState().localChats;
							const updatedChats = currentLocalChats.map((chat) => {
								if (chat.id === messageId) {
									if (response.result && response.result.length > 0) {
										return response.result[0];
									}
								}
								return chat;
							});
							if (response.result && response.result.length > 1) {
								const additionalMessages = response.result.slice(1);
								updatedChats.push(...additionalMessages);
							}
							setLocalChats(updatedChats);
							queryClient.setQueryData(
								["agentChats", activeChatEntity?.id],
								() => updatedChats,
							);
							setIsWaitingForResponse(false);
						}
					}, 300); 
				} else if (
					response.status === "pending" ||
          response.status === "processing"
				) {
					setIsWaitingForResponse(true);
					// Continue polling if still in progress
					timeoutId = setTimeout(checkTaskStatus, 2000);
				} else if (response.status === "failed" || response.status === "error") {
					setIsLoading(false);
					// Handle failure - replace streaming message with error
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
					if (pollCount < 3) {
						timeoutId = setTimeout(checkTaskStatus, 5000); // Longer delay on errors
					} else {
						setIsLoading(false);
						setTaskStatus("error");
						setIsWaitingForResponse(false);
						toast({
							title: "Network Error",
							description: "Failed to check task status. Please try again.",
							variant: "destructive",
						});
					}
				}
			}
		};

		checkTaskStatus();

		return () => {
			isUnmounted = true;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [streamingKey, session, messageId, activeChatEntity?.id, queryClient, setLocalChats, toast]);

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
				return "Working";
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
					<div className="px-4 py-3  border-b border-gray-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="text-sm text-gray-600 flex items-center">
									{getStatusText()}
									{(taskStatus === "pending" || taskStatus === "processing") && (
										<AnimatedDots />
									)}
								</span>
								{(taskStatus === "pending" || taskStatus === "processing") && (
									<button
										className="ml-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										disabled={isStopping}
										onClick={handleStopAgent}
									>
										{isStopping ? "Stopping..." : "Stop"}
									</button>
								)}
							</div>
							<AccordionTrigger className="p-1 hover:bg-gray-200 rounded transition-colors [&[data-state=open]>svg]:rotate-90">
								<div className="w-4 h-4" />
							</AccordionTrigger>
						</div>
					</div>
					{!isFullyExpanded && (
						<div 
							className="relative max-h-32 overflow-hidden cursor-pointer hover:bg-gray-25 transition-colors"
							onClick={() => setIsFullyExpanded(true)}
						>
							<div className="p-4 text-slate-700 prose prose-slate max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:text-indigo-900 prose-li:my-1">
								<StreamComponent
									authToken={authToken}
									key={streamingKey}
									streamingKey={streamingKey}
								/>
							</div>
							<div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
						</div>
					)}
					<AccordionContent className="px-4 pb-4">
						<div className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-500">
							<div className="text-slate-700 prose prose-slate max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:text-indigo-900 prose-li:my-1">
								<StreamComponent
									authToken={authToken}
									key={streamingKey}
									streamingKey={streamingKey}
								/>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
};

export default StreamMessageWrapper; 