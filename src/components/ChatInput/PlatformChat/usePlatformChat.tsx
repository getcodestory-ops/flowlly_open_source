import { useState, useEffect, useRef } from "react";
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
	
	// Track when we're actively submitting to prevent server data overwrites
	const isActivelySubmittingRef = useRef(false);

	const [isOpen, setIsOpen] = useState(false);
	const onClose = () => setIsOpen(false);
	const onOpen = () => setIsOpen(true);

	const { mutate, isPending, data } = useMutation({
		mutationFn: talkToAgent,
		onError: (error) => {
			console.error("Chat submission error:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to send message. Please try again.",
				variant: "destructive",
			});
			setIsWaitingForResponse(false);
			isActivelySubmittingRef.current = false;
			
			// Remove the last user message if API call failed
			if (localChats.length > 0 && localChats[localChats.length - 1].sender === "User") {
				setLocalChats(localChats.slice(0, -1));
			}
		},
		onSuccess: (data, variables) => {
			// Clear the active submission flag since API call succeeded
			isActivelySubmittingRef.current = false;
			
			// Validate the response data
			if (!data || !data.agent_response) {
				console.error("Invalid response from talkToAgent:", data);
				toast({
					title: "Error",
					description: "Invalid response from server. Please try again.",
					variant: "destructive",
				});
				setIsWaitingForResponse(false);
				
				// Remove the last user message if invalid response
				if (localChats.length > 0 && localChats[localChats.length - 1].sender === "User") {
					setLocalChats(localChats.slice(0, -1));
				}
				return;
			}

			// Add a stream message to the chat instead of managing currentTaskId
			const streamMessage: AgentChat = {
				id: (Date.now() + 1).toString(), // Use a different timestamp to avoid conflicts
				sender: "Flowlly",
				receiver: "User",
				project_id: activeProject?.project_id || "",
				message: {
					type: "stream",
					streaming_key: data.agent_response,
					role: "assistant",
				},
				created_at: new Date().toISOString(),
			};

			// Add the stream message to local chats
			setLocalChats([...localChats, streamMessage]);
			setIsWaitingForResponse(true);
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

	useEffect(() => {
		if (serverChats && isServerChatsSuccess) {
			// Only load server chats if we're not actively submitting a new message
			// This prevents server data from overwriting our manually managed local state
			if (!isActivelySubmittingRef.current && !isWaitingForResponse) {
				setLocalChats(serverChats);
				
				// Check if the last message is a streaming message that we should resume
				if (serverChats.length > 0) {
					const lastMessage = serverChats[serverChats.length - 1];
					
					// Check if last message is from agent and is a streaming message
					if (lastMessage.sender !== "User" && typeof lastMessage.message === "object" && lastMessage.message !== null) {
						if (lastMessage.message.type === "stream" && lastMessage.message.streaming_key) {
							setIsWaitingForResponse(true);
						}
					}
				}
			}
		}
	}, [serverChats, isServerChatsSuccess, setLocalChats, isWaitingForResponse]);

	// Reset streaming state when switching to a different chat entity
	useEffect(() => {
		setIsWaitingForResponse(false);
	}, [activeChatEntity?.id]);

	const createChatEntityMutation = useMutation({
		mutationFn: async(messageContent: string) => {
			if (!session || !activeProject) {
				throw new Error("No session or active project");
			}

			const response = await createPlatformChatEntity(session, {
				project_id: activeProject.project_id,
				chat_name: "untitled",
				chat_details: messageContent,
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

		// Prevent multiple simultaneous submissions
		if (isPending || isWaitingForResponse) {
			console.warn("Chat submission blocked - already processing");
			return;
		}

		// Mark as actively submitting to prevent server data overwrites
		isActivelySubmittingRef.current = true;

		// Reset waiting state before submitting a new chat request
		setIsWaitingForResponse(false);

		// Add the user message to local chats immediately for better UX
		const userMessage: AgentChat = {
			id: Date.now().toString(), // Use a temporary ID
			sender: "User",
			receiver: "Flowlly",
			project_id: activeProject?.project_id || "",
			message: {
				content: message,
				role: "user",
			},
			created_at: new Date().toISOString(),
		};

		// Update local chats with the user message immediately
		setLocalChats([...localChats, userMessage]);

		// Clear the input immediately for better UX
		setChatInput("");

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
			try {
				await createChatEntityMutation.mutateAsync(message);
			} catch (error) {
				console.error("Failed to create chat entity:", error);
				// Remove the user message if chat entity creation fails
				setLocalChats(localChats);
				isActivelySubmittingRef.current = false;
				return;
			}
		}

		// Ensure we have an active chat entity after potential creation
		const currentActiveChatEntity = useStore.getState().activeChatEntity;

		if (!currentActiveChatEntity?.id) {
			toast({
				title: "Error",
				description: "Failed to create or retrieve chat entity",
				variant: "destructive",
			});
			// Remove the user message if no chat entity
			setLocalChats(localChats);
			isActivelySubmittingRef.current = false;
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
		isWaitingForResponse,
		selectedModel,
		includeContext,
		googleSearch,
		setGoogleSearch,
		setIsWaitingForResponse,
	};
}
