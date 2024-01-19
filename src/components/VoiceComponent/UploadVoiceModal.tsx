import React, { useRef, useEffect, use } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Flex,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";

import { useVoiceUpload } from "./useVoiceUpload";
import { BsFiletypeMp3 } from "react-icons/bs";

function UploadVoiceModal() {
  // { documentId }: { documentId?: string | string[] }
  const { documentId } = useStore((state) => ({
    documentId: state.documentId,
  }));
  const { isOpen, onClose, onOpen, handleSubmit, mutate } = useVoiceUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("documentId", typeof documentId);
  }, [documentId]);

  return (
    <>
      {typeof documentId === "string" && (
        <Flex>
          <Tooltip label="Upload audio file" bg="white" color="brand.dark">
            <Button
              cursor={"pointer"}
              size={"sm"}
              onClick={onOpen}
              bg={"white"}
              boxShadow={"lg"}
              _hover={{ bg: "brand.dark", color: "white" }}
            >
              <Icon as={BsFiletypeMp3} />
            </Button>
          </Tooltip>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Upload MP3 File</ModalHeader>
              <ModalCloseButton />

              <ModalBody>
                <FormControl>
                  <Input ref={fileInputRef} type="file" accept=".mp3" />
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  type="submit"
                  onClick={(e) =>
                    handleSubmit(documentId, fileInputRef.current?.files?.[0])
                  }
                >
                  Upload
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Flex>
      )}
    </>
  );
}

export default UploadVoiceModal;
