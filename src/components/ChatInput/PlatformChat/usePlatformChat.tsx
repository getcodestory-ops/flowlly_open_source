import { useState } from "react";
import { useStore } from "@/utils/store";
import { talkToAgent, ProcessedFile } from "@/api/agentRoutes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { createPlatformChatEntity } from "@/api/agentRoutes";
import { AgentChat, AgentChatEntity } from "@/types/agentChats";
import { useChatStore } from "@/hooks/useChatStore";

export function usePlatformChat(
	folderId: string,
	chatTarget: string,
	selectedModel: string = "gemini-2.5-pro",
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
	const contextFolder = useChatStore((state) => state.contextFolder);
	const setIsWaitingForResponse = useChatStore((state) => state.setIsWaitingForResponse);
	const isWaitingForResponse = useChatStore((state) => state.isWaitingForResponse);
	const chatTypeTags = useChatStore((state) => state.chatTypeTags);

	// Use localChats from the store instead of local state
	const localChats = useStore((state) => state.localChats);
	const setLocalChats = useStore((state) => state.setLocalChats);

	

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
			
			if (localChats.length > 0 && localChats[localChats.length - 1].sender === "User") {
				setLocalChats(localChats.slice(0, -1));
			}
		},
		onSuccess: (data, variables) => {
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
				metadata: chatTypeTags.length > 0 ? { tags: chatTypeTags } : undefined,
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

		if ( isWaitingForResponse) {
			console.warn("Chat submission blocked - already processing");
			return;
		}
		setIsWaitingForResponse(true);




		let chatEntityId: string = activeChatEntity?.id || "untitled";
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
				content: message,
				role: "user",
			},
			created_at: new Date().toISOString(),
		};

		setLocalChats([...localChats, userMessage]);

		setChatInput("");
		clearChatContext(); // Clear context after message is sent

		if (chatEntityId === "untitled") {
			try {
				await createChatEntityMutation.mutateAsync(message);
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
