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

const CsvUploadIcon: React.FC = () => {
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
    <Flex direction={"column"}>
      <Flex
        border="1px solid"
        borderRadius={"md"}
        align={"center"}
        position={"relative"}
        gap={2}
        height={selectedFile ? "" : 6}
        color="brand.light"
        bg={"brand.dark"}
        _hover={selectedFile ? {} : { bg: "brand.light", color: "white" }}
        direction={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        cursor="pointer"
      >
        <Flex height={"6"} width={"12"}>
          <Flex>
            <Icon as={FiUpload} ml="4" my="2" />
          </Flex>
          <Input
            type="file"
            accept=".csv"
            ref={fileRef}
            py={1}
            position="absolute"
            opacity={0}
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            cursor={"pointer"}
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

export default CsvUploadIcon;
