import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { useToast } from "@chakra-ui/react";
import { getAgentChatHistoryItem } from "@/api/agentRoutes";

export const useAiActionForm = (historyId?: string | string[]) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { session } = useStore((state) => ({
    session: state.session,
  }));

  const { data: chatData, isLoading: membersLoading } = useQuery({
    queryKey: ["chatHistoryItem", session, historyId],
    queryFn: async () => {
      if (!session || !historyId || typeof historyId !== "string") {
        return Promise.reject("No session or active project");
      }

      return getAgentChatHistoryItem(session, historyId);
    },
    enabled: !!session?.access_token,
  });

  return chatData;
};
