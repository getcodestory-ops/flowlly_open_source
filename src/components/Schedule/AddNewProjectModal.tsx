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
  Flex,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createProject } from "@/api/projectRoutes";

interface AddNewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddNewProjectModal({ isOpen, onClose }: AddNewProjectModalProps) {
  const { session } = useStore((state) => ({
    session: state.session,
  }));

  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [projectNumber, setProjectNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createProject(session!, {
        name: projectName,
        description: projectDescription,
        project_number: projectNumber,
        address: address,
      }),
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectList"] });
      queryClient.invalidateQueries({ queryKey: ["initialProjectList"] });
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
            />
          </Box>
          <Flex mb="4" gap="4" flexDirection={"column"}>
            <Textarea
              placeholder="Project Description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <Input
              placeholder="Project Number"
              value={projectNumber}
              onChange={(e) => {
                setProjectNumber(e.target.value);
              }}
            />
            <Textarea
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button
            bg={"brand.dark"}
            color={"white"}
            _hover={{ bg: "brand.accent", color: "brand.dark" }}
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

export default AddNewProjectModal;
