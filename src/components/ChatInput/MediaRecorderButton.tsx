import React, { useState, useRef } from "react";
import { Flex, Icon, IconButton, useToast } from "@chakra-ui/react";
import { MdOutlineRecordVoiceOver } from "react-icons/md";
import { IoMdSend, IoMdTrash } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { keyframes } from "@chakra-ui/system";
import { sendVoiceNote } from "@/api/agentRoutes";
import { FaSave } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CornerDownLeft, Mic, Paperclip, PencilIcon } from "lucide-react";
import { IoSave } from "react-icons/io5";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const MediaRecorderButton: React.FC = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [textNote, setTextNote] = useState<string>("");
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const activityChatEntity = useStore((state) => state.activeChatEntity);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setSelectedFile(files[0]);
  };

  const handleFileSubmission = () => {
    if (!session || !activeProject || !selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (activityChatEntity?.id) {
      formData.append("chat_entity_id", activityChatEntity.id);
    }
    mutate({ session, projectId: activeProject?.project_id, formData });
  };

  const handleTextNoteSubmission = () => {
    if (!session || !activeProject || !textNote) return;

    const formData = new FormData();
    formData.append("text_note", textNote);
    if (activityChatEntity?.id) {
      formData.append("chat_entity_id", activityChatEntity.id);
    }
    mutate({ session, projectId: activeProject?.project_id, formData });
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
        if (activityChatEntity?.id) {
          formData.append("chat_entity_id", activityChatEntity.id);
        }
        mutate({ session, projectId: activeProject?.project_id, formData });
      })
      .catch((error) => {
        console.error("Error converting blob to file:", error);
      });
  };

  return (
    <div className="flex   px-2 space-x-3 rounded-lg justify-center items-center ">
      <div className="flex items-center py-1">
        {!audioUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={recording ? stopRecording : startRecording}
              >
                <Mic className="size-4" color={recording ? "red" : "black"} />
                <span className="sr-only">
                  {recording ? "Stop Recording" : "Voice note"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Start recording audio</TooltipContent>
          </Tooltip>
        )}
        {audioUrl && (
          <div className="flex items-center space-x-2">
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
          </div>
        )}
      </div>
      <div className="flex items-center py-1 ">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-4 " color="black" />
              <span className="sr-only">Attach file</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Attach File</TooltipContent>
        </Tooltip>
        <input
          type="file"
          accept="audio/*,video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div className="flex items-center  ">
          {selectedFile &&
            (selectedFile.type.includes("audio") ||
              selectedFile.type.includes("video")) && (
              <div className="flex space-x-2 items-center">
                <span>{selectedFile.name}</span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleFileSubmission}
                    >
                      <IoSave className="size-4" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach File</TooltipContent>
                </Tooltip>
              </div>
            )}
        </div>
      </div>
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <PencilIcon className="size-4" color="black" />
              <span className="sr-only">Write Text Note</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-96">
            <div className="space-y-6">
              <AutosizeTextarea
                value={textNote}
                onChange={(e) => setTextNote(e.target.value)}
              />
              <Button variant={"default"} onClick={handleTextNoteSubmission}>
                Save Note
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default MediaRecorderButton;
