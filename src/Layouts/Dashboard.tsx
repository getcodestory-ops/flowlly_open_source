import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast,
  useColorModeValue,
  Textarea,
  border,
  AccordionIcon,
  AccordionPanel,
  AccordionButton,
  Accordion,
  AccordionItem,
  Icon,
  Slide,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { FaBars, FaUpload, FaTimes, FaPlus } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { createClient } from "@supabase/supabase-js";
import { FaRegPaperPlane } from "react-icons/fa";
import { FaFile, FaFolder, FaFolderOpen, FaChevronRight } from "react-icons/fa";
import ContextDisplay from "@/components/ContextDisplay";
import { Session } from "@supabase/supabase-js";
import UserPanel from "@/components/UserPanel";
import PdfLoader from "@/components/PdfLoader";

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

export default function Dashboard({ sessionToken }: SessionToken) {
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfList, setPdfList] = useState<string[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(true);
  const [isPdfVisible, setPdfVisibility] = useState<Boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [filePath, setFilePath] = useState<string>("tunnel.pdf");
  const [highlightDetails, setHighlightDetails] =
    useState<HighLightInterface | null>(null);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);

  const handleToggleSidePanel = () => {
    setIsSidePanelCollapsed(!isSidePanelCollapsed);
  };

  const handleAddFolder = () => {
    setIsFileUploadDialogOpen(true);
  };
  const { isOpen, onToggle } = useDisclosure();

  const fetchPdfList = async () => {
    const { data: pdfList, error } = await supabase.storage
      .from("uploads")
      .list("");
    if (error) {
      console.log(error);
    } else {
      setPdfList(
        pdfList
          .filter((pdf) => pdf.name !== ".emptyFolderPlaceholder")
          ?.map((pdf) => pdf.name) || []
      );
    }
  };

  useEffect(() => {
    fetchPdfList();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const textColor = useColorModeValue("gray.600", "white");

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
        `http://localhost:8000/context?question=${chatInput}`,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(selectedFile.name, selectedFile);
      if (error) {
        console.log(error);
        toast({
          title: "Error uploading file",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        console.log(data);
        setPdfList([...pdfList, selectedFile.name]);
        toast({
          title: "File uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        const formData = new FormData();
        formData.append("file", selectedFile);

        fetch("http://127.0.0.1:8000/pdf", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken.access_token}`,
          },
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Success:", data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        setSelectedFile(null);
      }
    }
  };

  return (
    <Box>
      <Flex height="100vh">
        {/* Column 1: Sidebar */}
        <Flex
          width="16"
          bg="gray.100"
          direction="column"
          alignItems="center"
          justifyContent="space-between"
          shadow="base"
          py="6"
          display={{ base: showMenu ? "flex" : "none", md: "flex" }}
        >
          <Button
            // transform="translateY(-50%)"
            zIndex="1"
            onClick={handleToggleSidePanel}
            bg="gray.300"
            color="gray.500"
            _hover={{ bg: "gray.200", color: "gray.700" }}
          >
            {isSidePanelCollapsed ? <FaFolder /> : <FaTimes />}
          </Button>
          {/* <IconButton
          aria-label="Toggle menu"
          bg="gray.300"
          icon={showMenu ? <AiOutlineClose /> : <FaBars />}
          onClick={handleMenuToggle}
        /> */}
          <Box as="nav" mt="8">
            <UserPanel />
            {/* <Text fontWeight="bold" mb="4">
            Sidebar
          </Text>
          <Button variant="ghost" mb="2">
            Link 1
          </Button>
          <Button variant="ghost" mb="2">
            Link 2
          </Button>
          <Button variant="ghost" mb="2">
            Link 3
          </Button> */}
          </Box>
        </Flex>
        {/* Column 2: File upload */}
        {/* {!isSidePanelCollapsed && ( */}
        <Flex
          width={isSidePanelCollapsed ? 0 : 96}
          visibility={isSidePanelCollapsed ? "hidden" : "visible"}
          bg="gray.100"
          direction="column"
          alignItems="center"
          justifyContent="end"
          py="6"
          px=""
          shadow="base"
        >
          <Accordion
            allowToggle
            width="100%"
            overflowY="scroll"
            borderColor={"gray.300"}
          >
            {[{ name: "Specifications" }].map((folder) => (
              <AccordionItem key={folder.name}>
                <h2>
                  <AccordionButton>
                    <Flex flex="1" textAlign="left" align-items="center">
                      <Icon as={FaFolder} mr={4} mt={1} />
                      {folder.name}
                    </Flex>
                    {/* <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAddFolder}
                      aria-label="Add folder"
                    >
                      <Icon as={FaPlus} />
                    </Button> */}

                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={1}>
                  {pdfList.map((file) => (
                    <Box key={file} pl="8" py="1" _hover={{ bg: "gray.400" }}>
                      <Text>{file}</Text>
                    </Box>
                  ))}
                  <Box p="2">
                    <Stack spacing={4}>
                      <Box>
                        <input
                          id="file-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileSelect}
                        />
                      </Box>
                      <Button
                        colorScheme="blackAlpha"
                        onClick={handleFileUpload}
                      >
                        <FaUpload />
                        <Text ml="2">Upload</Text>
                      </Button>
                    </Stack>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Flex>
        {/* )} */}
        {/* Column 3: Chat */}{" "}
        <Flex
          flex="1"
          direction="column"
          alignItems="start"
          justifyContent="end"
        >
          <Box overflowY="scroll" width="full" ref={chatBoxRef}>
            {chatMessages.map((message) => (
              <Box
                key={`${message.id}-${message.message.slice(0, 5)}`}
                width="full"
                shadow="base"
              >
                <Flex
                  maxW="full"
                  px="8"
                  py="6"
                  bg={message.fromUser ? "gray.100" : "white"}
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
                        />
                        <Box mt={4}></Box>
                      </>
                    )}
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>
          <Stack spacing={4} pb="4" bg="white" width="2xl" alignSelf={"center"}>
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
                border="1px solid gray"
                minH="4rem"
                h="auto"
                resize="none"
                maxH="12rem"
                height={`${chatInput.length / 40}rem`}
              />
              <InputRightElement>
                <IconButton
                  aria-label="send message"
                  bg="white"
                  icon={<FaRegPaperPlane />}
                  onClick={handleChatSubmit}
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
          </Stack>
        </Flex>
        <Flex>
          {isPdfVisible && (
            <Box
              width="full"
              flex="1"
              alignItems="start"
              justifyContent="end"
              height="100vh"
              overflowY="hidden"
              borderLeft="1px solid gray"
              pl={4}
            >
              {/* <Slide direction="right" in={isOpen}>
                <IconButton
                  aria-label="Close"
                  icon={<FaChevronRight />}
                  onClick={onToggle}
                  mb={2}
                />
              </Slide> */}
              <IconButton
                aria-label="Close"
                icon={<FaChevronRight />}
                onClick={() => setPdfVisibility(false)}
                mb={2}
                ml={-6}
              />
              <PdfLoader
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                filePath={filePath}
                highlightDetails={highlightDetails}
              />
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
