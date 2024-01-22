import React from "react";
import { Grid, GridItem, Text, Flex, useDisclosure } from "@chakra-ui/react";
import DocumentList from "../DocumentEditor/DocumentList";
import CreateNewDocument from "../DocumentEditor/CreateNewDocument";
import EditorBlock from "@/components/DocumentEditor/Editor";
import Editor from "@/pages/documents/editor";
import { useStore } from "@/utils/store";

const NEW_NotesPage = () => {
  const { documentId, setDocumentId } = useStore((state) => ({
    documentId: state.documentId,
    setDocumentId: state.setDocumentId,
  }));

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={4} w="full" h={"full"}>
      <GridItem
        colSpan={1}
        h="full"
        overflowY={"auto"}
        className="custom-scrollbar"
      >
        <Text fontSize={"14px"} fontWeight={"bold"}>
          My Notes
        </Text>

        <Flex
          px={"2"}
          py={"1"}
          bg={"white"}
          boxShadow={"md"}
          rounded={"md"}
          mt={"2"}
          mb={"4"}
          mx={"2"}
          fontSize={"12px"}
          justifyContent={"center"}
          _hover={{ bg: "brand.dark", color: "white" }}
          cursor={"pointer"}
          onClick={onOpen}
        >
          + New Note
        </Flex>

        <DocumentList />
        <CreateNewDocument isOpen={isOpen} onClose={onClose} />
      </GridItem>
      <GridItem
        bg={"brand.background"}
        // border={"1px"}
        // borderColor={"brand.gray"}
        rounded={"lg"}
        colSpan={5}
        h={"full"}
        // className="custom-shadow"
        overflowY={"auto"}
      >
        {/* <EditorBlock /> */}
        <Editor />
      </GridItem>
    </Grid>
  );
};

export default NEW_NotesPage;
