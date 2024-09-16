import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Notification } from "@/types/notification";
import { getAgentChats } from "@/api/agentRoutes";
import { useStore } from "@/utils/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import { FaCheck } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";
import { updateActivityRevision, rejectRevision } from "@/api/schedule_routes";
import { Revision } from "@/types/activities";
import ChatSenderDisplay from "../ChatInput/ChatSenderDisplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface ScheduleEditThroughNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

function ScheduleEditThroughNotification({
  isOpen,
  onClose,
  notification,
}: ScheduleEditThroughNotificationProps) {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: chats, isLoading } = useQuery({
    queryKey: ["agentChats", session, notification?.chat_id],
    queryFn: () => {
      if (!session) {
        toast({
          title: "Session Error",
          description: "No session found",
        });
        return Promise.reject("refresh session");
      }

      if (!notification?.chat_id) {
        toast({
          title: "Chat Error",
          description: "No chat found",
        });

        return Promise.reject("select a chat");
      }

      return getAgentChats(session, notification?.chat_id);
    },
    enabled: !!session && !!notification?.chat_id,
  });

  const rejectImpact = useMutation({
    mutationFn: (revisionId: string) => {
      if (!session?.access_token || !activeProject) {
        return Promise.reject("No active project or session");
      }
      return rejectRevision(session, activeProject.project_id, revisionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleRevision"] });
      toast({
        title: "Revision Updated",
        description: "Revision Updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const approveImpact = useMutation({
    mutationFn: (revision: { id: string; revision: Revision }) => {
      if (!session?.access_token || !activeProject) {
        return Promise.reject("No active project or session");
      }
      return updateActivityRevision(
        session,
        activeProject.project_id,
        revision
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleRevision"] });
      toast({
        title: "Revision Updated",
        description: "Revision Updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[768px]   overflow-auto max-w-screen-xl w-full">
        <DialogHeader>
          <DialogTitle>Action Items</DialogTitle>
        </DialogHeader>
        {isLoading && <p>Loading...</p>}
        {chats &&
          chats.map((chat) => (
            <div key={chat.id} className="p-2 border-b border-gray-200">
              {chat.message && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <ChatSenderDisplay sender={chat.sender} />
                  </div>
                  {typeof chat.message.content === "string" && (
                    <div className="border-l-2 border-gray-200 ml-2">
                      <MarkdownRenderer content={chat.message.content} />
                    </div>
                  )}
                  {chat.message.content &&
                    chat.message.content.length > 0 &&
                    typeof chat.message.content === "object" &&
                    chat.sender === "Flowlly-schedule-update" && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Impact on Start Date</TableHead>
                            <TableHead>Impact on End Date</TableHead>
                            <TableHead>Approve/Reject</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chat.message.content.map((content, index) => (
                            <TableRow key={index}>
                              <TableCell>{content.name}</TableCell>
                              <TableCell>{content.reason}</TableCell>
                              <TableCell>
                                {content.impact_on_start_date}
                              </TableCell>
                              <TableCell>
                                {content.impact_on_end_date}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {content.revision_id && (
                                    <FaCheck
                                      className="cursor-pointer text-xs"
                                      onClick={() => {
                                        if (content.revision_id) {
                                          approveImpact.mutate({
                                            id: content?.revision_id,
                                            revision: {
                                              impact_on_start_date:
                                                content.impact_on_start_date ??
                                                0,
                                              impact_on_end_date:
                                                content.impact_on_end_date ?? 0,
                                            },
                                          });
                                        }
                                      }}
                                    />
                                  )}
                                  {content.revision_id && (
                                    <VscChromeClose
                                      className="cursor-pointer text-xs"
                                      onClick={() => {
                                        if (content.revision_id) {
                                          rejectImpact.mutate(
                                            content?.revision_id
                                          );
                                        }
                                      }}
                                    />
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                </div>
              )}
            </div>
          ))}
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleEditThroughNotification;
