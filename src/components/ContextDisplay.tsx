import React, { useState } from "react";
import {
  Box,
  Link,
  Icon,
  Flex,
  Button,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react";

import { GiBlackBook } from "react-icons/gi";

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
  const handleRefereces = (filePath: string, pageNumber: number) => {
    setPageNumber(pageNumber);
    setFilePath(filePath);
    setPdfVisibility(true);
    // setHighlightDetails({
    //   total_chunks: total_chunks,
    //   chunk_number: chunk_number,
    // });
  };
  const [numOfMessagesToShow, setNumOfMessagesToShow] = useState<number>(2);
  const [isExpandedNumber, setIsExpandedNumber] = useState<number | null>(null);

  return (
    <div>
      <Text
        fontSize={"md"}
        color="teal.500"
        fontWeight={"bold"}
        alignContent={"center"}
      >
        <Icon as={GiBlackBook} cursor="pointer" color={"teal.500"} mr="2" />
        Sources:
      </Text>
      <Grid templateColumns={"repeat(2, 1fr)"}>
        {documentData.slice(0, numOfMessagesToShow).map((page, index) => {
          // console.log(page);
          return (
            <GridItem
              key={`${index}`}
              colSpan={isExpandedNumber === index ? 2 : 1}
            >
              <Box lineHeight="7">
                <Flex justifyContent={"space-between"}>
                  <Box>
                    <Link
                      cursor="pointer"
                      onClick={() =>
                        handleRefereces(
                          page.metadata.filename,
                          page.metadata.page_number
                        )
                      }
                      color="teal.500"
                      fontWeight="semibold"
                      fontSize="smaller"
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
                  </Box>

                  {/* <Flex direction={"row"}>
                  <Box marginLeft="4" display="flex" alignItems="center">
                    <Icon as={FaThumbsUp} cursor="pointer" color={"teal.500"} />
                  </Box>
                  <Box marginLeft="4" display="flex" alignItems="center">
                    <Icon
                      as={FaThumbsDown}
                      cursor="pointer"
                      color={"orange.500"}
                    />
                  </Box>
                </Flex> */}
                </Flex>

                <Text
                  color="teal.700"
                  fontSize="small"
                  maxH={isExpandedNumber === index ? "none" : "4rem"} // set maximum height to 8rem when not expanded
                  overflow="hidden"
                  rounded="md"
                  px="2"
                  _hover={{ bg: "teal.50" }}
                  // reveal full text on hover
                  onClick={() =>
                    setIsExpandedNumber((state) =>
                      state === index ? null : index
                    )
                  }
                  cursor="pointer"
                  transition="max-height 0.3s ease-out"
                >
                  {" "}
                  {page.page_content}
                </Text>
                {/* )} */}
              </Box>
            </GridItem>
          );
        })}
      </Grid>
      {numOfMessagesToShow === 2 && (
        <Flex justifyContent={"center"}>
          <Button
            onClick={() => setNumOfMessagesToShow(5)}
            color="teal.500"
            bg=""
            size={"sm"}
          >
            Load more sources
          </Button>
        </Flex>
      )}
    </div>
  );
};

export default ContextDisplay;
