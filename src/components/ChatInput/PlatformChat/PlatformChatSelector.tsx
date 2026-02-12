import React, { useState, useEffect } from "react";
import { useStore, useViewStore } from "@/utils/store";
import { Plus, ChevronDown, MessageSquare, History } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformChatEntities } from "@/api/agentRoutes";
import AddNewPlatformChatEntity from "./AddNewPlatformChatEntity";
import { getCachedChatEntities, setCachedChatEntities } from "@/utils/chatCache";


const PlatformChatSelector = ({
	folderId,
	chatTarget,
}: {
  folderId: string;
  chatTarget?: string;
}) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const relationType = chatTarget ?? "folder";
	const { activeChatEntity, setActiveChatEntity, activeProject, session } =
    useStore((state) => ({
    	activeChatEntity: state.activeChatEntity,
    	setActiveChatEntity: state.setActiveChatEntity,
    	activeProject: state.activeProject,
    	session: state.session,
    }));

	const { tabs, setActiveTab } = useChatStore();
	const chatLayoutMode = useViewStore((s) => s.chatLayoutMode);

	const chatEntityQueryKey = ["documentChatEntityList", session, activeProject];

	useEffect(() => {
		if (!activeProject?.project_id || !folderId) return;
		let cancelled = false;

		(async() => {
			try {
				const cached = await getCachedChatEntities(
					activeProject.project_id,
					folderId,
					relationType,
				);
				if (!cancelled && cached?.length) {
					queryClient.setQueryData(chatEntityQueryKey, cached);
				}
			} catch {
				// best effort cache
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [activeProject?.project_id, relationType, folderId, queryClient, session]);

	const { data: chatEntities, isLoading: chatsLoading } = useQuery({
		queryKey: chatEntityQueryKey,
		queryFn: async() => {
			if (!session || !activeProject) {
				return Promise.reject("No session or active project");
			}
			const entities = await getPlatformChatEntities(
				session,
				activeProject.project_id,
				folderId,
				chatTarget,
			);
			await setCachedChatEntities(
				activeProject.project_id,
				folderId,
				relationType,
				entities,
			);
			return entities;
		},
	});

	return (
		<div className="flex items-center gap-3">
			<AddNewPlatformChatEntity
				folderId={folderId}
				onComplete={() => setIsOpen(false)}
				relationType={chatTarget}
			/>
			<DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						className="bg-white hover:bg-slate-100 border-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
						size="sm"
						variant="outline"
					>
						<History className="h-4 w-4" />
						<span>History</span>
						<ChevronDown className="h-3.5 w-3.5 opacity-70 ml-1" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-64 p-0 border border-slate-200 shadow-lg rounded-lg">
					<div className="p-3 bg-slate-50 border-b border-slate-200">
						<h3 className="font-medium text-sm text-slate-800">Chat History</h3>
					</div>
					<ScrollArea className="h-[60vh] py-2">
						{chatEntities && chatEntities.length > 0 ? (
							chatEntities.reverse().map((chatEntity, index) => (
								<DropdownMenuItem
									className={`px-3 py-2 cursor-pointer transition-colors ${
										chatEntity.id === activeChatEntity?.id
											? "bg-slate-100"
											: "hover:bg-slate-50"
									}`}
									key={`chat-${chatEntity.id}-index-${index}`}
									onSelect={() => {
										setActiveChatEntity(chatEntity);
										setIsOpen(false);
										// Auto-switch to chat tab in focus mode
										if (chatLayoutMode === "agent") {
											const chatTab = tabs.find((t) => t.type === "chat");
											if (chatTab) setActiveTab(chatTab.id);
										}
									}}
								>
									<div className="flex items-center gap-2 w-full">
										<MessageSquare className="h-4 w-4 text-slate-500" />
										<span
											className={`text-sm ${
												chatEntity.id === activeChatEntity?.id
													? "font-medium text-slate-800"
													: "text-slate-700"
											}`}
										>
											{chatEntity.chat_name}
										</span>
									</div>
								</DropdownMenuItem>
							))
						) : (
							<div className="px-3 py-2 text-sm text-slate-500 text-center">
								{chatsLoading ? "Loading chats..." : "No chat history found"}
							</div>
						)}
					</ScrollArea>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default PlatformChatSelector;
