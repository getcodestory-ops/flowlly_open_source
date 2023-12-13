import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadMP3File } from "@/api/documentRoutes";
import { useToast } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import type { Session } from "inspector";

export function useVoiceUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  // const mutation = useMutation(uploadFile);
  const toast = useToast();
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const { mutate } = useMutation({
    mutationFn: ({ documentId, file }: { documentId: string; file: File }) => {
      if (!session || !activeProject) {
        return Promise.reject("No session , or project selected");
      }
      return uploadMP3File(session, documentId, activeProject.project_id, file);
    },
    onSuccess: () => {
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "An error occurred.",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (file?: File) => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    //uploadMP3File(file);
    onClose();
  };

  return { isOpen, onClose, onOpen, handleSubmit };
}
