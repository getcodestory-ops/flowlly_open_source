import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  InputGroup,
  InputRightElement,
  Stack,
  useToast,
  useColorModeValue,
  Textarea,
  Select,
  useDisclosure,
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
import { AiOutlineClose } from "react-icons/ai";
import { createClient } from "@supabase/supabase-js";
import ContextDisplay from "@/components/ContextDisplay";
import { Session } from "@supabase/supabase-js";
import UserPanel from "@/components/UserPanel";
import CodeLoader from "@/components/CodeLoader";
import SidePanel from "./SidePanel";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

interface ChatMessage {
  id: number;
  message: any;
  fromUser: boolean;
}

interface SessionToken {
  sessionToken: Session;
}

interface HighLightInterface {
  total_chunks: number;
  chunk_number: number;
}

type SidePanelType = "fileSystem" | "integrations" | "memory" | null;

export default function Dashboard({ sessionToken }: SessionToken) {
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
  const [selectedContext, setSelectedContext] = useState("slack-conversations");
  const [folderList, setFolderList] = useState<{ name: string }[] | null>(null);

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

  const textColor = useColorModeValue("blackAlpha.600", "blackAlpha.100");

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleChatInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  const handleChatSubmit = async () => {
    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      message: chatInput,
      fromUser: true,
    };

    setChatMessages([...chatMessages, newMessage]);

    try {
      const response = await fetch(
        `/api/context?chatInput=${chatInput}&selectedContext=${selectedContext}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken.access_token}`,
          },
        }
      );
      const context = await response.json();
      const newContext: ChatMessage = {
        id: chatMessages.length + 3,
        message: context.response,
        fromUser: false,
      };

      setChatMessages([...chatMessages, newMessage, newContext]);
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
          bg="blackAlpha.50"
          direction="column"
          alignItems="center"
          justifyContent="space-between"
          shadow="base"
          py="6"
          display={{ base: showMenu ? "flex" : "none", md: "flex" }}
        >
          <Stack direction="column" spacing={4}>
            <Button
              // transform="translateY(-50%)"
              zIndex="1"
              onClick={() => handleToggleSidePanel("fileSystem")}
              bg="blackAlpha.300"
              color="blackAlpha.500"
              _hover={{ bg: "blackAlpha.200", color: "blackAlpha.700" }}
            >
              {sidePanelType !== "fileSystem" ? <FaFolder /> : <FaTimes />}
            </Button>
            <Button
              // transform="translateY(-50%)"
              zIndex="1"
              onClick={() => handleToggleSidePanel("integrations")}
              bg="blackAlpha.300"
              color="blackAlpha.500"
              _hover={{ bg: "blackAlpha.200", color: "blackAlpha.700" }}
            >
              {sidePanelType !== "integrations" ? <FaPlug /> : <FaTimes />}
            </Button>
            <Button
              // transform="translateY(-50%)"
              zIndex="1"
              onClick={() => handleToggleSidePanel("memory")}
              bg="blackAlpha.300"
              color="blackAlpha.500"
              _hover={{ bg: "blackAlpha.200", color: "blackAlpha.700" }}
            >
              {sidePanelType !== "memory" ? <FaBrain /> : <FaTimes />}
            </Button>
          </Stack>

          <Box as="nav" mt="8">
            <UserPanel />
          </Box>
        </Flex>
        {/* column 2 */}
        <SidePanel
          sidePanelType={sidePanelType}
          sessionToken={sessionToken}
          folderList={folderList}
          setFolderList={setFolderList}
        />
        {/* )} */}
        {/* Column 3: Chat */}{" "}
        <Flex
          flex="1"
          direction="column"
          alignItems="start"
          justifyContent="end"
          bg="blackAlpha.100"
        >
          <Box overflowY="scroll" width="full" ref={chatBoxRef}>
            {chatMessages.map((message) => (
              <Box
                key={`${message?.id}-${message?.message?.slice(0, 5)}`}
                width="full"
              >
                <Flex
                  maxW="full"
                  px="8"
                  py="6"
                  bg={message.fromUser ? "blackAlpha.50" : ""}
                  justifyContent="center"
                >
                  <Box width="2xl">
                    {message.fromUser ? (
                      message.message
                    ) : (
                      <>
                        <ContextDisplay
                          documentData={message.message}
                          setPdfVisibility={setPdfVisibility}
                          setPageNumber={setPageNumber}
                          setFilePath={setFilePath}
                          setHighlightDetails={setHighlightDetails}
                          selectedContext={selectedContext}
                        />
                        <Box mt={4}></Box>
                      </>
                    )}
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>
          <Stack spacing={4} pb="4" width="2xl" alignSelf={"center"}>
            <InputGroup size="lg">
              <Textarea
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
                border="1px solid blackAlpha.400"
                outlineColor="blackAlpha.300"
                minH="4rem"
                h="auto"
                resize="none"
                maxH="12rem"
                height={`${chatInput.length / 40}rem`}
              />

              <InputRightElement border="none">
                <Select
                  placeholder="Select context"
                  value={selectedContext}
                  border="none"
                  onChange={(e) => setSelectedContext(e.target.value)}
                >
                  {folderList?.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              </InputRightElement>
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
            >
              <IconButton
                aria-label="Close"
                icon={<FaChevronRight />}
                onClick={() => setPdfVisibility(false)}
                mb={2}
                ml={-6}
              />
              <CodeLoader filePath={filePath} />
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
