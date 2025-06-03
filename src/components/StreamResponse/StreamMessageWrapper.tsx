import React, { useEffect, useState, useRef } from "react";
import { useStore } from "@/utils/store";
import { getTaskStatus } from "@/api/schedule_routes";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import StreamComponent from "./StreamAgentChat";
import { AgentChat } from "@/types/agentChats";

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

	useEffect(() => {
		if (!streamingKey || !session) return;

		let isUnmounted = false;
		let pollCount = 0;
		const MAX_POLL_ATTEMPTS = 150; // 5 minutes at 2-second intervals
		let timeoutId: NodeJS.Timeout;

		const checkTaskStatus = async() => {
			try {
				// Prevent infinite polling
				if (pollCount >= MAX_POLL_ATTEMPTS) {
					console.warn(`Polling timeout for task ${streamingKey} after ${MAX_POLL_ATTEMPTS} attempts`);
					if (!isUnmounted) {
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
						toast({
							title: "Error",
							description: "Invalid response from server",
							variant: "destructive",
						});
					}
					return;
				}

				if (response.status === "completed" && response.result) {
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

	return (
		<div className="w-full">
			<div className="text-slate-700 prose prose-slate max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:text-indigo-900 prose-li:my-1">
				<StreamComponent
					authToken={authToken}
					key={streamingKey}
					streamingKey={streamingKey}
				/>
			</div>
		</div>
	);
};

export default StreamMessageWrapper; 