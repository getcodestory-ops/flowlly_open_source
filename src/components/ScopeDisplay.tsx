import React, { useState, useEffect } from "react";
import {
  Box,
  Link,
  Icon,
  Flex,
  Button,
  Text,
  Grid,
  GridItem,
  useToast,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { GiBlackBook } from "react-icons/gi";
import { FaAngleDown } from "react-icons/fa";
import { AnyTxtRecord } from "dns";

interface DocumentProps {
  documentData: {
    page_content: string;
    metadata: {
      filename: string;
      page_number: number;
      total_chunks: number;
      chunk_number: number;
      styleType: string | undefined;
    };
  }[];
}

interface HighLightInterface {
  total_chunks: number;
  chunk_number: number;
}

interface ContextDisplayProps extends DocumentProps {
  setPdfVisibility: React.Dispatch<React.SetStateAction<Boolean>>;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
  setHighlightDetails: React.Dispatch<
    React.SetStateAction<HighLightInterface | null>
  >;
  selectedContext: string;
}

const ScopeDisplay: React.FC<ContextDisplayProps> = ({
  documentData,
  setPdfVisibility,
  setPageNumber,
  setFilePath,
  setHighlightDetails,
  selectedContext,
}) => {
  const handleRefereces = (filePath: string, pageNumber: number) => {
    setPageNumber(pageNumber);
    setFilePath(filePath);
    setPdfVisibility(true);
    // setHighlightDetails({
    //   total_chunks: total_chunks,
    //   chunk_number: chunk_number,
    // });
  };

  //variable section
  const toast = useToast();
  const session = useStore((state) => state.session);
  const prompts = useStore((state) => state.prompts);
  const [numOfMessagesToShow, setNumOfMessagesToShow] = useState<number>(5);

  const [isExpandedNumber, setIsExpandedNumber] = useState<number | null>(null);
  const [furtherAnalysis, setFurtherAnalysis] = useState<{
    [key: number]: string;
  }>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  //function section

  const fetchAnswers = async (context: string, question: string) => {
    const response = await fetch(`/api/answers?question=${question}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: context,
    });
    const answer = await response.json();

    return answer;
  };

  const getAnswers = async (
    context: string,
    index: number,
    filename?: string
  ) => {
    try {
      if (Object.keys(furtherAnalysis).length > 0) return;
      setFurtherAnalysis((state) => ({
        ...state,
        [index]: "Loading answer",
      }));
      const loadingToastId = toast({
        title: `Fetching  detailed description for section ${
          `${filename}-${index}` ?? index
        }`,
        status: "loading",
        duration: null,
        isClosable: true,
        position: "top-right",
      });

      // console.log(answer.response);
      const answer = await fetchAnswers(context, prompts.getScopePrompt);

      setFurtherAnalysis((state) => ({ ...state, [index]: answer.response }));

      toast.close(loadingToastId);
      toast({
        title: `Successfully analyzed scope for section ${
          `${filename}-${index}` ?? index
        }`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const createProjectScope = async () => {
    setIsLoading(true);
    const context = Object.values(furtherAnalysis).join(" ");
    const answer = await fetchAnswers(context, prompts.generateScopePrompt);
    setModalContent(answer.response);
    setIsLoading(false);
    onOpen();
  };

  const fetchAnalysis = async () => {
    const promises = documentData.slice(0, 2).map((page, index) => {
      return getAnswers(page.page_content, index, page.metadata.filename);
    });
    const results = await Promise.all(promises);
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("this is running");
    if (!documentData || documentData.length === 0) return;
    if (Object.keys(furtherAnalysis).length > 0) return;
    setIsLoading(true);
    fetchAnalysis();
  }, []);

  return (
    <div>
      <Button
        onClick={createProjectScope}
        color="brand.accent"
        bg=""
        size={"sm"}
        isDisabled={isLoading}
      >
        Create Scope of the Project
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent height="100vh" display="flex" flexDirection="column">
          <ModalHeader>Scope of the Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
              height="100%"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Text
        fontSize={"md"}
        color="brand.accent"
        fontWeight={"bold"}
        alignContent={"center"}
        mb="1em"
      >
        {/* <Icon as={GiBlackBook} cursor="pointer" color={"brand.accent"} mr="2" /> */}
        References:
      </Text>
      <Grid templateColumns={"repeat(1, 1fr)"}>
        {documentData.slice(0, numOfMessagesToShow).map((page, index) => {
          // console.log(page);
          return (
            <GridItem
              key={`${index}`}
              mb="8"
              // colSpan={isExpandedNumber === index ? 4 : 1}
            >
              <Box lineHeight="7">
                <Flex>
                  <Box
                    bg="brand.mid"
                    pr=".6em"
                    pl=".6em"
                    borderRadius="20px"
                    onClick={() =>
                      setIsExpandedNumber((state) =>
                        state === index ? null : index
                      )
                    }
                    transition="max-height 0.3s ease-out"
                  >
                    <Center>
                      <Link
                        cursor="pointer"
                        onClick={() =>
                          handleRefereces(
                            page.metadata.filename,
                            page.metadata.page_number
                          )
                        }
                        color="brand.light"
                        fontWeight="semibold"
                        fontSize="10px"
                        _hover={{
                          textDecoration: "underline",
                        }}
                      >
                        {index + 1}.{" "}
                        <i>
                          {" "}
                          {page.metadata.filename} - {page.metadata.page_number}
                        </i>
                      </Link>
                      <Icon
                        as={FaAngleDown}
                        cursor="pointer"
                        color="brand.light"
                        ml=".7em"
                      />
                    </Center>
                  </Box>
                  {/* <Button
                    color="brand.dark"
                    border="1px solid"
                    bg="brand.accent"
                    size="xs"
                    ml="2"
                    borderRadius="40px"
                    _hover={{ borderColor: "brand.dark" }}
                    _focus={{
                      // outline: "none",
                      borderColor: "brand.dark",
                      boxShadow: "0px 0px 8px 1px rgba(255,221,0, 0.8)",
                    }}
                    onClick={() => {
                      setFurtherAnalysis((state) => ({
                        ...state,
                        [index]: "analysis done",
                      }));
                      getAnswers(page.page_content, index);
                    }}
                  >
                    Analyze
                  </Button> */}
                </Flex>

                <Text
                  minW="2em"
                  color="brand.light"
                  fontSize="small"
                  maxH={isExpandedNumber === index ? "16rem" : "0rem"} // set maximum height to 8rem when not expanded
                  overflow="hidden"
                  rounded="md"
                  px="2"
                  overflowY={"scroll"}
                  sx={{
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      borderRadius: "8px",
                      backgroundColor: `rgba(0, 0, 0, 0.01)`,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: `rgba(0, 0, 0, 0.05)`,
                    },
                  }}
                  cursor="pointer"
                  transition="max-height 0.3s ease-out"
                >
                  {page.page_content}
                </Text>
                {furtherAnalysis?.[index] && (
                  <Text color="brand.accent" style={{ whiteSpace: "pre-line" }}>
                    {" "}
                    {furtherAnalysis?.[index]}
                  </Text>
                )}
              </Box>
            </GridItem>
          );
        })}
      </Grid>
      {numOfMessagesToShow < documentData.length && (
        <Flex justifyContent={"center"}>
          <Button
            onClick={() => setNumOfMessagesToShow((state) => state + 20)}
            color="brand.accent"
            bg=""
            size={"sm"}
          >
            Expand References
          </Button>
        </Flex>
      )}
    </div>
  );
};

export default ScopeDisplay;
