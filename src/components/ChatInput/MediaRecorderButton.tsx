import React, { useState } from "react";
import { Button, Flex } from "@chakra-ui/react";

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
    <Flex>
      <Button
        colorScheme="blue"
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </Button>
      {audioUrl && <audio src={audioUrl} controls />}
    </Flex>
  );
};

export default MediaRecorderButton;
