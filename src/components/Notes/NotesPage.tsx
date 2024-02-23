import React, { useState, useEffect } from "react";
import { Grid, GridItem, Text, Flex, useDisclosure } from "@chakra-ui/react";
import DocumentList from "../DocumentEditor/DocumentList";
import CreateNewDocument from "../DocumentEditor/CreateNewDocument";
import FolderViewer from "../Folder/FolderViewer";
import Editor from "@/pages/documents/editor";
import { useStore } from "@/utils/store";

const NEW_NotesPage = () => {
  const { documentId, setDocumentId, selectedContext } = useStore((state) => ({
    documentId: state.documentId,
    setDocumentId: state.setDocumentId,
    selectedContext: state.selectedContext,
  }));
  const [folderView, setFolderView] = useState<boolean>(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteTitle, setNoteTitle] = useState("");

  useEffect(() => {
    console.log("documentId", documentId);
  }, [documentId]);

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={4} w="full" h={"full"}>
      <GridItem
        colSpan={1}
        h="full"
        overflowY={"auto"}
        className="custom-scrollbar"
      >
        <Flex>
          <Text
            fontSize={"14px"}
            fontWeight={"bold"}
            cursor="pointer"
            as={folderView ? undefined : "u"}
            onClick={() => setFolderView(true)}
          >
            Home
          </Text>
          <Text fontSize={"14px"} fontWeight={"bold"}>
            {folderView || `/ ${selectedContext?.name}` || ""}
          </Text>
        </Flex>

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
        {folderView && (
          <Flex direction={"column"} gap="2">
            <FolderViewer
              folderView={folderView}
              setFolderView={setFolderView}
            />
            <DocumentList setNoteTitle={setNoteTitle} />
          </Flex>
        )}

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
        <Editor documentTitle={noteTitle} />
      </GridItem>
    </Grid>
  );
};

export default NEW_NotesPage;
