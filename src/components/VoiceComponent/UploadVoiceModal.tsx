import React, { useRef } from "react";
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

import { useVoiceUpload } from "./useVoiceUpload";
import { BsFiletypeMp3 } from "react-icons/bs";

function UploadVoiceModal({ documentId }: { documentId?: string | string[] }) {
  const { isOpen, onClose, onOpen, handleSubmit, mutate } = useVoiceUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {typeof documentId === "string" && (
        <Flex>
          <Tooltip label="Upload minutes of the meeting">
            <Button cursor={"pointer"} size={"md"} maxW="16" onClick={onOpen}>
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
