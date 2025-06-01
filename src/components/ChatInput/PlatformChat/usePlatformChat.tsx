import { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import { getTaskStatus } from "@/api/schedule_routes";
import { talkToAgent, ProcessedFile } from "@/api/agentRoutes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentChats } from "@/api/agentRoutes";
import { Session } from "@supabase/supabase-js";
import { isTokenExpired } from "@/utils/isTokenExpired";
import { useToast } from "@/components/ui/use-toast";
import { createPlatformChatEntity } from "@/api/agentRoutes";
import { AgentChat, AgentChatEntity } from "@/types/agentChats";
import { useChatStore } from "@/hooks/useChatStore";

export function usePlatformChat(
	folderId: string,
	chatTarget: string,
	selectedModel: string = "gemini-2.5-pro-preview-03-25",
	includeContext: boolean = false,
) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [chatInput, setChatInput] = useState<string>("");
	const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
	const session = useStore((state) => state.session);
	const [googleSearch, setGoogleSearch] = useState(false);
	const activeProject = useStore((state) => state.activeProject);
	const activeChatEntity = useStore((state) => state.activeChatEntity);
	const appendChatEntity = useStore((state) => state.appendChatEntity);
	const selectedContexts = useChatStore((state) => state.selectedContexts);
	const setSelectedContexts = useChatStore((state) => state.setSelectedContexts);
	const contextFolder = useChatStore((state) => state.contextFolder);

	// Use localChats from the store instead of local state
	const localChats = useStore((state) => state.localChats);
	const setLocalChats = useStore((state) => state.setLocalChats);

	// Track if we're waiting for an AI response
	const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

	const [isOpen, setIsOpen] = useState(false);
	const onClose = () => setIsOpen(false);
	const onOpen = () => setIsOpen(true);

	const { mutate, isPending, data } = useMutation({
		mutationFn: talkToAgent,
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
			setIsWaitingForResponse(false);
		},
		onSuccess: (data, variables) => {
			// Add the user message to local chats
			const userMessage: AgentChat = {
				id: Date.now().toString(), // Use a temporary ID
				sender: "User",
				receiver: "Flowlly",
				project_id: activeProject?.project_id || "",
				message: {
					content: variables.agentTask,
					role: "user",
				},
				created_at: new Date().toISOString(),
			};

			// Set waiting state to true when we're expecting a response
			setIsWaitingForResponse(true);

			// Update local chats with the user message
			setLocalChats([...localChats, userMessage]);
			setChatInput("");
			setCurrentTaskId(data.agent_response);
		},
	});

	const { data: serverChats, isSuccess: isServerChatsSuccess } = useQuery({
		queryKey: ["agentChats", activeChatEntity?.id],
		queryFn: async() => {
			if (!session || !activeChatEntity?.id) return [];
			if (isTokenExpired(session)) return [];
			const response = await getAgentChats(session, activeChatEntity.id);
			return response;
		},
		enabled: !!session && !!activeChatEntity?.id,
	});

	// Initialize local chats from server data only on initial load or chat entity change
	useEffect(() => {
		if (serverChats && isServerChatsSuccess) {
			// Always allow loading chats when switching to a different chat entity
			// The streaming state should only affect the specific chat entity that's streaming
			setLocalChats(serverChats);
		}
	}, [serverChats, isServerChatsSuccess, setLocalChats]);

	// Reset streaming state when switching to a different chat entity
	useEffect(() => {
		// When activeChatEntity changes, reset the streaming state for the new chat
		// This ensures that switching chats during streaming works smoothly
		setIsWaitingForResponse(false);
		setCurrentTaskId(null);
	}, [activeChatEntity?.id]);

	// Check task status periodically to know when to update
	useEffect(() => {
		if (!currentTaskId || !session) return;

		let isUnmounted = false;

		const checkTaskStatus = async() => {
			try {
				const response = await getTaskStatus(session, currentTaskId);

				if (isUnmounted) return;

				if (response.status === "completed" && response.result) {
					setTimeout(() => {
						// Only update if we're still on the same chat entity that was streaming
						const currentActiveChatEntity = useStore.getState().activeChatEntity;
						if (currentActiveChatEntity?.id === activeChatEntity?.id) {
							// Get the latest state from the store
							const currentLocalChats = useStore.getState().localChats;
							const updatedChats = [...currentLocalChats, ...response.result];

							// Update the store with the new chats
							setLocalChats(updatedChats);

							// Quietly sync with server in the background
							queryClient.setQueryData(
								["agentChats", activeChatEntity?.id],
								() => updatedChats,
							);
						}

						setCurrentTaskId(null);
						// Reset waiting state after response is received
						setIsWaitingForResponse(false);
					}, 300); // Small delay to ensure smooth transition
				} else if (
					response.status === "pending" ||
          response.status === "processing"
				) {
					// Continue polling if still in progress
					setTimeout(checkTaskStatus, 2000);
				} else if (response.status === "failed") {
					// Handle failure
					toast({
						title: "Error",
						description: "Failed to process your request",
						variant: "destructive",
					});
					setCurrentTaskId(null);
					setIsWaitingForResponse(false);
				}
			} catch (error) {
				console.error("Error checking task status:", error);
				if (!isUnmounted) {
					setCurrentTaskId(null);
					setIsWaitingForResponse(false);
				}
			}
		};

		checkTaskStatus();

		return () => {
			isUnmounted = true;
		};
	}, [
		currentTaskId,
		session,
		activeChatEntity?.id,
		queryClient,
		activeProject?.project_id,
		setLocalChats,
		toast,
	]);

	// Check for ongoing streams and refresh chat data periodically
	useEffect(() => {
		if (!localChats || localChats.length === 0) return;
		
		// Only check the LAST message for streaming state to avoid issues with stale stream messages
		const lastMessage = localChats[localChats.length - 1];
		const isLastMessageStreaming = lastMessage && 
			typeof lastMessage.message === "object" && 
			lastMessage.message !== null && 
			"type" in lastMessage.message && 
			lastMessage.message.type === "stream";
		
		if (isLastMessageStreaming && session && activeChatEntity?.id) {
			// Set up periodic refresh to check for stream completion
			const refreshInterval = setInterval(() => {
				queryClient.invalidateQueries({
					queryKey: ["agentChats", activeChatEntity.id],
				});
			}, 3000); // Check every 3 seconds
			
			return () => clearInterval(refreshInterval);
		}
	}, [localChats, session, activeChatEntity?.id, queryClient]);

	const createChatEntityMutation = useMutation({
		mutationFn: async() => {
			if (!session || !activeProject) {
				throw new Error("No session or active project");
			}

			const response = await createPlatformChatEntity(session, {
				project_id: activeProject.project_id,
				chat_name: "untitled",
				chat_details: chatInput,
				relation_id: folderId,
				relation_type: chatTarget,
			});


			appendChatEntity(response);

			const queryKey = ["documentChatEntityList", session, activeProject];
			const currentEntities =
        queryClient.getQueryData<AgentChatEntity[]>(queryKey) || [];
			queryClient.setQueryData(queryKey, [response, ...currentEntities]);

			// Set this as the active chat entity
			useStore.setState({ activeChatEntity: response });
			return response;
		},
		onError: (error) => {
			console.error(error);
			toast({
				title: "Error",
				description: "Failed to create chat entity " + error.message,
				variant: "destructive",
			});
		},
	});

	const handleChatSubmit = async({
		message,
		files,
	}: {
    message: string;
    files: ProcessedFile[];
  }) => {
		if (!session || !activeProject) {
			toast({
				title: "Error",
				description: "No session or active project",
				variant: "destructive",
			});
			return;
		}

		// Reset currentTaskId before submitting a new chat request
		setCurrentTaskId(null);

		let chatEntityId: string = activeChatEntity?.id || "untitled";
		const currentContexts = selectedContexts[chatEntityId] || [];
		if (currentContexts.length > 0) {
			const attachmentsJson = JSON.stringify(currentContexts.map((ctx) => ({
				name: ctx.name,
				uuid: ctx.id,
				type: ctx.extension,
			})));
			message = message + "\n\n::attachments[" + attachmentsJson + "]\n";
		}

		if (chatEntityId === "untitled") {
			// Create a new chat entity before submitting the chat
			await createChatEntityMutation.mutateAsync();
		}

		// Ensure we have an active chat entity after potential creation
		const currentActiveChatEntity = useStore.getState().activeChatEntity;

		if (!currentActiveChatEntity?.id) {
			toast({
				title: "Error",
				description: "Failed to create or retrieve chat entity",
				variant: "destructive",
			});
			return;
		}

		mutate({
			session,
			agentTask: message,
			brainId: contextFolder.id ?? folderId ?? null,
			chatId: currentActiveChatEntity.id,
			projectId: activeProject?.project_id,
			responseType: chatTarget ?? "folder",
			files: files,
			model: selectedModel,
			includeContext: includeContext,
			googleSearch: googleSearch,
		});
	};

	return {
		chats: localChats, // Return localChats from the store
		isPending,
		activeProject,
		isOpen,
		onClose,
		handleChatSubmit,
		setChatInput,
		chatInput,
		onOpen,
		session,
		currentTaskId,
		isWaitingForResponse,
		selectedModel,
		includeContext,
		googleSearch,
		setGoogleSearch,
		setCurrentTaskId,
		setIsWaitingForResponse,
	};
}
