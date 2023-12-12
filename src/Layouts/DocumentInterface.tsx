import React, { useRef } from "react";
import {
  Flex,
  Grid,
  Button,
  useDisclosure,
  Text,
  GridItem,
} from "@chakra-ui/react";
import CreateNewDocument from "@/components/DocumentEditor/CreateNewDocument";
import { IoMdAdd } from "react-icons/io";
import DocumentList from "@/components/DocumentEditor/DocumentList";

const DocumentInterface = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Flex w="full" justifyContent="center">
      <Flex padding="10" w={{ base: "full", "2xl": "7xl" }} direction="column">
        <Flex justifyContent={"end"} w="full">
          <Button onClick={onOpen} top={4} right={4} cursor="pointer">
            <IoMdAdd />
          </Button>
        </Flex>
        <DocumentList />

        <CreateNewDocument isOpen={isOpen} onClose={onClose} />
      </Flex>
    </Flex>
  );
};

export default DocumentInterface;
