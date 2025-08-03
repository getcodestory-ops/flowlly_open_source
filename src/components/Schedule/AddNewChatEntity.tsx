import React, { useState } from "react";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { useChatStore } from "@/hooks/useChatStore";
import { createChatEntity } from "@/api/agentRoutes";

function AddNewChatEntity({ onComplete }: { onComplete?: () => void }) {
	const { session, activeProject, setActiveChatEntity } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
		setActiveChatEntity: state.setActiveChatEntity,
	}));
	const { toast } = useToast();

	const [chatName, setChatName] = useState("");
	const [chatDescription, setChatDescription] = useState("");
	const queryClient = useQueryClient();
	const { setSelectedContexts, setChatDirectiveType } = useChatStore();

	const mutation = useMutation({
		mutationFn: () => {
			if (!session || !activeProject) {
				toast({
					variant: "destructive",
					title: "Error",
					description: "No session or active project",
				});
				return Promise.reject("No session or active project");
			}
			return createChatEntity(session, {
				project_id: activeProject.project_id,
				chat_name: chatName,
				chat_details: chatDescription,
			});
		},
		onError: (error) => {
			console.error(error);
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Chat entity created",
			});
			queryClient.invalidateQueries({ queryKey: ["chatEntityList"] });
			// Clear input fields after success
			setChatName("");
			setChatDescription("");
		},
	});

	return (
		<Button
			onClick={() => {
				setActiveChatEntity(null);
				setSelectedContexts("untitled", []);
				setChatDirectiveType("chat");
				if (onComplete) {
					onComplete();
				}
			}}
		>
      New Chat
		</Button>
	);
}

export default AddNewChatEntity;
