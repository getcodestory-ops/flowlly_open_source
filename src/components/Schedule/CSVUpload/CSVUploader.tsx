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
    <Flex>
      <Flex
        border="1px solid white"
        borderRadius={"md"}
        align={"center"}
        position={"relative"}
        px={2}
        gap={2}
      >
        <Icon as={FiUpload} />
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
        <Button onClick={handleCsvFileHeaderCheck} size="xs">
          process
        </Button>
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
                  <div key={`${header}-${index}`}>
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
                  </div>
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
