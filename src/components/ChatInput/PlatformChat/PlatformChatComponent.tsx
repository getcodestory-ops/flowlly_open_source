"use client";
import PlatformChatInterface from "./PlatformChatInterface";
import { useState, useEffect } from "react";
import {
	PanelRight,
	PenBox,
	Pencil,
} from "lucide-react";
import { useStore } from "@/utils/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPlatformChatEntities } from "@/api/agentRoutes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useChatStore } from "@/hooks/useChatStore";
import { updateChatName } from "@/api/agentRoutes";
const models = [
	{ id: "gemini-2.5-pro-preview-03-25", name: "Gemini Pro 2.5 (latest)" },
	{ id: "gemini-2.0-flash", name: "Gemini Flash" },
	{ id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
	{ id: "gpt-4o", name: "GPT-4.0" },
];

const titleMap: Record<string, string> = {
	document: "Source for answers",
	schedule: "Interact with ",
	"document-edit": "Document Editor",
	workflow: " ",
};




export default function PlatformChatComponent({
	chatTarget,
	folderId,
	folderName,
	onContentUpdate,
}: {
  folderId: string;
  folderName: string;
  chatTarget:
    | "workflow"
    | "editor"
    | "schedule"
    | "project"
    | "agent"
    | "folder";
  onContentUpdate?: (newContent: string) => void;
}) {
	const { sidePanel } = useChatStore();
	const { setSelectedContexts } = useChatStore();
	const { setIsWaitingForResponse } = useChatStore();
	const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
	const { toast } = useToast();
	const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-pro-preview-03-25");
	const [includeContext, setIncludeContext] = useState<boolean>(false);
	const [editingChatId, setEditingChatId] = useState<string | null>(null);
	const [editedName, setEditedName] = useState<string>("");
	const [isHovered, setIsHovered] = useState<boolean>(false);

	// Get store data for chat entities
	const {
		activeChatEntity,
		setActiveChatEntity,
		activeProject,
		session,
		setLocalChats,
	} = useStore((state) => ({
		activeChatEntity: state.activeChatEntity,
		setActiveChatEntity: state.setActiveChatEntity,
		activeProject: state.activeProject,
		session: state.session,
		setLocalChats: state.setLocalChats,
	}));


	// Query chat entities
	const { data: chatEntities, isLoading: chatsLoading } = useQuery({
		queryKey: ["documentChatEntityList", session, activeProject],
		queryFn: () => {
			if (!session || !activeProject) {
				return Promise.reject("No session or active project");
			}
			return getPlatformChatEntities(
				session,
				activeProject.project_id,
				folderId,
				chatTarget,
			);
		},
	});

	// Set first chat entity as active on initial load, but preserve existing active chat
	useEffect(() => {
		// Only reset if there's no active chat entity already selected
		if (!activeChatEntity) {
			setLocalChats([]);
			// Don't automatically set to null if we already have an active chat
		}
	}, []);

	// Inside the component, add queryClient
	const queryClient = useQueryClient();

	const handleCreateNewChat = () => {
		setActiveChatEntity(null);
		setLocalChats([]);
		setSelectedContexts("untitled", []);
		setActiveTab("chat");
	};

	const handleSelectChatEntity = (chatEntity: any) => {
		setIsWaitingForResponse(false);
		setActiveChatEntity(chatEntity);
		setActiveTab("chat");
	};


	const handleEditSubmit = async() => {
		try {
			if (!editingChatId || !session) return;
			await updateChatName(session, editingChatId, editedName);
			
			// Update the cache to reflect the new name
			queryClient.setQueryData(
				["documentChatEntityList", session, activeProject],
				(oldData: any) => {
					if (!oldData) return oldData;
					return oldData.map((chat: any) => 
						chat.id === editingChatId 
							? { ...chat, chat_name: editedName }
							: chat,
					);
				},
			);

			// If this was the active chat, update that too
			if (activeChatEntity?.id === editingChatId) {
				setActiveChatEntity({ ...activeChatEntity, chat_name: editedName });
			}

			setEditingChatId(null);
			toast({
				title: "Success",
				description: "Chat name updated successfully",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update chat name",
				variant: "destructive",
			});
		}
	};

	const renderMainContent = () => {
		switch (activeTab) {
			case "chat":
			default:
				return (
					<PlatformChatInterface
						chatTarget={chatTarget}
						folderId={folderId}
						includeContext={includeContext}
						onContentUpdate={onContentUpdate}
						selectedModel={selectedModel}
					/>
				);
		}
	};

	return (
		<div className="container mx-auto h-full">
			<div className="flex h-[calc(100vh-20px)] bg-white rounded-xl shadow-sm overflow-hidden">
				{/* Left sidebar for chat controls */}
				<TooltipProvider delayDuration={0}>
					<div
						className="flex flex-col border-r border-slate-200 transition-all duration-300 relative"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						{/* Always collapsed base sidebar */}
						<div className="w-16 h-full flex flex-col">
							{/* Title area - collapsed version */}
							<div className="p-2">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											className="w-full h-7 p-0"
											onClick={handleCreateNewChat}
											variant="ghost"
										>
											<PenBox className="h-4 w-4 text-gray-500" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="right">New Chat</TooltipContent>
								</Tooltip>
							</div>
							<div className="flex-grow" />
							<div className="border-t border-slate-200">
								<div className="p-2 space-y-1">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												className="w-full py-1 px-2 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50"
												onClick={handleCreateNewChat}
												variant="ghost"
											>
												<PenBox size={16} />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="right">New Chat</TooltipContent>
									</Tooltip>
								</div>
							</div>
						</div>
						{isHovered && (
							<div className="absolute left-0 top-0 w-60 h-full bg-white border-r border-slate-200 shadow-lg z-50 flex flex-col">
								{/* Title area - expanded version */}
								<div className="p-3 flex justify-between items-center">
									<h3 className="text-sm font-medium text-gray-700">
										{titleMap[chatTarget]} {folderName}
									</h3>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												className="h-7 w-7 p-0"
												onClick={handleCreateNewChat}
												variant="ghost"
											>
												<PenBox className="h-4 w-4 text-gray-500" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>New Chat</TooltipContent>
									</Tooltip>
								</div>
								<ScrollArea className="flex-grow h-[calc(100vh-5000px)]">
									<div className="px-2 py-2">
										{chatEntities && [...chatEntities].map((chatEntity, index, array) => {
											const isEditing = editingChatId === chatEntity.id;

											// Group chats by date
											const date = new Date(chatEntity.created_at);
											const today = new Date();
											const yesterday = new Date(today);
											yesterday.setDate(yesterday.getDate() - 1);
									
											let dateLabel = "";
											if (index === 0 || (index > 0 && new Date(array[index - 1].created_at).toDateString() !== date.toDateString())) {
												if (date.toDateString() === today.toDateString()) {
													dateLabel = "Today";
												} else if (date.toDateString() === yesterday.toDateString()) {
													dateLabel = "Yesterday";
												} else {
													dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
												}
											}

											const handleKeyDown = (e: React.KeyboardEvent) => {
												if (e.key === "Enter") {
													handleEditSubmit();
												}
												if (e.key === "Escape") {
													setEditingChatId(null);
													setEditedName(chatEntity.chat_name);
												}
											};

											return (
												<div key={chatEntity.id}>
													{dateLabel && (
														<div className="text-[10px] text-gray-400 pt-3 pb-1 px-2">
															{dateLabel}
														</div>
													)}
													<Tooltip>
														<TooltipTrigger asChild>
															<button
																className={`group w-full text-left py-1 px-2 mb-[2px] rounded transition-colors ${
																	chatEntity.id === activeChatEntity?.id
																		? "bg-gray-50 text-gray-900"
																		: "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
																}`}
																onClick={() => !isEditing && handleSelectChatEntity(chatEntity)}
															>
																<div className="flex items-center justify-between">
																	{isEditing ? (
																		<Input
																			autoFocus
																			className="h-6 text-xs"
																			onBlur={handleEditSubmit}
																			onChange={(e) => setEditedName(e.target.value)}
																			onKeyDown={handleKeyDown}
																			value={editedName}
																		/>
																	) : (
																		<>
																			<span className="text-xs leading-tight truncate block">
																				{chatEntity.chat_name}
																			</span>
																			<Pencil 
																				className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
																				onClick={(e) => {
																					e.stopPropagation();
																					setEditingChatId(chatEntity.id);
																					setEditedName(chatEntity.chat_name);
																				}}
																			/>
																		</>
																	)}
																</div>
															</button>
														</TooltipTrigger>
													</Tooltip>
												</div>
											);
										})}
										{chatEntities && chatEntities.length === 0 && (
											<div className="text-center text-xs text-gray-400 p-2">
												🤖 Ready to be your sidekick! Drop a message and let&apos;s make some magic happen ✨
											</div>
										)}
										{chatsLoading && (
											<div className="text-center text-xs text-gray-400 p-2">
												Loading chats...
											</div>
										)}
									</div>
								</ScrollArea>
								<div className="border-t border-slate-200">
									<div className="p-2 space-y-1">
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													className="w-full py-1 px-2 rounded flex items-center justify-start text-gray-400 hover:text-gray-600 hover:bg-gray-50"
													onClick={handleCreateNewChat}
													variant="ghost"
												>
													<PenBox size={16} />
													<span className="ml-2 text-xs">New Chat</span>
												</Button>
											</TooltipTrigger>
										</Tooltip>
									</div>
								</div>
							</div>
						)}
					</div>
				</TooltipProvider>
				<div className="flex-grow overflow-hidden flex flex-col">
					<div className="flex-grow overflow-hidden">{renderMainContent()}</div>
				</div>
			</div>
		</div>
	);
}
