import { useState, useRef } from "react";
import { useStore, useViewStore } from "@/utils/store";
import { talkToAgent, ProcessedFile, sendMessageToStreamingAgent } from "@/api/agentRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { createPlatformChatEntity } from "@/api/agentRoutes";
import { AgentChat, AgentChatEntity } from "@/types/agentChats";
import { useChatStore } from "@/hooks/useChatStore";
import { FunctionApproval } from "@/types/agentChats";

export function usePlatformChat(
	folderId: string,
	chatTarget: string,
	includeContext: boolean = false,
) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const chatInput = useChatStore((state) => state.chatInput);
	const setChatInput = useChatStore((state) => state.setChatInput);
	const getCombinedMessage = useChatStore((state) => state.getCombinedMessage);
	const clearChatContext = useChatStore((state) => state.clearChatContext);
	const session = useStore((state) => state.session);
	const [googleSearch, setGoogleSearch] = useState(false);
	const activeProject = useStore((state) => state.activeProject);
	const activeChatEntity = useStore((state) => state.activeChatEntity);
	const appendChatEntity = useStore((state) => state.appendChatEntity);
	const chatDirectiveType = useChatStore((state) => state.chatDirectiveType);
	const selectedContexts = useChatStore((state) => state.selectedContexts);
	const setSelectedContexts = useChatStore((state) => state.setSelectedContexts);
	const contextFolder = useChatStore((state) => state.contextFolder);
	const setIsWaitingForResponse = useChatStore((state) => state.setIsWaitingForResponse);
	const isWaitingForResponse = useChatStore((state) => state.isWaitingForResponse);
	const chatTypeTags = useChatStore((state) => state.chatTypeTags);
	const selectedModel = useViewStore((state) => state.preferredModel);
	const selectedAgentType = useViewStore((state) => state.preferredAgentType);
	// Note: streamingKey is now detected per-chat instead of using global state


	// Use localChats from the store instead of local state
	const localChats = useStore((state) => state.localChats);
	const setLocalChats = useStore((state) => state.setLocalChats);

	// Track the chatEntityId that was used when submitting, so we can clear the correct contexts on success
	const pendingChatEntityIdRef = useRef<string | null>(null);

	const [isOpen, setIsOpen] = useState(false);
	const onClose = () => setIsOpen(false);
	const onOpen = () => setIsOpen(true);

	const { mutate, isPending } = useMutation({
		mutationFn: talkToAgent,
		onError: (error) => {
			console.error("Chat submission error:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to send message. Please try again.",
				variant: "destructive",
			});
			setIsWaitingForResponse(false);
			
			if (localChats.length > 0 && localChats[localChats.length - 1].sender === "User") {
				setLocalChats(localChats.slice(0, -1));
			}
		},
		onSuccess: (data, _variables) => {
			if (!data || !data.agent_response) {
				console.error("Invalid response from talkToAgent:", data);
				toast({
					title: "Error",
					description: "Invalid response from server. Please try again.",
					variant: "destructive",
				});
				
				
				const ErrorMessage: AgentChat = {
					id: (Date.now() + 1).toString(), 
					sender: "Flowlly",
					receiver: "User",
					project_id: activeProject?.project_id || "",
					message: "Something went wrong. Please try again.",
					created_at: new Date().toISOString(),
				};
				setLocalChats([...localChats, ErrorMessage]);
				setIsWaitingForResponse(false);
				return;
			}

		const streamMessage: AgentChat = {
			id: (Date.now() + 1).toString(),
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
		setLocalChats([...localChats, streamMessage]);
		setIsWaitingForResponse(true);
		
		// Only clear chat input and contexts on successful submission
		setChatInput("");
		clearChatContext();
		
		// Clear the selected contexts (attachments) for the chat that was submitted
		if (pendingChatEntityIdRef.current) {
			setSelectedContexts(pendingChatEntityIdRef.current, []);
			pendingChatEntityIdRef.current = null;
		}
	},
		
	});


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
				metadata: {
					...(chatTypeTags.length > 0 ? { tags: chatTypeTags } : {}),
					agent_type: selectedAgentType,
				},
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

	// Check if current chat has an active streaming message
	const hasActiveStreamingMessage = () => {
		if (!localChats || localChats.length === 0) return null;
		
		// Look for the most recent streaming message
		for (let i = localChats.length - 1; i >= 0; i--) {
			const chat = localChats[i];
			if (typeof chat.message === "object" && 
				chat.message.type === "stream" && 
				chat.message.streaming_key) {
				return chat.message.streaming_key;
			}
		}
		return null;
	};

	// Handle sending message to streaming agent
	const handleStreamingMessage = async(message: string, streamingKey: string) => {
		if (!session || !streamingKey) {
			toast({
				title: "Error",
				description: "No session or streaming key available",
				variant: "destructive",
			});
			return;
		}

		try {
			// Send message to streaming agent
			const response = await sendMessageToStreamingAgent({
				session,
				streamingKey,
				message,
			});

			// Only clear input and context on successful submission
			setChatInput("");
			clearChatContext();

			toast({
				title: "Message added to queue",
				description: response.message || "Message sent to agent queue",
			});
		} catch (error) {
			console.error("Error sending message to streaming agent:", error);
			toast({
				title: "Error",
				description: "Failed to send message to agent. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleChatSubmit = async({
		message,
		files,
	}: {
    message: string | FunctionApproval;
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

		// Check if current chat has an active streaming message
		const activeStreamingKey = hasActiveStreamingMessage();
		if (activeStreamingKey) {
			await handleStreamingMessage(typeof message === "string" ? message : message?.comments || "", activeStreamingKey);
			return;
		}

		if (isWaitingForResponse) {
			console.warn("Chat submission blocked - already processing");
			return;
		}
		setIsWaitingForResponse(true);




		let chatEntityId: string = activeChatEntity?.id || "untitled";
		// Store the chatEntityId so we can clear its contexts on success
		pendingChatEntityIdRef.current = chatEntityId;
		
		const currentContexts = selectedContexts[chatEntityId] || [];
		if (currentContexts.length > 0 && chatDirectiveType === "chat") {
			const attachmentsJson = JSON.stringify(currentContexts.map((ctx) => ({
				name: ctx.name,
				uuid: ctx.id,
				type: ctx.extension,
			})));
			message = message + "\n\n::attachments[" + attachmentsJson + "]\n";
		}

		const userMessage: AgentChat = {
			id: Date.now().toString(), // Use a temporary ID
			sender: "User",
			receiver: "Flowlly",
			project_id: activeProject?.project_id || "",
			message: {
				content: typeof message === "string" ? message : message?.comments || "",
				role: "user",
			},
			created_at: new Date().toISOString(),
		};

		setLocalChats([...localChats, userMessage]);

		// Note: setChatInput and clearChatContext are now called in onSuccess
		// to preserve the user's input if the submission fails

		if (chatEntityId === "untitled") {
			try {
				await createChatEntityMutation.mutateAsync(typeof message === "string" ? message : message?.comments || "");
				setIsWaitingForResponse(true);
			} catch (error) {
				console.error("Failed to create chat entity:", error);
				setLocalChats(localChats);
				return;
			}
		}
		const currentActiveChatEntity = useStore.getState().activeChatEntity;

		if (!currentActiveChatEntity?.id) {
			toast({
				title: "Error",
				description: "Failed to create or retrieve chat entity",
				variant: "destructive",
			});
			setLocalChats(localChats);
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
			agentType: selectedAgentType,
			includeContext: includeContext,
			googleSearch: googleSearch,
		});
	};

	return {
		chats: localChats, // Return localChats from the store
		isPending,
		activeProject,
		activeChatEntity,
		isOpen,
		onClose,
		handleChatSubmit,
		handleStreamingMessage,
		setChatInput,
		chatInput,
		getCombinedMessage,
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
