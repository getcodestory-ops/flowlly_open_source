import React, { useState } from "react";
import { Button, Flex, Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { MdOutlineRecordVoiceOver } from "react-icons/md";
import { IoMdSend, IoMdTrash } from "react-icons/io";

import { keyframes } from "@chakra-ui/system";

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const MediaRecorderButton: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
          colorScheme={recording ? "red" : "green"}
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
            as={IoMdSend}
            cursor={"pointer"}
            size={"sm"}
            color="green.500"
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
