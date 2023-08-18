import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast,
  useColorModeValue,
  Textarea,
  Select,
  useDisclosure,
  Spinner,
  Icon,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import {
  FaBars,
  FaUpload,
  FaTimes,
  FaPlus,
  FaPlug,
  FaRegPaperPlane,
  FaFile,
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaBrain,
} from "react-icons/fa";
import { BsArrowBarRight } from "react-icons/bs";
import { IoChatboxEllipses } from "react-icons/io5";
import { createClient } from "@supabase/supabase-js";
import ContextDisplay from "@/components/ContextDisplay";
import { Session } from "@supabase/supabase-js";
import UserPanel from "@/components/UserPanel";
import PdfLoader from "@/components/PdfLoader";
import SidePanel from "./SidePanel";
import { BiUserVoice } from "react-icons/bi";
import ChatbotInstructions from "@/components/ChatBotInstructions";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
// );

interface ChatMessage {
  id: number;
  message: any;
  fromUser: "question" | "context" | "answer";
}

interface SessionToken {
  sessionToken: Session;
  hasAdminRights: boolean;
}

interface HighLightInterface {
  total_chunks: number;
  chunk_number: number;
}

type SidePanelType = "fileSystem" | "integrations" | "memory" | null;

export default function Dashboard({
  sessionToken,
  hasAdminRights,
}: SessionToken) {
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [sidePanelType, setsidePanelType] = useState<SidePanelType | null>(
    null
  );
  const [isPdfVisible, setPdfVisibility] = useState<Boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [filePath, setFilePath] = useState<string>("tunnel.pdf");
  const [highlightDetails, setHighlightDetails] =
    useState<HighLightInterface | null>(null);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [folderList, setFolderList] = useState<{ name: string }[] | null>(null);

  const [questionAnswered, setQuestionAnswered] = useState<Boolean>(false);

  const handleToggleSidePanel = (id: SidePanelType) => {
    setsidePanelType((state) => (state === id ? null : id));
  };

  const handleAddFolder = () => {
    setIsFileUploadDialogOpen(true);
  };
  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    setSelectedContext(folderList?.[0]?.name ?? "");
  }, [folderList]);

  const textColor = useColorModeValue("blackAlpha.600", "blackAlpha.100");

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleChatInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  const handleChatSubmit = async () => {
    console.log("question answered", questionAnswered);
    // setQuestionAnswered(false);

    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      message: chatInput,
      fromUser: "question",
    };

    setChatMessages([...chatMessages, newMessage]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/context?question=${chatInput}&spacename=${selectedContext}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken.access_token}`,
          },
        }
      );
      const context = await response.json();
      const newContext: ChatMessage = {
        id: chatMessages.length + 8,
        message: context.response,
        fromUser: "context",
      };

      setChatMessages([...chatMessages, newMessage, newContext]);

      try {
        let newResponse: ChatMessage = {
          id: chatMessages.length + 4,
          message: "loading...",
          fromUser: "answer",
        };
        setChatMessages((state) => [...state, newResponse]);

        const response = await fetch(
          `https://fastapi.eastus.cloudapp.azure.com/answers_next?question=${chatInput}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionToken.access_token}`,
            },
            body: context.response[0].page_content,
          }
        );
        // const answer = await response.json();
        if (response.body) {
          const reader = response.body.getReader();
          let partialText = "";
          let asnwer_text = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            partialText += new TextDecoder().decode(value);

            // Process complete lines and leave the rest for the next iteration
            let eolIndex;
            const activeChatIndex = chatMessages.length + 4;

            while ((eolIndex = partialText.indexOf("\n")) >= 0) {
              const line = partialText.slice(0, eolIndex).trim();
              partialText = partialText.slice(eolIndex + 1);

              if (line.startsWith("data:")) {
                const jsonStr = line.slice(5).trim();
                const item = JSON.parse(jsonStr);
                if (item["choices"].length > 0) {
                  if ("delta" in item["choices"][0]) {
                    if ("content" in item["choices"][0]["delta"]) {
                      asnwer_text =
                        asnwer_text + item["choices"][0]["delta"]["content"];
                      console.log(asnwer_text);

                      newResponse = {
                        id: activeChatIndex,
                        message: asnwer_text,
                        fromUser: "answer",
                      };
                      setChatMessages((state) => {
                        const data = state.filter(
                          (response) => response.id !== activeChatIndex
                        );
                        return [...data, newResponse];
                      });
                    }
                  }
                }
              }
            }
          }
        } else {
          console.error("No response body");
        }

        // newResponse = {
        //   id: chatMessages.length + 4,
        //   message: answer.response,
        //   fromUser: "answer",
        // };
        // setChatMessages((state) => {
        //   const data = state.filter(
        //     (response) => response.id !== chatMessages.length + 4
        //   );
        //   return [...data, newResponse];
        // });
        setQuestionAnswered(true);
      } catch (error: any) {
        console.log(error);
      }
    } catch (error: any) {
      let description = "";
      if (error instanceof Response) {
        description = await error.text();
      } else if (typeof error === "string") {
        description = error;
      } else {
        description = error.message;
      }
      toast({
        title: "Error fetching data from backend, please try again ! ",
        description,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }

    setChatInput("");
  };

  return (
    <Box>
      <Flex height="100vh">
        {/* Column 1: Sidebar */}
        <Flex
          width="16"
          bg="brand.dark"
          direction="column"
          alignItems="center"
          justifyContent="space-between"
          // shadow="base"
          py="6"
          display={{ base: showMenu ? "flex" : "none", md: "flex" }}
        >
          <Stack direction="column" spacing={4}>
            <Button
              // transform="translateY(-50%)"
              zIndex="1"
              onClick={() => handleToggleSidePanel("fileSystem")}
              bg="brand.dark"
              color="brand.accent"
              _hover={{ bg: "brand.mid", color: "brand.accent" }}
            >
              {sidePanelType !== "fileSystem" ? <FaFolder /> : <FaTimes />}
            </Button>
            <Button
              // transform="translateY(-50%)"
              zIndex="1"
              onClick={() => handleToggleSidePanel("integrations")}
              bg="brand.dark"
              color="brand.accent"
              _hover={{ bg: "brand.mid", color: "brand.accent" }}
            >
              {sidePanelType !== "integrations" ? <FaPlug /> : <FaTimes />}
            </Button>
            <Button
              // transform="translateY(-50%)"
              zIndex="1"
              onClick={() => handleToggleSidePanel("memory")}
              bg="brand.dark"
              color="brand.accent"
              _hover={{ bg: "brand.mid", color: "brand.accent" }}
            >
              {sidePanelType !== "memory" ? <FaBrain /> : <FaTimes />}
            </Button>
          </Stack>

          <Box as="nav" mt="8">
            <UserPanel />
          </Box>
        </Flex>
        {/* column 2 */}
        <Flex
          position={selectedContext && isPdfVisible ? "absolute" : "relative"}
          ml={selectedContext && isPdfVisible ? "16" : ""}
          zIndex="10"
        >
          <SidePanel
            sidePanelType={sidePanelType}
            sessionToken={sessionToken}
            folderList={folderList}
            setFolderList={setFolderList}
            hasAdminRights={hasAdminRights}
          />
        </Flex>
        {/* )} */}
        {/* Column 3: Chat */}{" "}
        <Flex
          flex="1"
          direction="column"
          alignItems="start"
          justifyContent="end"
          bg="brand.dark"
        >
          <Box overflowY="scroll" width="full" ref={chatBoxRef} mb="8">
            <ChatbotInstructions />
            {/* {chatMessages.sort((a, b) => {
    if (a.fromUser === "question" && b.fromUser === "answer") {
      console.log('case1',a.fromUser, b.fromUser)
      return -1;
      
    } else if (a.fromUser === "answer" && b.fromUser === "question") {
      console.log('case2',a.fromUser, b.fromUser)
      return 1;
    } else if (a.fromUser === "answer" && b.fromUser === "context") {
      console.log('case3',a.fromUser, b.fromUser)
      return -1;
    } else if (a.fromUser === "context" && b.fromUser === "answer") {
      console.log('case4',a.fromUser, b.fromUser)
      return 1;
    } else {
      console.log('case5',a.fromUser, b.fromUser)
      return 0;
    }
  }) */}
            {chatMessages.map((message) => (
              <Box
                key={`${message?.id}-${message?.message?.slice(0, 5)}`}
                width="full"
              >
                <Flex maxW="full" px="8" py="2" justifyContent="center">
                  <Box width="2xl">
                    {message.fromUser === "question" && (
                      <Flex
                        color="white"
                        fontWeight={"bold"}
                        bg="brand.dark"
                        p="4"
                        rounded="md"
                        mt="16"
                        alignItems={"center"}
                      >
                        <Icon
                          as={IoChatboxEllipses}
                          mr="2"
                          boxSize={"6"}
                          color={"brand.accent"}
                        />
                        {message.message}
                      </Flex>
                    )}
                    {message.fromUser === "answer" && (
                      <Box borderBottom="2px " borderBottomColor={"brand.mid"}>
                        <Box
                          mb="16"
                          color="brand.light"
                          bg="brand.mid"
                          p="8"
                          borderRadius="14px"
                        >
                          {message.message === "loading..." ? (
                            <div>
                              <Spinner size="sm" />
                              Thinking...
                            </div>
                          ) : (
                            <Box fontSize="lg" lineHeight="1.5">
                              {message?.message
                                ?.split("/n")
                                .map((line: string, i: number) => (
                                  <Box key={i} mb="2" whiteSpace="pre-line">
                                    {line}
                                  </Box>
                                ))}
                              {/* {setQuestionAnswered(true)} */}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}
                    {message.fromUser === "context" && (
                      <>
                        <ContextDisplay
                          documentData={message.message}
                          setPdfVisibility={setPdfVisibility}
                          setPageNumber={setPageNumber}
                          setFilePath={setFilePath}
                          setHighlightDetails={setHighlightDetails}
                          selectedContext={selectedContext}
                        />
                      </>
                    )}
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>
          <Stack spacing={4} pb="4" width="2xl" alignSelf={"center"}>
            <Flex justifyContent={"end"} alignItems="center" mb="-4">
              <Flex
                justifyContent={"end"}
                alignItems="center"
                pl="2"
                fontSize="xs"
              >
                <Text color="brand.light" mr="4">
                  Search folder
                </Text>
                <Select
                  color="brand.accent"
                  placeholder="Search within"
                  value={selectedContext ?? ""}
                  border="none"
                  width="48"
                  fontSize={"xs"}
                  fontWeight="bold"
                  onChange={(e) => setSelectedContext(e.target.value)}

                  // onBlur={handleBlur}
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
                    setQuestionAnswered(false);
                    handleChatSubmit();
                  }
                }}
                boxShadow="0px 0px 8px 1px rgba(255,221,0, 0.8)"
                border="1px solid"
                borderColor="brand.dark"
                borderRadius={"40px"}
                _hover={{ boderColor: "brand.dark" }}
                _focus={{
                  // outline: "none",
                  borderColor: "brand.dark",
                  boxShadow: "0px 0px 8px 1px rgba(255,221,0, 0.8)",
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
        <Flex>
          {selectedContext && isPdfVisible && (
            <Box
              width="full"
              flex="1"
              alignItems="start"
              justifyContent="end"
              height="100vh"
              borderLeft="1px solid blackAlpha"
              pl={4}
              overflowY="scroll"
            >
              <IconButton
                aria-label="Close"
                icon={<BsArrowBarRight />}
                onClick={() => setPdfVisibility(false)}
                mb={2}
                ml={-6}
                pl="2"
                zIndex="overlay"
              />
              <PdfLoader
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                filePath={filePath}
                highlightDetails={highlightDetails}
                selectedFolder={selectedContext}
                userId={sessionToken?.user.id}
              />
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
