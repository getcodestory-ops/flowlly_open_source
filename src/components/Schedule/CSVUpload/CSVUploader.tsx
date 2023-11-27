// CSVUploader.tsx

import React, { useEffect, useState } from "react";
import {
  Flex,
  Button,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalContent,
  ModalHeader,
  Select,
  Spinner,
  Icon,
  Heading,
  Box,
} from "@chakra-ui/react";
import { CreateNewActivity } from "@/types/activities";
import { useCSVUploader } from "./useCsvUpload";
import { FiUpload } from "react-icons/fi";

const CSVUploader: React.FC = () => {
  const {
    fileRef,
    isModalOpen,
    unmatchedHeaders,
    csvHeaders,
    headerMappings,
    isPending,
    selectedFile,
    setHeaderMappings,
    setSelectedFile,
    handleHeaderMappingChange,
    handleCsvFileHeaderCheck,
    setModalOpen,
    handleUpload,
  } = useCSVUploader();

  // useEffect(() => {
  //   if (selectedFile === null) return;
  //   handleCsvFileHeaderCheck();
  // }, [selectedFile]);

  return (
    <Flex direction={"column"} w={"full"}>
      {/* <Flex>
        <Heading as="h2" size="sm" color="brand.dark" mt={2} mb={4}>
          Upload Project Schedule in CSV format
        </Heading>
      </Flex> */}
      <Flex
        border="1px solid"
        borderColor={"brand.light"}
        borderRadius={"md"}
        align={"center"}
        position={"relative"}
        p={1}
        gap={2}
        fontSize="md"
        as={"b"}
        color="brand.dark"
        bg={"brand.light"}
        _hover={{ bg: "brand.dark", color: "white" }}
        w={"full"}
        direction={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Flex alignItems={"center"}>
          <Icon as={FiUpload} mr={2} />
          {selectedFile !== null ? selectedFile.name : "Upload csv file"}
          <Input
            left={-1}
            type="file"
            accept=".csv"
            ref={fileRef}
            py={1}
            position="absolute"
            opacity={0}
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </Flex>
        <Box>
          {selectedFile !== null ? (
            <Button onClick={handleCsvFileHeaderCheck} size="xs">
              process
            </Button>
          ) : null}
        </Box>
      </Flex>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isPending
              ? "processing"
              : "We did not find corresponding headers, please match them manually"}
          </ModalHeader>
          <ModalCloseButton />
          {!isPending && (
            <>
              <ModalBody>
                {unmatchedHeaders.map((header, index) => (
                  <Flex key={`${header}-${index}`}>
                    <span>{header}</span>
                    <Select
                      placeholder="Select corresponding header"
                      value={headerMappings[header] || ""}
                      onChange={(e) => {
                        handleHeaderMappingChange(
                          header,
                          e.target.value as keyof CreateNewActivity
                        );
                      }}
                    >
                      {csvHeaders.map((key, index) => (
                        <option
                          key={`${key}-${index}`}
                          value={key}
                          color="black"
                          onChange={() =>
                            setHeaderMappings((prev) => ({
                              ...prev,
                              [key]: header,
                            }))
                          }
                        >
                          {key}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                ))}
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleUpload}>
                  Upload
                </Button>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
          {isPending && <Spinner />}
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default CSVUploader;
