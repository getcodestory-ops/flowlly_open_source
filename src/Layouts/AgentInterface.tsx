import { useState } from "react";
import { Box, Text, VStack, Flex } from "@chakra-ui/react";

import ChatInput from "@/components/ChatInput/ChatInput";
import { submitTaskToAgent } from "@/api/agentRoutes";
import { AgentInterfaceProps } from "@/types/agent";
import ContextSelection from "@/components/ChatInput/ContextSelection";

const AgentInterface = () => {
  const [agentResponse, setAgentResponse] =
    useState<AgentInterfaceProps | null>(null);

  return (
    <Flex
      flex="1"
      mx={16}
      width="full"
      justifyContent={"end"}
      direction="column"
      bg="brand.accent"
      maxH={{ base: "30%", md: "30%" }}
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
        {agentResponse &&
          agentResponse.agent_history?.map((history, index) => (
            <Flex
              key={index}
              p={4}
              color="white"
              fontSize={"lg"}
              lineHeight="1.5"
              bg="brand.mid"
              borderRadius="14px"
              whiteSpace="pre-line"
            >
              <Text color="brand.accent">{`${history.name ?? "You"} `}</Text>
              {history.content && (
                <Flex fontSize="lg" lineHeight="1.5">
                  {history.content
                    ?.split("/n")
                    .map((line: string, i: number) => (
                      <Flex key={i} mb="2" whiteSpace="pre-line">
                        {line}
                      </Flex>
                    ))}
                </Flex>
              )}
              {history.function_call && (
                <Text fontSize="lg" whiteSpace="pre-line">
                  Function: {history.function_call.name} <br />
                  Arguments: {history.function_call.arguments}
                </Text>
              )}
            </Flex>
          ))}
      </VStack>
      <Flex flexDirection={"column"} p="8" width="4xl" alignSelf={"center"}>
        <ContextSelection />
        <ChatInput
          setChatRouteResponse={setAgentResponse}
          chatRouteCallFunction={submitTaskToAgent}
        />
      </Flex>
    </Flex>
  );
};

export default AgentInterface;
