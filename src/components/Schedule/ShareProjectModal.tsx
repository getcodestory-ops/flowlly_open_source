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
  Checkbox,
  useToast,
  Switch,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { shareProject } from "@/api/projectRoutes";
import axios from "axios";

interface AddNewChatEntityProps {
  isShareOpen: boolean;
  shareModalClose: () => void;
}

interface ErrorResponse {
  detail: string;
}

function ShareProjectModal({
  isShareOpen,
  shareModalClose,
}: AddNewChatEntityProps) {
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));
  const toast = useToast();

  const [email, setEmail] = useState<string>("");
  const [enrollOkay, setEnrollOkay] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const isEmailValid = (email: string) => {
    // A simple email validation function
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

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
      return shareProject(session, {
        project_id: activeProject.project_id,
        enroll: enrollOkay,
        email: email,
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Error",
        description:
          (error.response && error.response.data.detail) ||
          "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
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
    },
  });

  return (
    <Modal isOpen={isShareOpen} onClose={shareModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Share Project - {activeProject?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Input
              placeholder="email address"
              value={email}
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </Box>
          <Box mb={4}>
            <Switch
              isChecked={enrollOkay}
              onChange={(e) => setEnrollOkay(e.target.checked)}
            >
              Enroll user in daily project briefing
            </Switch>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            isDisabled={email === "" || !isEmailValid(email)}
            onClick={() => {
              mutation.mutate();
              shareModalClose();
            }}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={shareModalClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ShareProjectModal;
