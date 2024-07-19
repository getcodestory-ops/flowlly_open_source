import React, { useState, useEffect } from "react";
import {
  Grid,
  GridItem,
  Flex,
  Button,
  Icon,
  Select,
  Tooltip,
} from "@chakra-ui/react";
import SearchMemory from "@/Layouts/SearchMemory";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { useStore } from "@/utils/store";
import { getFirstFiveWords } from "@/utils/getFirstWords";
import { createNewChatSession, getChatHistory } from "@/api/chatRoutes";
import {
  getContext,
  updateContext,
  getContexualAnswer,
} from "@/utils/getAiAnswers";
import AssistantChatInterface from "../Schedule/AssistantChatInterface";
import AssistantChatSelector from "../Schedule/AssistantChatSelector";

function ChatComponent() {
  const [chatInput, setChatInput] = useState("");
  const [chatType, setChatType] = useState<string>("schedule");
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
    if (!folderList) return;

    setSelectedContext(folderList?.[0] ?? null);
  }, [folderList, setSelectedContext]);

  const handleChatSubmit = async () => {
    let newChatSession = null;
    //console.log("chatSession", chatSession, selectedContext, folderList);

    if (!chatSession) {
      if (!activeProject) return;
      const chatTitle = getFirstFiveWords(chatInput);
      newChatSession = await createNewChatSession(
        sessionToken!,
        chatTitle,
        activeProject?.project_id
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

    if (chatHistory && chatHistory.length > 0) {
      updateChatHistory(chatSession?.chat_id!, [...chatHistory, newChatItem]);
    } else {
      updateChatHistory(chatSession?.chat_id!, [newChatItem]);
    }

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
    <Grid
      h={"full"}
      w="full"
      bgGradient="linear(brand.gray 5%, white 30% )"
      rounded={"2xl"}
      boxShadow={"lg"}
      visibility={AiActionsView === "open" ? "visible" : "hidden"}
    >
      <GridItem rowSpan={1} px={"4"} pt={"4"}>
        <Flex direction={"column"}>
          {/* <Flex direction={"column"} h={"full"} justifyContent={"flex-end"}> */}
          <Flex alignItems={"center"} mb={"2"} justifyContent={"space-between"}>
            <Flex fontSize={"22px"} fontWeight={"bold"}>
              AI Actions
            </Flex>
            <Flex alignItems={"center"}>
              <Flex mr={"4"}>
                {chatType == "search" && <SearchMemory />}
                {chatType == "schedule" && <AssistantChatSelector />}
              </Flex>
              <Flex>
                {folderList && folderList.length > 0 && (
                  <Select
                    size={"xs"}
                    bg={"white"}
                    border={"white"}
                    rounded={"lg"}
                    placeholder={"Folder or File"}
                    className="custom-selector"
                    value={selectedContext?.id}
                    onChange={(e) =>
                      setSelectedContext(
                        folderList.filter(
                          (folder) => folder.id === e.target.value
                        )?.[0] ?? null
                      )
                    }
                  >
                    {folderList.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Flex>

              {/* <Tooltip
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
                  onClick={() => setAiActionsView("close")}
                  rounded={"full"}
                  _hover={{ bg: "brand.dark", color: "white" }}
                >
                  <Icon as={TbLayoutSidebarLeftExpand} fontWeight={"light"} />
                </Button>
              </Tooltip> */}
            </Flex>
          </Flex>
        </Flex>
      </GridItem>

      <GridItem
        rowSpan={7}
        flexDirection="column"
        px={"2"}
        overflow={"auto"}
        className="custom-scrollbar"
        h="full"
        w="full"
      >
        {chatType === "schedule" && (
          <Grid templateRows="repeat(10, 1fr)" gap={"2"} h="full">
            <AssistantChatInterface />
          </Grid>
        )}
      </GridItem>
    </Grid>
  );
}

export default ChatComponent;
