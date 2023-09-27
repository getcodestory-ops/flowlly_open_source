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
import ScopeDisplay from "@/components/ScopeDisplay";
import { Session } from "@supabase/supabase-js";
import UserPanel from "@/components/UserPanel";
import PdfLoader from "@/components/PdfLoader";
import SidePanel from "./SidePanel";
import { BiUserVoice } from "react-icons/bi";
import ChatbotInstructions from "@/components/ChatBotInstructions";
import { scopeConfig } from "@/utils/projectconfig";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

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

export default function Scope({ sessionToken, hasAdminRights }: SessionToken) {
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [chatInput, setChatInput] = useState(scopeConfig.scope);
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

  const [questionAnswered, setQuestionAnswered] = useState<Boolean>(true);

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

  const handleChatSubmit = async (question: string, queryType: string) => {
    const loadingToastId = toast({
      title: "Fetching  Scope for your project",
      status: "loading",
      duration: null,
      isClosable: true,
      position: "top-right",
    });

    setChatMessages((chatMessage) => {
      const newMessage: ChatMessage = {
        id: chatMessage.length + 1,
        message: `Loading ${queryType} for your project`,
        fromUser: "question",
      };

      return [...chatMessage, newMessage];
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL}/scope?question=${question}&spacename=${selectedContext}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken.access_token}`,
          },
        }
      );

      const context = await response.json();

      // console.log(context.response)

      setChatMessages((chatMessage) => {
        const newContext: ChatMessage = {
          id: chatMessage.length + 1,
          message: context.response,
          fromUser: "context",
        };

        toast.close(loadingToastId);
        toast({
          title: "Scope reference documents fetched successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });

        return [...chatMessage, newContext];
      });
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
            {/* <ChatbotInstructions /> */}

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
                                  <Box key={i} mb="2">
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
                        <ScopeDisplay
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
            <InputGroup size="lg" justifyContent={"end"}>
              <Button
                color="brand.dark"
                border="1px solid"
                bg="brand.accent"
                borderRadius="40px"
                _hover={{ borderColor: "brand.dark" }}
                _focus={{
                  // outline: "none",
                  borderColor: "brand.dark",
                  boxShadow: "0px 0px 8px 1px rgba(255,221,0, 0.8)",
                }}
                onClick={async () => {
                  setQuestionAnswered(false);
                  await handleChatSubmit(scopeConfig.scope, "scope");
                  // await handleChatSubmit(scopeConfig.risks, "risks");
                  setQuestionAnswered(true);
                }}
              >
                {questionAnswered
                  ? "Get detailed project scope with relevant sections"
                  : "loading..."}
              </Button>
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
