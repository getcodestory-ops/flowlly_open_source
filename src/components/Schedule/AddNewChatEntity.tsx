import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createChatEntity } from "@/api/agentRoutes";

interface AddNewChatEntityProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddNewChatEntity({ isOpen, onClose }: AddNewChatEntityProps) {
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));
  const toast = useToast();

  const [chatName, setchatName] = useState<string>("");
  const [chatDescription, setchatDescription] = useState<string>("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!session || !activeProject) {
        toast({
          title: "Error",
          description: "No session or active project",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right",
        });
        return Promise.reject("No session or active project");
      }
      return createChatEntity(session, {
        project_id: activeProject.project_id,
        chat_name: chatName,
        chat_details: chatDescription,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chat entity created",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      queryClient.invalidateQueries({ queryKey: ["chatEntityList"] });
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Chat Entity</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Input
              placeholder="Chat Name"
              value={chatName}
              onChange={(e) => {
                setchatName(e.target.value);
              }}
            />
          </Box>
          <Textarea
            placeholder="Chat Description"
            value={chatDescription}
            onChange={(e) => setchatDescription(e.target.value)}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              mutation.mutate();
              onClose();
            }}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AddNewChatEntity;
