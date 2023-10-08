import {
  Flex,
  Stack,
  Text,
  Select,
  Textarea,
  InputGroup,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useStore } from "@/utils/store";
import ChatMessageDisplay from "@/components/ChatMessageDisplay";
import {
  getContext,
  getAnswer,
  getContexualAnswer,
} from "@/utils/getAiAnswers";
import { createNewChatSession, getChatHistory } from "@/api/chatRoutes";
import { getFirstFiveWords } from "@/utils/getFirstWords";
import { getBrains } from "@/api/brainRoutes";

function SearchInterface() {
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
  }));

  useEffect(() => {
    if (!folderList) return;
    setSelectedContext(folderList?.[0] ?? null);
  }, [folderList]);

  const handleChatSubmit = async () => {
    const activeChatIndex = chatMessages.length + 1;
    setChatMessages(chatInput, "question", activeChatIndex);
    let newChatSession = null;
    if (!chatSession) {
      const chatTitle = getFirstFiveWords(chatInput);
      newChatSession = await createNewChatSession(sessionToken!, chatTitle);
      setChatSession(newChatSession);
      setChatSessions([newChatSession, ...chatSessions]);
    }

    // setChatMessages([], "context", activeChatIndex + 1);
    try {
      const context = await getContext(
        sessionToken!,
        chatInput,
        selectedContext!
      );

      setChatMessages(context, "context", activeChatIndex + 1);
    } catch (error: any) {
      console.log(error);
    }

    try {
      // const activeChatIndex = chatMessages.length + 1;

      setChatMessages("loading...", "answer", activeChatIndex + 2);

      const response = await getContexualAnswer(
        sessionToken!,
        newChatSession?.chat_id! ?? chatSession?.chat_id!,
        selectedContext?.id!,
        chatInput
      );

      // const data = await response.json();
      // console.log(data);
      if (response) {
        setChatMessages(response.assistant, "answer", activeChatIndex + 2);
      } else {
        setChatMessages(
          "Something went wrong !",
          "answer",
          activeChatIndex + 2
        );
      }
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
        const messages = chats
          .filter((message: any) => message.item_type === "MESSAGE")
          .map((message: any, index: number) => {
            setChatMessages(message.body.user_message, "question");
            setChatMessages(message.body.assistant, "answer");
          });
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchChatHistory();
  }, [sessionToken, chatSession]);

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
      bg="brand.dark"
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
          <Flex justifyContent={"end"} alignItems="center" pl="2" fontSize="xs">
            <Text color="brand.light" mr="4">
              Search folder
            </Text>

            <Select
              color="brand.accent"
              placeholder="Search within"
              value={selectedContext?.name ?? ""}
              border="none"
              width="48"
              fontSize={"xs"}
              fontWeight="bold"
              onChange={(e) =>
                setSelectedContext(
                  folderList?.filter(
                    (folder) => folder.name === e.target.value
                  )?.[0] ?? null
                )
              }
            >
              {folderList?.map((option) => (
                <option
                  key={option?.name}
                  value={option?.name}
                  style={{ backgroundColor: "#393E46" }}
                >
                  {option?.name}
                </option>
              ))}
            </Select>
          </Flex>
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

export default SearchInterface;
