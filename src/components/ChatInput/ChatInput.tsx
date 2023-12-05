import React, { useState } from "react";
import { Box, InputGroup, Textarea, useToast, Flex } from "@chakra-ui/react";
import { Session } from "@supabase/supabase-js";
import { useStore } from "@/utils/store";

interface ChatInputProps {
  setChatRouteResponse: React.Dispatch<React.SetStateAction<any>>;
  chatRouteCallFunction: (
    session: Session,
    agent_task: string,
    brain_id: string
  ) => Promise<any>;
}

function ChatInput({
  setChatRouteResponse,
  chatRouteCallFunction,
}: ChatInputProps) {
  const toast = useToast();
  const [chatInput, setChatInput] = useState<string>("");
  const session = useStore((state) => state.session!);
  const selectedContext = useStore((state) => state.selectedContext!);

  const handleChatSubmit = async () => {
    const data = await chatRouteCallFunction(
      session,
      chatInput,
      selectedContext?.id!
    );

    if (!data) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    } else {
      setChatRouteResponse(data);
    }
  };

  return (
    <Flex w="full" mt={8} color="white">
      <InputGroup size="lg">
        <Textarea
          color="brand.light"
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
          h="auto"
          resize="none"
          overflow={"hidden"}
          height={`${chatInput.length / 20}rem`}
        />
      </InputGroup>
    </Flex>
  );
}

export default ChatInput;
