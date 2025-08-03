"use client";

import { useState } from "react";
import {
	Plus,
	Search,
	MessageSquare,
	Pencil,
	Star,
	Tag,
	X,
	Check,
} from "lucide-react";
import { useStore } from "@/utils/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPlatformChatEntities, getAgentChats, updateChatName, updateChatEntityMetadata } from "@/api/agentRoutes";
import { AgentChatEntity } from "@/types/agentChats";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useChatStore } from "@/hooks/useChatStore";
import { useRouter } from "next/navigation";

interface ChatPanelProps {
	folderId: string;
	chatTarget: "workflow" | "editor" | "schedule" | "project" | "agent" | "folder";
	isVisible: boolean;
	onCreateNewChat?: () => void;
}

export default function ChatPanel({
	folderId,
	chatTarget,
	isVisible,
	onCreateNewChat,
}: ChatPanelProps) {
	const { setIsWaitingForResponse, resetForNewChat, clearChatContext, setChatDirectiveType } = useChatStore();
	const { toast } = useToast();
	const router = useRouter();
	const [editingChatId, setEditingChatId] = useState<string | null>(null);
	const [editedName, setEditedName] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<"all" | "favorites" | "meeting">("all");
	const [tagInputChatId, setTagInputChatId] = useState<string | null>(null);
	const [newTagName, setNewTagName] = useState<string>("");
	const [selectedCustomTag, setSelectedCustomTag] = useState<string | null>(null);

	// Get store data for chat entities
	const {
		activeChatEntity,
		setActiveChatEntity,
		activeProject,
		session,
		setLocalChats,
		setAppView,
	} = useStore((state) => ({
		activeChatEntity: state.activeChatEntity,
		setActiveChatEntity: state.setActiveChatEntity,
		activeProject: state.activeProject,
		session: state.session,
		setLocalChats: state.setLocalChats,
		setAppView: state.setAppView,
	}));

	const queryClient = useQueryClient();

	// Get all unique custom tags from all chats (excluding system tags)
	const getAllCustomTags = (): string[] => {
		if (!chatEntities) return [];
		const allTags = new Set<string>();
		chatEntities.forEach((chat) => {
			chat.metadata?.tags?.forEach((tag) => {
				if (tag.name !== "favorites" && tag.name !== "meeting") {
					allTags.add(tag.name);
				}
			});
		});
		return Array.from(allTags).sort();
	};

	// Helper functions for tag management
	const hasTag = (chatEntity: AgentChatEntity, tagName: string): boolean => {
		return chatEntity.metadata?.tags?.some((tag: any) => tag.name === tagName) || false;
	};

	const toggleTag = async(chatEntity: AgentChatEntity, tagName: string, parent = "root"): Promise<void> => {
		if (!session) return;

		try {
			const currentTags = chatEntity.metadata?.tags || [];
			const hasExistingTag = currentTags.some((tag: any) => tag.name === tagName);
			
			let updatedTags;
			if (hasExistingTag) {
				// Remove the tag
				updatedTags = currentTags.filter((tag: any) => tag.name !== tagName);
			} else {
				// Add the tag
				updatedTags = [...currentTags, { name: tagName, parent }];
			}

			const metadata = {
				tags: updatedTags,
			};

			await updateChatEntityMetadata(session, chatEntity.id, metadata);

			// Update the cache
			queryClient.setQueryData(
				["documentChatEntityList", session, activeProject],
				(oldData: any) => {
					if (!oldData) return oldData;
					return oldData.map((chat: any) => 
						chat.id === chatEntity.id 
							? { ...chat, metadata }
							: chat,
					);
				},
			);

			// If this was the active chat, update that too
			if (activeChatEntity?.id === chatEntity.id) {
				setActiveChatEntity({ 
					...activeChatEntity, 
					metadata,
					id: activeChatEntity.id,
					project_id: activeChatEntity.project_id,
					chat_name: activeChatEntity.chat_name,
					created_at: activeChatEntity.created_at,
				});
			}

			toast({
				title: "Success",
				description: hasExistingTag ? `Removed from ${tagName}` : `Added to ${tagName}`,
			});
		} catch {
			toast({
				title: "Error",
				description: "Failed to update tags",
				variant: "destructive",
			});
		}
	};

	const addCustomTag = async(chatEntity: AgentChatEntity, tagName: string): Promise<void> => {
		if (!session || !tagName.trim() || hasTag(chatEntity, tagName.trim())) return;
		
		const cleanTagName = tagName.trim().toLowerCase();
		await toggleTag(chatEntity, cleanTagName);
		setNewTagName("");
		setTagInputChatId(null);
	};

	const removeTag = async(chatEntity: AgentChatEntity, tagName: string): Promise<void> => {
		if (!session) return;
		await toggleTag(chatEntity, tagName);
	};

	const handleTagInputKeyDown = (e: React.KeyboardEvent, chatEntity: AgentChatEntity) => {
		if (e.key === "Enter" && newTagName.trim()) {
			addCustomTag(chatEntity, newTagName);
		}
		if (e.key === "Escape") {
			setTagInputChatId(null);
			setNewTagName("");
		}
	};

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

	// Filter chat entities based on search query and selected category
	const filteredChatEntities = chatEntities?.filter((chatEntity) => {
		// First filter by search query
		const matchesSearch = chatEntity.chat_name.toLowerCase().includes(searchQuery.toLowerCase());
		
		// Then filter by category
		let matchesCategory = true;
		if (selectedCategory === "favorites") {
			matchesCategory = hasTag(chatEntity, "favorites");
		} else if (selectedCategory === "meeting") {
			matchesCategory = hasTag(chatEntity, "meeting");
		}
		// "all" category shows all chats regardless of tags
		
		// Filter by selected custom tag
		let matchesCustomTag = true;
		if (selectedCustomTag) {
			matchesCustomTag = hasTag(chatEntity, selectedCustomTag);
		}
		
		return matchesSearch && matchesCategory && matchesCustomTag;
	}) || [];

	const customTags = getAllCustomTags();

	const handleCreateNewChat = () => {
		setActiveChatEntity(null);
		setLocalChats([]);
		setIsWaitingForResponse(false);
		
		// Reset chat store state for new chat
		resetForNewChat();
		
		// Set app view and navigate to agent page
		setAppView("agent");
		if (activeProject) {
			router.push(`/project/${activeProject.project_id}/agent`);
		}
		
		onCreateNewChat?.();
	};

	const handleSelectChatEntity = async(chatEntity: any) => {
		setIsWaitingForResponse(false);
		setActiveChatEntity(chatEntity);
		
		// Clear context and reset chat directive type when switching chats
		clearChatContext();
		setChatDirectiveType("chat");
		
		// Set app view to AI Chat when selecting a chat
		setAppView("agent");
		
		// Navigate to agent page
		if (activeProject) {
			router.push(`/project/${activeProject.project_id}/agent`);
		}
		
		// Manually fetch chats for this entity
		if (session && chatEntity.id) {
			try {
				const chats = await getAgentChats(session, chatEntity.id);
				setLocalChats(chats);
				
				// Optional: Update React Query cache
				queryClient.setQueryData(
					["agentChats", chatEntity.id],
					chats,
				);
			} catch (error) {
				console.error("Failed to fetch chats:", error);
				toast({
					title: "Error",
					description: "Failed to load chat history",
					variant: "destructive",
				});
			}
		}
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
		} catch {
			toast({
				title: "Error",
				description: "Failed to update chat name",
				variant: "destructive",
			});
		}
	};



	return (
		<div className={`absolute top-0 h-full bg-gray-50 shadow-lg z-50 flex flex-col transition-all ${isVisible ? "left-0 w-96 duration-600" : "-left-96 w-0 duration-1000"}`}>
			{/* Header */}
			<div className="p-6 pb-4">
				{/* New Task Button - Expanded */}
				<Button
					className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg flex items-center justify-center gap-3 mb-6 shadow-sm"
					onClick={handleCreateNewChat}
					variant="outline"
				>
					<Plus className="h-5 w-5" />
					<span className="font-medium">New Chat</span>
					<div className="ml-auto flex gap-1">
						<kbd className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-500">Ctrl</kbd>
						<kbd className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-500">K</kbd>
					</div>
				</Button>
				<div className="flex gap-2 mb-4">
					<Button
						className={`px-4 py-2 text-sm font-medium rounded-full ${
							selectedCategory === "all" 
								? "bg-gray-900 text-white" 
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setSelectedCategory("all")}
						variant="ghost"
					>
						All
					</Button>
					<Button
						className={`px-4 py-2 text-sm font-medium rounded-full ${
							selectedCategory === "favorites" 
								? "bg-gray-900 text-white" 
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setSelectedCategory("favorites")}
						variant="ghost"
					>
						Favorites
					</Button>
					<Button
						className={`px-4 py-2 text-sm font-medium rounded-full ${
							selectedCategory === "meeting" 
								? "bg-gray-900 text-white" 
								: "text-gray-500 hover:text-gray-700"
						}`}
						onClick={() => setSelectedCategory("meeting")}
						variant="ghost"
					>
						Meeting
					</Button>
				</div>
				{/* Custom Tags Filter */}
				{customTags.length > 0 && (
					<div className="mb-4">
						<p className="text-xs font-medium text-gray-500 mb-2">Filter by tags:</p>
						<div className="flex flex-wrap gap-1">
							{selectedCustomTag && (
								<Button
									className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full"
									onClick={() => setSelectedCustomTag(null)}
									variant="ghost"
								>
									Clear filter ×
								</Button>
							)}
							{customTags.map((tag) => (
								<Button
									className={`px-2 py-1 text-xs rounded-full ${
										selectedCustomTag === tag
											? "bg-gray-900 text-white"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									}`}
									key={tag}
									onClick={() => {
										setSelectedCustomTag(selectedCustomTag === tag ? null : tag);
										setSelectedCategory("all"); // Reset category when filtering by custom tag
									}}
									variant="ghost"
								>
									{tag}
								</Button>
							))}
						</div>
					</div>
				)}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						className="pl-10 h-10 bg-white border-gray-200 rounded-lg"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search chats..."
						value={searchQuery}
					/>
				</div>
			</div>
			<ScrollArea className="flex-1 px-6">
				<div className="pb-6">
					{filteredChatEntities && [...filteredChatEntities].map((chatEntity, index, array) => {
						const isEditing = editingChatId === chatEntity.id;
						const isActive = chatEntity.id === activeChatEntity?.id;

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
							<div className="w-80" key={chatEntity.id}>
								{dateLabel && (
									<div className="text-xs font-medium text-gray-500 m-3 first:mt-0 w-32">
										{dateLabel}
									</div>
								)}
								<div
									className={`group cursor-pointer p-4 rounded-lg mb-2 transition-all duration-200 ${
										isActive
											? "bg-white shadow-sm border border-gray-200"
											: "hover:bg-white hover:shadow-sm"
									}`}
									onClick={() => !isEditing && handleSelectChatEntity(chatEntity)}
								>
									<div className="flex items-start gap-3">
										<div className={`p-2 rounded-lg ${isActive ? "bg-gray-900" : "bg-gray-200"}`}>
											<MessageSquare className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-600"}`} />
										</div>
										<div className="flex-1 min-w-0">
											{isEditing ? (
												<Input
													autoFocus
													className="h-8 text-sm font-semibold"
													onBlur={handleEditSubmit}
													onChange={(e) => setEditedName(e.target.value)}
													onKeyDown={handleKeyDown}
													value={editedName}
												/>
											) : (
												<>
													<h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
														{chatEntity.chat_name}
													</h3>
													{/* Display existing tags */}
													{chatEntity.metadata?.tags && chatEntity.metadata.tags.length > 0 && (
														<div className="flex flex-wrap gap-1 mt-2">
															{chatEntity.metadata.tags.map((tag, index) => (
																<span
																	className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
																		tag.name === "favorites" 
																			? "bg-yellow-100 text-yellow-800" 
																			: tag.name === "meeting"
																				? "bg-blue-100 text-blue-800"
																				: "bg-gray-100 text-gray-700"
																	}`}
																	key={index}
																>
																	{tag.name}
																	<X 
																		className="h-3 w-3 cursor-pointer hover:text-red-500" 
																		onClick={(e) => {
																			e.stopPropagation();
																			removeTag(chatEntity, tag.name);
																		}}
																	/>
																</span>
															))}
														</div>
													)}
													{/* Tag input */}
													{tagInputChatId === chatEntity.id ? (
														<div className="flex items-center gap-1 mt-2">
															<Input
																autoFocus
																className="h-6 text-xs flex-1"
																onBlur={() => {
																	if (newTagName.trim()) {
																		addCustomTag(chatEntity, newTagName);
																	} else {
																		setTagInputChatId(null);
																		setNewTagName("");
																	}
																}}
																onChange={(e) => setNewTagName(e.target.value)}
																onKeyDown={(e) => handleTagInputKeyDown(e, chatEntity)}
																placeholder="Add tag..."
																value={newTagName}
															/>
															<Button
																className="h-6 w-6 p-0"
																onClick={() => addCustomTag(chatEntity, newTagName)}
																variant="ghost"
															>
																<Check className="h-3 w-3 text-green-500" />
															</Button>
														</div>
													) : null}
													<div className="flex items-center justify-between mt-2">
														<div className="flex gap-1">
															<Button
																className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
																onClick={(e) => {
																	e.stopPropagation();
																	toggleTag(chatEntity, "favorites");
																}}
																variant="ghost"
															>
																<Star 
																	className={`h-3.5 w-3.5 ${
																		hasTag(chatEntity, "favorites") 
																			? "text-yellow-500 fill-yellow-500" 
																			: "text-gray-400"
																	}`} 
																/>
															</Button>
															<Button
																className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
																onClick={(e) => {
																	e.stopPropagation();
																	setTagInputChatId(chatEntity.id);
																	setNewTagName("");
																}}
																variant="ghost"
															>
																<Tag className="h-3.5 w-3.5 text-gray-500" />
															</Button>
															<Button
																className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
																onClick={(e) => {
																	e.stopPropagation();
																	setEditingChatId(chatEntity.id);
																	setEditedName(chatEntity.chat_name);
																}}
																variant="ghost"
															>
																<Pencil className="h-3.5 w-3.5 text-gray-500" />
															</Button>
														</div>
													</div>
												</>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})}
					{filteredChatEntities && filteredChatEntities.length === 0 && !chatsLoading && (
						<div className="text-center py-12">
							<MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
							<h3 className="text-sm font-medium text-gray-900 mb-2">No chats found</h3>
							<p className="text-xs text-gray-500 mb-6">
								{searchQuery ? "Try adjusting your search terms" : "Ready to be your sidekick! Drop a message and let's make some magic happen ✨"}
							</p>
							{searchQuery && (
								<Button
									className="text-xs"
									onClick={() => setSearchQuery("")}
									variant="outline"
								>
									Clear search
								</Button>
							)}
						</div>
					)}
					{chatsLoading && (
						<div className="text-center py-12">
							<div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
							<p className="text-sm text-gray-500">Loading chats...</p>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}