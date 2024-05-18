import React, { useRef, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Icon,
} from "@chakra-ui/react";

import { createDocument } from "@/api/documentRoutes";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useStore } from "@/utils/store";

type CreateNewDocumentProps = {
  isOpen: boolean;
  onClose: () => void;
  folderView?: boolean;
};

function CreateNewDocument({
  isOpen,
  onClose,
  folderView,
}: CreateNewDocumentProps) {
  const initialRef = useRef<HTMLElement>();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState<string>("");
  const { session, activeProject, taskToView, selectedContext } = useStore(
    (state) => ({
      session: state.session,
      activeProject: state.activeProject,
      taskToView: state.taskToView,
      selectedContext: state.selectedContext,
    })
  );
  const toast = useToast();
  const [noteType, setNoteType] = useState<string>("");

  const { mutate, isPending, data } = useMutation({
    mutationFn: () => {
      if (!title) return Promise.reject("Title is required");
      if (!session || !activeProject || !activeProject.project_id)
        return Promise.reject("Active project not selected");
      return createDocument(
        session!,
        activeProject.project_id,
        title,
        taskToView?.id === "SCHEDULE" ? undefined : taskToView?.id,
        folderView ? undefined : selectedContext?.id
      );
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `New document created - ${title}`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["documentList"] });
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new note</ModalHeader>

        <ModalCloseButton />
        <ModalBody pb={6} fontSize={"lg"}>
          <FormControl>
            <FormLabel>Note Title</FormLabel>

            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            bg={"brand.dark"}
            color={"white"}
            mr={3}
            onClick={() => mutate()}
            _hover={{ bg: "brand.accent", color: "brand.dark" }}
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateNewDocument;
