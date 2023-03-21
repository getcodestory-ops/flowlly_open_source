import React, { useState } from "react";
import { Box, Link, Icon, Flex, Button } from "@chakra-ui/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

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

const ContextDisplay: React.FC<ContextDisplayProps> = ({
  documentData,
  setPdfVisibility,
  setPageNumber,
  setFilePath,
  setHighlightDetails,
  selectedContext,
}) => {
  const handleRefereces = (
    pageNumber: number,
    filePath: string,
    total_chunks: number,
    chunk_number: number
  ) => {
    setPageNumber(pageNumber);
    setFilePath(filePath);
    setPdfVisibility(true);
    setHighlightDetails({
      total_chunks: total_chunks,
      chunk_number: chunk_number,
    });
  };
  const [numOfMessagesToShow, setNumOfMessagesToShow] = useState<number>(2);

  return (
    <div>
      {documentData &&
        documentData.slice(0, numOfMessagesToShow).map((page, index) => {
          // console.log(page);
          return (
            <div key={`${index}`}>
              <Box py="8" lineHeight="7">
                {page.metadata.styleType === "code" ? (
                  <SyntaxHighlighter language="javascript">
                    {page.page_content}
                  </SyntaxHighlighter>
                ) : (
                  page.page_content
                )}
                <Flex justifyContent={"space-between"} mt="2">
                  <Box>
                    <Link
                      cursor="pointer"
                      onClick={() =>
                        handleRefereces(
                          page.metadata.page_number,
                          page.metadata.filename,
                          page.metadata.total_chunks,
                          page.metadata.chunk_number
                        )
                      }
                      color="teal.500"
                      fontWeight="semibold"
                      fontSize="smaller"
                      _hover={{
                        textDecoration: "underline",
                      }}
                    >
                      <i>{page.metadata.filename}</i>
                    </Link>
                  </Box>

                  <Flex direction={"row"}>
                    <Box marginLeft="4" display="flex" alignItems="center">
                      <Icon
                        as={FaThumbsUp}
                        cursor="pointer"
                        color={"teal.500"}
                      />
                    </Box>
                    <Box marginLeft="4" display="flex" alignItems="center">
                      <Icon
                        as={FaThumbsDown}
                        cursor="pointer"
                        color={"gray.500"}
                      />
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            </div>
          );
        })}
      {numOfMessagesToShow === 2 && (
        <Flex justifyContent={"center"}>
          <Button
            onClick={() => setNumOfMessagesToShow(5)}
            color="teal.500"
            bg=""
            size={"sm"}
          >
            Load more context
          </Button>
        </Flex>
      )}
    </div>
  );
};

export default ContextDisplay;
