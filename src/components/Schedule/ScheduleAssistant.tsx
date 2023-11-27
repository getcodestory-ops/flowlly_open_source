import React, { useState } from "react";
import { Box, InputGroup, Textarea, useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { scheduleAgent } from "@/api/schedule_routes";
import { useMutation } from "@tanstack/react-query";
import { AgentInterfaceProps } from "@/types/agent";

function ScheduleAssistant({ handleChatSubmit, setChatInput, chatInput }: any) {
  return (
    <Box w="full" color="white">
      <InputGroup size="lg">
        <Textarea
          color="brand.dark"
          placeholder="Type your questions..."
          value={chatInput}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setChatInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleChatSubmit();
            }
          }}
          boxShadow="0px 0px 8px 1px rgba(255,255,255, 0.8)"
          border="1px solid"
          borderColor="brand.dark"
          borderRadius={"40px"}
          _hover={{ boderColor: "brand.dark" }}
          _focus={{
            // outline: "none",
            borderColor: "brand.dark",
            boxShadow: "0px 0px 8px 1px rgba(255,255,255, 0.8)",
          }}
          minH="3rem"
          // h="auto"
          resize="none"
          overflow={"auto"}
          // height={`${chatInput.length / 20}rem`}
        />
      </InputGroup>
    </Box>
  );
}

export default ScheduleAssistant;
