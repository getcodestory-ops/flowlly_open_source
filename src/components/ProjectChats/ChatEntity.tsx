import React, { useState } from "react";
import {
  Flex,
  TableContainer,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  Tooltip,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { useStore } from "@/utils/store";
import { IoIosExpand } from "react-icons/io";
import RegisterPhoneChats from "./RegisterPhoneChats";

function ChatEntity() {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const { session, activeChatEntity, setActiveChatEntity, activeProject } =
    useStore((state) => ({
      session: state.session,
      activeChatEntity: state.activeChatEntity,
      setActiveChatEntity: state.setActiveChatEntity,
      activeProject: state.activeProject,
    }));

  const { data: chatEntitities, isLoading: chatsLoading } = useQuery({
    queryKey: ["chatEntityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      return getAgentChatEntities(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  return (
    <TableContainer mt={"4"}>
      <Table variant="unstyled">
        <Thead>
          <Tr>
            <Th>Chat Name</Th>
            <Th>Chat Details</Th>
            <Th>Add Memeber to Chat</Th>
          </Tr>
        </Thead>
        <Tbody>
          {chatEntitities &&
            chatEntitities.map((chatEntity, index) => (
              <Tr
                key={chatEntity.id}
                onClick={() => setActiveChatEntity(chatEntity)}
                gap="4"
                fontSize={"14px"}
              >
                <Td>{chatEntity.chat_name}</Td>

                <Td>{chatEntity.chat_details}</Td>

                <Td cursor={"pointer"} onClick={() => setIsOpen(true)}>
                  <IoIosExpand />
                  <RegisterPhoneChats isOpen={isOpen} onClose={onClose} />
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default ChatEntity;
