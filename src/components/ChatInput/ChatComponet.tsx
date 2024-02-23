import React, { useState, useEffect } from "react";
import {
  Grid,
  GridItem,
  Flex,
  Button,
  Icon,
  Select,
  Input,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import SearchMemory from "@/Layouts/SearchMemory";
import ChatMessageDisplay from "../ChatMessageDisplay";
import {
  TbLayoutSidebarLeftExpand,
  TbLayoutSidebarRightExpand,
} from "react-icons/tb";
import { useStore } from "@/utils/store";
import { getFirstFiveWords } from "@/utils/getFirstWords";
import { createNewChatSession, getChatHistory } from "@/api/chatRoutes";
import {
  getContext,
  getAnswer,
  updateContext,
  getContexualAnswer,
} from "@/utils/getAiAnswers";
import { BsSend } from "react-icons/bs";

function ChatComponent() {
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
      templateRows="repeat(8, 1fr)"
      bgGradient="linear(brand.gray 5%, white 30% )"
      rounded={"2xl"}
      boxShadow={"lg"}
      visibility={AiActionsView === "open" ? "visible" : "hidden"}
    >
      {!folderList || folderList.length === 0 ? (
        <>
          <GridItem rowSpan={1} pt={"4"} px={"4"}>
            <Flex fontSize={"22px"} fontWeight={"bold"}>
              AI Actions
            </Flex>
          </GridItem>
          <GridItem rowSpan={7}>
            <Flex justifyContent={"center"} px={"10"}>
              <Text fontSize={"28"} fontWeight={"bold"} color={"gray.400"}>
                To start using AI Actions, go to project settings, add a new
                folder and upload a document.
              </Text>
            </Flex>
          </GridItem>
        </>
      ) : (
        <>
          <GridItem rowSpan={1} px={"4"} pt={"4"}>
            <Flex direction={"column"} h={"full"}>
              {/* <Flex direction={"column"} h={"full"} justifyContent={"flex-end"}> */}
              <Flex
                alignItems={"center"}
                mb={"2"}
                justifyContent={"space-between"}
              >
                <Flex fontSize={"22px"} fontWeight={"bold"}>
                  AI Actions
                </Flex>
                <Flex alignItems={"center"}>
                  <Flex mr={"4"}>
                    <SearchMemory />
                  </Flex>
                  {/* <Button
                    bg={"white"}
                    boxShadow={"md"}
                    p={0}
                    size={"sm"}
                    onClick={() => setAiActionsView("expand")}
                    rounded={"full"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                  >
                    <Icon
                      as={TbLayoutSidebarRightExpand}
                      fontWeight={"light"}
                    />
                  </Button> */}
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
                      onClick={() => setAiActionsView("close")}
                      rounded={"full"}
                      _hover={{ bg: "brand.dark", color: "white" }}
                    >
                      <Icon
                        as={TbLayoutSidebarLeftExpand}
                        fontWeight={"light"}
                      />
                    </Button>
                  </Tooltip>
                </Flex>
              </Flex>
              <Flex mt={"6"}>
                <Select
                  mr={"2"}
                  size={"sm"}
                  bg={"white"}
                  border={"white"}
                  rounded={"lg"}
                  className="custom-selector"
                >
                  <option value="search">Search</option>
                  <option value="analyze">Analyze Document</option>
                  <option value="email">Draft Email</option>
                </Select>
                {folderList && folderList.length > 0 && (
                  <Select
                    size={"sm"}
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
            </Flex>
          </GridItem>

          <GridItem
            rowSpan={7}
            display="flex"
            flexDirection="column"
            // justifyContent="end"
            px={"2"}
          >
            <Grid templateRows="repeat(10, 1fr)" gap={"2"} h={"full"}>
              <GridItem rowSpan={9} px={"4"} overflowY={"auto"}>
                <ChatMessageDisplay />
              </GridItem>
              <GridItem
                rowSpan={1}
                px={"4"}
                display="flex"
                flexDirection="column"
                justifyContent="flex-end"
                py={"2"}
              >
                <Flex
                  justifyContent={"center"}
                  bg={"brand.background"}
                  p={"2"}
                  rounded={"xl"}
                >
                  <Input
                    size={"sm"}
                    border={"white"}
                    rounded={"lg"}
                    placeholder={"Flowlly help me ..."}
                    className="custom-selector"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        handleChatSubmit();
                      }
                    }}
                  ></Input>

                  <Button
                    rounded={"full"}
                    bg={"white"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                    onClick={() => {
                      handleChatSubmit();
                    }}
                  >
                    <Icon as={BsSend} fontSize={"22px"}></Icon>
                  </Button>
                </Flex>
              </GridItem>
            </Grid>
            {/* <Flex w="inherit" overflow={"contain"}>
              <ChatMessageDisplay />
            </Flex>
            <Flex
              alignItems={"center"}
              bg={"brand.background"}
              p={"2"}
              rounded={"xl"}
            >
              <Input
                size={"sm"}
                border={"white"}
                rounded={"lg"}
                placeholder={"Flowlly help me ..."}
                className="custom-selector"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
              ></Input>

              <Button
                rounded={"full"}
                bg={"white"}
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => {
                  handleChatSubmit();
                }}
              >
                <Icon as={BsSend} fontSize={"22px"}></Icon>
              </Button>
            </Flex> */}
          </GridItem>
        </>
      )}
    </Grid>
  );
}

export default ChatComponent;
