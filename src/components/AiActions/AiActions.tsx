import React, { useEffect, useState } from "react";
import { Flex, Grid, GridItem, Icon, Button, Tooltip } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { PiRobot } from "react-icons/pi";
import PdfLoader from "../PdfLoader";
import { getBrains } from "@/api/brainRoutes";
import { getChatSessions } from "@/api/chatRoutes";
import { getFirstFiveWords } from "@/utils/getFirstWords";
import { createNewChatSession, getChatHistory } from "@/api/chatRoutes";
import {
  getContext,
  updateContext,
  getContexualAnswer,
} from "@/utils/getAiAnswers";
import ChatComponent from "../ChatInput/ChatComponet";

function AiActions() {
  const [chatInput, setChatInput] = useState("");

  const {
    AiActionsView,
    setAiActionsView,
    sessionToken,
    chatSession,
    chatSessions,
    selectedContext,
    folderList,
    setSelectedContext,
    setChatSessions,
    setChatSession,
    setChatHistory,
    updateChatHistory,
    setFolderList,
    activeProject,
  } = useStore((state) => ({
    AiActionsView: state.AiActionsView,
    setAiActionsView: state.setAiActionsView,
    sessionToken: state.session,
    chatSession: state.chatSession,
    chatSessions: state.chatSessions,
    selectedContext: state.selectedContext,
    setSelectedContext: state.setSelectedContext,
    folderList: state.folderList,
    setChatSessions: state.setChatSessions,
    setChatSession: state.setChatSession,
    setChatHistory: state.setChatHistory,
    updateChatHistory: state.updateChatHistory,
    activeProject: state.activeProject,
    setFolderList: state.setFolderList,
  }));

  useEffect(() => {
    if (!sessionToken || chatSessions.length > 0) return;
    const fetchchat = async () => {
      try {
        if (!activeProject) return;
        const chats = await getChatSessions(
          sessionToken,
          activeProject?.project_id
        );
        setChatSessions(chats);
        setChatSession(chats[0]);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchchat();
  }, [sessionToken]);

  useEffect(() => {
    //console.log("fetching brains");
    const fetchFolderLists = async () => {
      if (!sessionToken || !activeProject?.project_id) return;
      const brains = await getBrains(sessionToken, activeProject.project_id);
      setFolderList(brains || null);
    };

    fetchFolderLists();
  }, [sessionToken, setFolderList, activeProject]);

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
    if (!folderList) return;

    setSelectedContext(folderList?.[0] ?? null);
  }, [folderList, setSelectedContext]);

  const handleChatSubmit = async () => {
    let newChatSession = null;
    //console.log("triggered submit", chatInput, chatSession, selectedContext);
    if (!chatSession) {
      if (!activeProject) return;
      const chatTitle = getFirstFiveWords(chatInput);
      newChatSession = await createNewChatSession(
        sessionToken!,
        chatTitle,
        activeProject.project_id
      );
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
      if (!sessionToken || !chatSession || !selectedContext) return;
      const context = await getContext(
        sessionToken,
        chatSession.chat_id,
        chatInput,
        selectedContext!
      );

      const context_id = context?.context_id;
      newChatItem.body.context = context.context;

      updateChatHistory(chatSession?.chat_id!, [...chatHistory, newChatItem]);

      const assistant_response = await getContexualAnswer(
        sessionToken,
        chatSession.chat_id!,
        selectedContext.id!,
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

  return (
    <Flex w="full" h="full">
      {AiActionsView === "open" && <ChatComponent />}
      {AiActionsView === "close" && (
        <Flex
          h={"full"}
          bgGradient="linear(brand.gray 5%, white 30% )"
          rounded={"2xl"}
          boxShadow={"lg"}
          justifyContent={"center"}
          alignItems={"center"}
          pt={"2"}
        >
          <Tooltip
            label="Expand"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              bg={"white"}
              boxShadow={"md"}
              p={0}
              size={"lg"}
              rounded={"full"}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setAiActionsView("open")}
            >
              <Icon as={PiRobot} />
            </Button>
          </Tooltip>
        </Flex>
      )}
      {AiActionsView === "expand" && (
        <Grid
          h={"full"}
          templateColumns="repeat(14,1fr)"
          gap={"4"}
          visibility={AiActionsView === "expand" ? "visible" : "hidden"}
        >
          <GridItem
            colSpan={14}
            bgGradient="linear(brand.gray 5%, white 30% )"
            rounded={"2xl"}
            boxShadow={"lg"}
            w={"full"}
            h={"full"}
            p={"4"}
          >
            {" "}
            <Flex direction={"column"} h="full">
              <Flex mb={"2"}>
                <Tooltip
                  label="Collapse"
                  aria-label="A tooltip"
                  bg="white"
                  color="brand.dark"
                >
                  <Button
                    bg={"white"}
                    boxShadow={"md"}
                    p={0}
                    size={"sm"}
                    onClick={() => setAiActionsView("open")}
                    rounded={"full"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                  >
                    <Icon as={TbLayoutSidebarLeftExpand} fontWeight={"light"} />
                  </Button>
                </Tooltip>
              </Flex>
              <Flex h="full">
                <PdfLoader />
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      )}
    </Flex>
  );
}

export default AiActions;
