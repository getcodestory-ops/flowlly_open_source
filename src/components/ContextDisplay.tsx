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
  Center,
} from "@chakra-ui/react";

import { GiBlackBook } from "react-icons/gi";
import {FaAngleDown} from 'react-icons/fa' ;

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

  return (
    <div>
      <Text
        fontSize={"md"}
        color="brand.accent"
        fontWeight={"bold"}
        alignContent={"center"}
        mb='1em'
      >
        {/* <Icon as={GiBlackBook} cursor="pointer" color={"brand.accent"} mr="2" /> */}
        Sources:
      </Text>
      <Grid templateColumns={"repeat(4, 1fr)"} templateRows="repeat(2, 1fr)">
        {documentData.slice(0, numOfMessagesToShow).map((page, index) => {
          // console.log(page);
          return (
            <GridItem
              key={`${index}`}
              colSpan={isExpandedNumber === index ? 2 : 1}
              rowSpan={1}
            >
              <Box lineHeight="7">
                <Flex justifyContent={"space-between"} >
                  <Box
                  minW='10em'
                  bg='brand.mid' 
                  pr='.6em' 
                  pl='.6em' 
                  borderRadius='20px'
                  onClick={() =>
                    setIsExpandedNumber((state) =>
                    state === index ? null : index
                    )}
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
                    <Icon as={FaAngleDown} cursor='pointer' color='brand.light' ml='.7em' />
                  </Center>
                  </Box>
                </Flex>

                <Text
                  minW='2em'
                  maxW='8em'
                  color="teal.700"
                  fontSize="small"
                  maxH={isExpandedNumber === index ? "none" : "0rem"} // set maximum height to 8rem when not expanded
                  overflow="hidden"
                  rounded="md"
                  px="2"
                  _hover={{ bg: "teal.50" }}
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
            color="brand.accent"
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
