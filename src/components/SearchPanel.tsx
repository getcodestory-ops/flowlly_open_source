import { Flex, Stack, Textarea, InputGroup, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import ChatMessageDisplay from "@/components/ChatMessageDisplay";
import {
  getContext,
  getAnswer,
  updateContext,
  getContexualAnswer,
} from "@/utils/getAiAnswers";
import { createNewChatSession, getChatHistory } from "@/api/chatRoutes";
import { getFirstFiveWords } from "@/utils/getFirstWords";
import { getBrains } from "@/api/brainRoutes";
import ContextSelection from "@/components/ChatInput/ContextSelection";

function SearchPanel() {
  const toast = useToast();

  const [chatInput, setChatInput] = useState("");
  const {
    sessionToken,
    folderList,
    chatMessages,
    setChatMessages,
    selectedContext,
    setSelectedContext,
    chatSession,
    chatSessions,
    setChatSession,
    setChatSessions,
    setChatHistory,
    setFolderList,
    updateChatHistory,
  } = useStore((state) => ({
    sessionToken: state.session,
    folderList: state.folderList,
    chatMessages: state.chatMessages,
    setChatMessages: state.setChatMessages,
    selectedContext: state.selectedContext,
    setSelectedContext: state.setSelectedContext,
    chatSession: state.chatSession,
    chatSessions: state.chatSessions,
    setChatSession: state.setChatSession,
    setChatSessions: state.setChatSessions,
    setChatHistory: state.setChatHistory,
    setFolderList: state.setFolderList,
    updateChatHistory: state.updateChatHistory,
  }));

  useEffect(() => {
    if (!folderList) return;
    setSelectedContext(folderList?.[0] ?? null);
  }, [folderList, setSelectedContext]);

  const handleChatSubmit = async () => {
    let newChatSession = null;
    if (!chatSession) {
      const chatTitle = getFirstFiveWords(chatInput);
      newChatSession = await createNewChatSession(sessionToken!, chatTitle);
      setChatSession(newChatSession);
      setChatSessions([newChatSession, ...chatSessions]);
    }

    const newChatItem = {
      body: {
        user_message: chatInput,
        chat_id: newChatSession?.chat_id! ?? chatSession?.chat_id!,
        context: [],
        assistant: "loading...",
      },
      item_type: "MESSAGE",
    };
    const chatHistory = chatSessions.filter(
      (session) => session.chat_id === chatSession?.chat_id
    )[0]?.chat_history!;

    updateChatHistory(chatSession?.chat_id!, [...chatHistory, newChatItem]);

    try {
      const context = await getContext(
        sessionToken!,
        newChatSession?.chat_id! ?? chatSession?.chat_id!,
        chatInput,
        selectedContext!
      );

      const context_id = context?.context_id;
      newChatItem.body.context = context.context;

      updateChatHistory(chatSession?.chat_id!, [...chatHistory, newChatItem]);

      const assistant_response = await getContexualAnswer(
        sessionToken!,
        newChatSession?.chat_id! ?? chatSession?.chat_id!,
        selectedContext?.id!,
        chatInput
      );

      const message_id = assistant_response?.message_id;
      updateContext(sessionToken!, message_id!, context_id!);

      newChatItem.body.assistant = assistant_response.assistant;
      updateChatHistory(chatSession?.chat_id!, [...chatHistory, newChatItem]);
    } catch (error: any) {
      console.log(error);
    }

    setChatInput("");
  };

  useEffect(() => {
    if (!sessionToken || !chatSession) return;
    const fetchChatHistory = async () => {
      try {
        const chats = await getChatHistory(sessionToken, chatSession.chat_id);
        setChatHistory([]);
        updateChatHistory(chatSession.chat_id, chats);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchChatHistory();
  }, [sessionToken, chatSession, setChatHistory, updateChatHistory]);

  useEffect(() => {
    const fetchFolderLists = async () => {
      if (!sessionToken) return;
      const brains = await getBrains(sessionToken);
      setFolderList(brains || null);
    };

    fetchFolderLists();
  }, [sessionToken, setFolderList]);

  return (
    <Flex
      flex="1"
      direction="column"
      alignItems="start"
      justifyContent="end"
      bg="brand2.light"
      maxH={{ base: "80%", md: "100%" }}
    >
      <ChatMessageDisplay />
      <Stack
        spacing={4}
        pb="4"
        width="2xl"
        alignSelf={"center"}
        w={{ base: "85%", md: "60%" }}
      >
        <Flex justifyContent={"end"} alignItems="center" mb="-4">
          <ContextSelection />
        </Flex>
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
            maxH="12rem"
            height={`${chatInput.length / 40}rem`}
          />
        </InputGroup>
      </Stack>
    </Flex>
  );
}

export default SearchPanel;
