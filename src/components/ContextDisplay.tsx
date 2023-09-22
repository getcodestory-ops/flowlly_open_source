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
  Center,
} from "@chakra-ui/react";

import { GiBlackBook } from "react-icons/gi";
import { FaAngleDown } from "react-icons/fa";

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
  const [numOfMessagesToShow, setNumOfMessagesToShow] = useState<number>(4);
  const [isExpandedNumber, setIsExpandedNumber] = useState<number | null>(null);

  useEffect(() => {
    console.log("expanded Number", isExpandedNumber);
  }, [isExpandedNumber]);

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
          {documentData.slice(0, numOfMessagesToShow).map((page, index) => {
            // {
            //   console.log(page);
            // }
            return (
              <>
                <Flex
                  key={index}
                  bg={index === isExpandedNumber ? "brand.accent" : "brand.mid"}
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
                    {page.metadata.filename.slice(0, 5)}... - p.{" "}
                    {page.metadata.page_number}
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
            {
              console.log(page);
            }
            if (index === isExpandedNumber) {
              return (
                <Flex
                  bg={"brand.accent"}
                  color={"brand.dark"}
                  key={index}
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
                    onClick={() =>
                      handleRefereces(
                        page.metadata.filename,
                        page.metadata.page_number
                      )
                    }
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

{
  /* <Grid templateColumns={"repeat(4, 1fr)"} templateRows="repeat(1, 1fr)">
        {documentData.slice(0, numOfMessagesToShow).map((page, index) => {
          return (
            <GridItem
              key={`${index}`}
              colSpan={isExpandedNumber === index ? 4 : 1}
              rowSpan={2}
            >
              <Box lineHeight="7">
                <Flex>
                  <Box
                    minW="10em"
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
                          {page.metadata.filename.slice(0, 5)}... - page
                          {page.metadata.page_number}
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
                </Flex>

                <Text
                  minW="2em"
                  color="teal.100"
                  fontSize="medium"
                  maxH={isExpandedNumber === index ? "none" : "0rem"} // set maximum height to 8rem when not expanded
                  overflow="hidden"
                  rounded="md"
                  px="2"
                  _hover={{ bg: "teal.700" }}
                  // reveal full text on hover
                  // onClick={() =>
                  //   setIsExpandedNumber((state) =>
                  //     state === index ? null : index
                  //   )
                  // }
                  cursor="pointer"
                  transition="max-height 0.3s ease-out"
                >
                  {" "}
                  {page.page_content}
                </Text>
                {/* )} */
}
{
  /* </Box>
            </GridItem>
          );
        })}
      </Grid> */
}
