import React, { useEffect } from "react";
import {
  Flex,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
} from "@chakra-ui/react";
import { Notification } from "@/types/notification";
import { getAgentChats } from "@/api/agentRoutes";
import { useStore } from "@/utils/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import { FaCheck } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";
import {
  getScheduleRevisions,
  updateActivityRevision,
  rejectRevision,
  getScheduleRevisionsById,
} from "@/api/schedule_routes";
import { Revision } from "@/types/activities";
import { FaCircleDot } from "react-icons/fa6";
import ChatSenderDisplay from "../ChatInput/ChatSenderDisplay";

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
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: chats, isLoading } = useQuery({
    queryKey: ["agentChats", session, notification?.chat_id],
    queryFn: () => {
      if (!session) {
        toast({
          title: "Error",
          description: "Please refresh the page and try again!",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return Promise.reject("refresh session");
      }

      if (!notification?.chat_id) {
        toast({
          title: "Warning",
          description: "The notification does not have associated data!",
          status: "warning",
          duration: 1000,
          isClosable: true,
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
        title: "Success",
        description: "Revision Updated",
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
        title: "Success",
        description: "Revision Updated",
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

  //   const ids = chats
  //     ?.map((chat) => {
  //       if (!chat.message.content || typeof chat.message.content == "string")
  //         return;

  //       return chat.message.content.map((content) => content.revision_id);
  //     })
  //     .flat()
  //     .filter((id) => id !== undefined) as string[];

  //   console.log("ids", ids);

  //   const { data: scheduleRevision } = useQuery({
  //     queryKey: ["scheduleRevisionByIds", activeProject, ids],
  //     queryFn: () => {
  //       if (!session?.access_token || !activeProject || !ids) {
  //         toast({
  //           title: "Error",
  //           description: "No active project or session",
  //           status: "error",
  //           duration: 9000,
  //           isClosable: true,
  //         });
  //         return Promise.reject("No active project or session");
  //       }
  //       return getScheduleRevisionsById(session, activeProject.project_id, ids);
  //     },
  //     enabled: !!session?.access_token,
  //   });

  //   useEffect(() => {
  //     if (!scheduleRevision) return;
  //     console.log("scheduleRevision", scheduleRevision);
  //   }, [scheduleRevision]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="3xl" overflow={"scroll"}>
        <ModalHeader>Action Items</ModalHeader>
        <ModalBody>
          {isLoading && <Text>Loading...</Text>}
          {chats &&
            chats.map((chat) => (
              <Flex key={chat.id} p={2} borderBottomWidth="1px">
                {chat.message && (
                  <Flex flexDirection={"column"}>
                    <Flex alignItems={"center"} gap="2">
                      <ChatSenderDisplay sender={chat.sender} />
                    </Flex>
                    {typeof chat.message.content === "string" && (
                      <Flex borderLeft="2px solid #e5e5e5" ml="2">
                        <MarkdownRenderer content={chat.message.content} />
                      </Flex>
                    )}
                    {chat.message.content &&
                      chat.message.content.length > 0 &&
                      typeof chat.message.content === "object" &&
                      chat.sender === "Flowlly-schedule-update" && (
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Name</Th>
                              <Th>Reason</Th>
                              <Th>Impact on Start Date</Th>
                              <Th>Impact on End Date</Th>
                              <Th>Approve/Reject</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {chat.message.content.map((content, index) => (
                              <Tr key={index}>
                                <Td>{content.name}</Td>
                                <Td>{content.reason}</Td>
                                <Td>{content.impact_on_start_date}</Td>
                                <Td>{content.impact_on_end_date}</Td>
                                <Td>
                                  <Flex gap="2">
                                    {content.revision_id && (
                                      <Icon
                                        size="xs"
                                        as={FaCheck}
                                        cursor="pointer"
                                        onClick={() => {
                                          if (content.revision_id) {
                                            approveImpact.mutate({
                                              id: content?.revision_id,
                                              revision: {
                                                impact_on_start_date:
                                                  content.impact_on_start_date ??
                                                  0,
                                                impact_on_end_date:
                                                  content.impact_on_end_date ??
                                                  0,
                                              },
                                            });
                                          }
                                        }}
                                      />
                                    )}
                                    {content.revision_id && (
                                      <Icon
                                        size="xs"
                                        cursor="pointer"
                                        as={VscChromeClose}
                                        onClick={() => {
                                          if (content.revision_id) {
                                            rejectImpact.mutate(
                                              content?.revision_id
                                            );
                                          }
                                        }}
                                      />
                                    )}
                                  </Flex>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}
                  </Flex>
                )}
              </Flex>
            ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ScheduleEditThroughNotification;
