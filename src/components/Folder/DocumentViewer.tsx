import React, { useState } from "react";
import { Flex, Grid, GridItem, Button } from "@chakra-ui/react";
import { GrAdd } from "react-icons/gr";
import { GrImage } from "react-icons/gr";
import DocumentEntityViewer from "./DocumentEntityViewer";
import { HiOutlineDocumentReport } from "react-icons/hi";

import DailyReports from "../Dailies/DailyReport";

function DocumentViewer() {
  const [documentViewer, setDocumentViewer] = useState<
    "Document" | "Reports" | "Media"
  >("Reports");

  return (
    <Grid
      templateColumns="repeat(8, 1fr)"
      gap={6}
      p="4"
      w="full"
      borderRadius={"lg"}
      bg="brand.light"
      height="100%"
    >
      <GridItem colSpan={1}>
        <Flex flexDir={"column"} gap="8">
          <Flex>
            <Button
              leftIcon={<GrAdd />}
              colorScheme="yellow"
              borderRadius={"lg"}
              size="sm"
              pr="4"
            >
              Add New
            </Button>
          </Flex>

          <Flex flexDir={"column"} gap="4">
            <Flex fontWeight={"bold"}>Folders</Flex>
            {/* <Flex
              _hover={{ bg: "gray.200", borderLeft: "2px solid gray.400" }}
              borderRadius={"lg"}
            >
              <Button
                leftIcon={<GrHome />}
                colorScheme=""
                color="black"
                size="sm"
              >
                Home Folder
              </Button>
            </Flex> */}
            <Flex
              _hover={{ bg: "gray.200" }}
              borderLeft={documentViewer === "Media" ? "2px solid gray" : ""}
            >
              <Button
                leftIcon={<GrImage />}
                colorScheme=""
                color="black"
                size="sm"
                onClick={() => setDocumentViewer("Media")}
              >
                Media
              </Button>
            </Flex>
            {/* <Flex _hover={{ bg: "gray.200" }} borderRadius={"lg"}>
              <Button
                leftIcon={<GrDocument />}
                colorScheme=""
                color="black"
                size="sm"
              >
                My Files
              </Button>
            </Flex> */}
            {/* <Flex _hover={{ bg: "gray.200" }} borderRadius={"lg"}>
              <Button
                leftIcon={<GrFavorite />}
                colorScheme=""
                color="black"
                size="sm"
              >
                Favorites
              </Button>
            </Flex> */}
          </Flex>
          <Flex flexDir={"column"} gap="4">
            <Flex fontWeight={"bold"}>Reports</Flex>
            <Flex
              _hover={{ bg: "gray.200" }}
              borderLeft={documentViewer === "Reports" ? "2px solid gray" : ""}
            >
              <Button
                leftIcon={<HiOutlineDocumentReport />}
                colorScheme=""
                color="black"
                size="sm"
                onClick={() => setDocumentViewer("Reports")}
              >
                Daily Reports
              </Button>
            </Flex>
            {/* <Flex _hover={{ bg: "gray.200" }} borderRadius={"lg"}>
              <Button
                leftIcon={<CiClock2 />}
                colorScheme=""
                color="black"
                size="sm"
              >
                Schedule Impact
              </Button>
            </Flex> */}
            {/* <Flex _hover={{ bg: "gray.200" }} borderRadius={"lg"}>
              <Button
                leftIcon={<CiStickyNote />}
                colorScheme=""
                color="black"
                size="sm"
              >
                Notes
              </Button>
            </Flex> */}
          </Flex>
        </Flex>
      </GridItem>
      <GridItem
        colSpan={7}
        bg="white"
        borderRadius={"lg"}
        p="4"
        h="full"
        overflow={"auto"}
        className="custom-scrollbar"
      >
        {documentViewer === "Reports" ? (
          <DailyReports />
        ) : (
          <DocumentEntityViewer />
        )}
      </GridItem>
    </Grid>
  );
}

export default DocumentViewer;
