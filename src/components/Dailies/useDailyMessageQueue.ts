import { useToast } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import {
	getDailyMessagesQueue,
	updateQueueMessage,
	deleteQueueMessage,
} from "@/api/taskQueue";

import { Notification } from "@/types/notification";

export const useDailyMessageQueue = () => {
	const toast = useToast();
	const queryClient = useQueryClient();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);

	const { data: dailyMessageQueue, isLoading } = useQuery({
		queryKey: ["dailyMessageQueue", activeProject],
		queryFn: () => {
			if (!session?.access_token || !activeProject) {
				toast({
					title: "Error",
					description: "No active project or session",
					status: "error",
					duration: 9000,
					isClosable: true,
				});
				return Promise.reject("No active project or session");
			}
			return getDailyMessagesQueue(session, activeProject.project_id);
		},
		enabled: !!session?.access_token,
	});

	const mutation = useMutation({
		mutationFn: (notification: Notification) => {
			if (!session?.access_token || !activeProject) {
				return Promise.reject("No active project or session");
			}
			return updateQueueMessage(
				session,
				activeProject.project_id,
				notification,
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dailyMessageQueue"] });
			toast({
				title: "Success",
				description: "Message updated!",
				status: "success",
				duration: 9000,
				isClosable: true,
			});
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message,
				status: "error",
				duration: 9000,
				isClosable: true,
			});
		},
	});

	const { mutate: deleteMessage } = useMutation({
		mutationFn: (id: string) => {
			if (!session?.access_token || !activeProject) {
				return Promise.reject("No active project or session");
			}
			return deleteQueueMessage(session, activeProject.project_id, id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dailyMessageQueue"] });
			toast({
				title: "Success",
				description: "Message deleted!",
				status: "success",
				duration: 9000,
				isClosable: true,
			});
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message,
				status: "error",
				duration: 9000,
				isClosable: true,
			});
		},
	});

	const updateMessage = (notification: Notification) => {
		mutation.mutate(notification);
	};

	return {
		dailyMessageQueue,
		deleteMessage,
		updateMessage,
	};
};
