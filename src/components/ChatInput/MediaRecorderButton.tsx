import React, { useState } from "react";
import {
  Button,
  Flex,
  Icon,
  IconButton,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { MdOutlineRecordVoiceOver } from "react-icons/md";
import { IoMdTrash } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { keyframes } from "@chakra-ui/system";
import { sendVoiceNote } from "@/api/agentRoutes";
import { FaSave } from "react-icons/fa";

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const MediaRecorderButton: React.FC = () => {
  const toast = useToast();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: sendVoiceNote,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your Note was successfully sent!",
        position: "bottom-right",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.onstart = () => {
        setRecording(true);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop()); // Stop each track to ensure the light indicating the webcam is off gets turned off
      };
      recorder.ondataavailable = (event: BlobEvent) => {
        const audioURL = URL.createObjectURL(event.data);
        setAudioUrl(audioURL);
      };
      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error accessing the microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleVoiceNoteSubmission = () => {
    if (!session || !activeProject || !audioUrl) return;

    fetch(audioUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = new Date().toISOString().replace(/:/g, "-") + ".wav";
        const file = new File([blob], fileName, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", file);
        mutate({ session, projectId: activeProject?.project_id, formData });
      })
      .catch((error) => {
        console.error("Error converting blob to file:", error);
      });
  };

  return (
    <Flex flexDir="column" gap="2">
      {!audioUrl && (
        <Button
          leftIcon={
            <Icon
              as={MdOutlineRecordVoiceOver}
              sx={{
                animation: recording ? `${pulseAnimation} 1s infinite` : "none",
              }}
            />
          }
          colorScheme={recording ? "red" : "blackAlpha"}
          size="sm"
          fontWeight={"normal"}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? "Stop Recording" : "Voice note"}
        </Button>
      )}
      {audioUrl && (
        <Flex alignItems={"center"} gap="2" px="4">
          <audio src={audioUrl} controls />
          <IconButton
            aria-label="Send voice note"
            as={FaSave}
            cursor={"pointer"}
            size={"sm"}
            color="blue.500"
            onClick={handleVoiceNoteSubmission}
          />

          <IconButton
            aria-label="Delete voice note"
            as={IoMdTrash}
            color={"red.500"}
            size={"sm"}
            cursor={"pointer"}
            onClick={() => setAudioUrl(null)}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default MediaRecorderButton;
