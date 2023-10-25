import React, { useState, useEffect } from "react";
import {
  Flex,
  Button,
  Box,
  Icon,
  VStack,
  Text,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import ContextSelection from "@/components/ChatInput/ContextSelection";
import ScheduleAssistant from "@/components/Schedule/ScheduleAssistant";
import { FiPlus } from "react-icons/fi";
import AddNewActivityModal from "@/components/Schedule/AddNewActivityModal";
import { AgentInterfaceProps } from "@/types/agent";
import CSVUploader from "./CSVUpload/CSVUploader";
import { useStore } from "@/utils/store";
import { scheduleAgent } from "@/api/schedule_routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentChats } from "@/api/agentRoutes";

function ScheduleChatInterface() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [chatInput, setChatInput] = useState<string>("");
  const session = useStore((state) => state.session);
  const selectedContext = useStore((state) => state.selectedContext);
  const activeProject = useStore((state) => state.activeProject);
  const [agentResponse, setAgentResponse] =
    useState<AgentInterfaceProps | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const { mutate, isPending, data } = useMutation({
    mutationFn: scheduleAgent,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agentChats"] });
    },
  });

  const { data: chats, isLoading } = useQuery({
    queryKey: ["agentChats", session, activeProject?.project_id],
    queryFn: () => {
      if (!session) {
        toast({
          title: "Error",
          description: "Please refresh the page and try again!",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return Promise.reject("refresh session");
      }
      if (!activeProject) {
        toast({
          title: "Warning",
          description: "Select a project to start!",
          status: "warning",
          duration: 1000,
          isClosable: true,
        });
        return Promise.reject("select a project");
      }

      return getAgentChats(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  useEffect(() => {
    if (!chats) return;
    setAgentResponse({ agent_history: chats.map((chat) => chat.message) });
  }, [chats]);

  const handleChatSubmit = async () => {
    if (!session || !selectedContext || !activeProject || !selectedContext.id)
      return;

    mutate({
      session,
      agentTask: chatInput,
      brainId: selectedContext.id,
      projectId: activeProject.project_id,
    });
  };

  return (
    <Flex
      flex="1"
      mx={16}
      justifyContent={"end"}
      direction="column"
      bg="brand.dark"
      color="white"
      maxH={{ base: "80%", md: "100%" }}
    >
      <VStack
        alignSelf={"center"}
        align="start"
        spacing={4}
        overflowY={"scroll"}
        p="8"
        maxW="4xl"
        maxH={"85vh"}
      >
        {chats &&
          chats?.map((history, index) => (
            <Box
              key={index}
              p={4}
              color="white"
              fontSize={"lg"}
              lineHeight="1.5"
              bg="brand.mid"
              borderRadius="14px"
              whiteSpace="pre-line"
            >
              <Text color="brand.accent">{`${history.sender}`}</Text>
              {history.message.content && (
                <Box fontSize="lg" lineHeight="1.5">
                  {history.message.content
                    ?.split("/n")
                    .map((line: string, i: number) => (
                      <Box key={i} mb="2" whiteSpace="pre-line">
                        {line}
                      </Box>
                    ))}
                </Box>
              )}
              {history.message.function_call && (
                <Text fontSize="lg" whiteSpace="pre-line">
                  Function: {history.message.function_call.name} <br />
                  Arguments: {history.message.function_call.arguments}
                </Text>
              )}
            </Box>
          ))}
        {isPending && <Spinner />}
      </VStack>

      {!activeProject && (
        <Flex height="full" justify={"center"} align={"center"}>
          Select a project to start
        </Flex>
      )}
      {activeProject && (
        <>
          <Box
            display="flex"
            alignItems="center"
            bg="brand.md"
            p={2}
            borderRadius="md"
          >
            <AddNewActivityModal isOpen={isOpen} onClose={onClose} />
          </Box>
          <Flex
            flexDirection={"column"}
            p="8"
            alignSelf={"center"}
            width="100%"
          >
            <Flex justifyContent={"space-between"}>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                color="white"
                variant="outline"
                borderColor="white"
                maxWidth="xs"
                _hover={{ bg: "gray.600" }}
                onClick={onOpen}
              >
                New Activity
              </Button>
              <CSVUploader />
              <ContextSelection />
            </Flex>
            <ScheduleAssistant
              handleChatSubmit={handleChatSubmit}
              setChatInput={setChatInput}
              chatInput={chatInput}
            />
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default ScheduleChatInterface;
