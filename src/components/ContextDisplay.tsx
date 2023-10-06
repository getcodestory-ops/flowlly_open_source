import React, { useState, useEffect } from "react";
import { Box, Flex, Button, Text, Tooltip } from "@chakra-ui/react";
import PdfLoader from "@/components/PdfLoader";
import { FaAngleDown } from "react-icons/fa";
import { useStore } from "@/utils/store";
import { Brain } from "@/utils/store";

interface DocumentProps {
  chatFolder: Brain | null;
  documentData: {
    page_content: string;
    metadata: {
      file_name: string;
      page_number: number;
      total_chunks: number;
      chunk_number: number;
      styleType: string | undefined;
    };
  }[];
}

const ContextDisplay: React.FC<DocumentProps> = ({
  documentData,
  chatFolder,
}) => {
  const [sourceFolder, setSourceFolder] = useState(chatFolder);
  const { pdfViewer, setPdfViewer, setSelectedContext, folderList } = useStore(
    (state) => ({
      pdfViewer: state.pdfViewer,
      setPdfViewer: state.setPdfViewer,
      setSelectedContext: state.setSelectedContext,
      folderList: state.folderList,
    })
  );

  const handleRefereces = (filePath: string, pageNumber: number) => {
    console.log("foldername", sourceFolder);
    console.log(folderList);

    setSelectedContext(
      folderList?.filter((state) => state.name === sourceFolder?.name)[0]!
    );

    setPdfViewer({
      pageNumber: pageNumber,
      filePath: filePath,
      isPdfVisible: true,
    });
  };
  const [numOfMessagesToShow, setNumOfMessagesToShow] = useState<number>(4);
  const [isExpandedNumber, setIsExpandedNumber] = useState<number | null>(null);

  return (
    <Flex px={{ base: "8%", md: "0" }} direction={"column"}>
      <Box w={{ base: "350px", md: "full" }}>
        <Text
          fontSize={"md"}
          color="brand.accent"
          fontWeight={"bold"}
          alignContent={"center"}
          mb="1em"
        >
          Sources:
        </Text>
        <Flex overflowY={"auto"}>
          {documentData &&
            documentData.slice(0, numOfMessagesToShow).map((page, index) => {
              return (
                <>
                  <Flex
                    key={`page-${page.metadata.file_name}-${index}`}
                    bg={
                      index === isExpandedNumber ? "brand.accent" : "brand.mid"
                    }
                    color={index === isExpandedNumber ? "brand.dark" : "white"}
                    mx={2}
                    py={1}
                    px={3}
                    rounded={"full"}
                    fontSize={"sm"}
                    alignItems={"center"}
                    cursor={"pointer"}
                    onClick={() =>
                      setIsExpandedNumber((state) =>
                        state === index ? null : index
                      )
                    }
                  >
                    <Flex mr={1} w={"100px"}>
                      <Tooltip
                        label={page.metadata.file_name}
                        fontSize="md"
                        placement="top"
                      >
                        <span>
                          {page.metadata.file_name?.slice(0, 5)}... - p.{" "}
                        </span>
                      </Tooltip>
                      {page.metadata.page_number + 1}
                    </Flex>
                    <FaAngleDown />
                  </Flex>
                </>
              );
            })}
        </Flex>

        {numOfMessagesToShow === 2 && (
          <Flex justifyContent={"center"}>
            <Button
              onClick={() => setNumOfMessagesToShow(5)}
              color="brand.accent"
              bg=""
              size={"sm"}
            >
              Load more sources
            </Button>
          </Flex>
        )}
      </Box>
      <Box>
        <Flex mt={4}>
          {documentData.slice(0, numOfMessagesToShow).map((page, index) => {
            if (index === isExpandedNumber) {
              return (
                <Flex
                  bg={"brand.accent"}
                  color={"brand.dark"}
                  key={`index-${page.metadata.file_name}-${index}`}
                  p={"8"}
                  direction={"column"}
                  rounded={"2xl"}
                  h={"300px"}
                  overflowY={"auto"}
                >
                  <Box
                    bg={"brand.mid"}
                    color={"white"}
                    fontSize={"sm"}
                    px={2}
                    py={1}
                    w={28}
                    rounded={"full"}
                    textAlign={"center"}
                    shadow={"md"}
                    mb={2}
                    cursor={"pointer"}
                    onClick={() => {
                      setPdfViewer({ isPdfVisible: true });
                      handleRefereces(
                        page.metadata.file_name,
                        page.metadata.page_number + 1
                      );
                    }}
                  >
                    Open in PDF
                  </Box>
                  <Text>Context:</Text>
                  {page.page_content}
                </Flex>
              );
            } else {
              return null;
            }
          })}
        </Flex>
      </Box>
    </Flex>
  );
};

export default ContextDisplay;
