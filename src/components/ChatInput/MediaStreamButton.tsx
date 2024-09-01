import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@chakra-ui/react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { keyframes } from "@chakra-ui/system";
import {
  streamVoiceNote,
  getPendingVoiceNotes,
  endVoiceNote,
} from "@/api/agentRoutes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic, X, TrashIcon, AudioLines } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import StreamComponent from "../StreamResponse/StreamAgentChat";

function PendingVoiceNote() {
  return (
    <div className="flex items-center space-x-4 p-4 bg-background rounded-lg ">
      <div className="relative">
        <div className="absolute -inset-1 bg-primary rounded-full opacity-75 "></div>
        <Button size="icon" className="relative">
          <Mic className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="absolute -top-2 -right-2 h-4 w-4 rounded-full shadow-md hover:bg-destructive/90"
          aria-label="Delete voice note"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-primary">
          Existing Voice recording found
        </h3>
        <p className="text-sm text-muted-foreground">
          Click save to process existing recording...
        </p>
      </div>
    </div>
  );
}

const MediaStreamerButton: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isPendingVoiceNote, setIsPendingVoiceNote] = useState<boolean>(false);
  const [audioModuleTextNote, setAudioModuteTextNote] = useState<string>("");
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const activityChatEntity = useStore((state) => state.activeChatEntity);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [responseStreamId, setResponseStreamId] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: streamVoiceNote,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Your Note was successfully sent!",
        position: "bottom-right",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      setResponseStreamId(data.agent_response);
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

  const { mutate: finishVoiceNote } = useMutation({
    mutationFn: endVoiceNote,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Your voice note is being processed now !",
        position: "bottom-right",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      setResponseStreamId(data.agent_response);
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

  const { data, isFetching } = useQuery({
    queryKey: ["pendingVoiceNotes", session, activeProject],
    queryFn: async () => {
      console.log("Fetching pending voice notes");
      if (!session || !activityChatEntity) {
        console.log("No session or active project");
        return Promise.reject("No session or active project");
      }
      return getPendingVoiceNotes(session, activityChatEntity?.id);
    },

    enabled: !!session?.access_token && !!activityChatEntity?.id,
  });

  useEffect(() => {
    if (data && data?.message > 0) {
      setIsPendingVoiceNote(true);
    } else {
      setIsPendingVoiceNote(false);
    }
  }, [isFetching]);

  const sendAudioChunk = async (chunk: Blob) => {
    if (!session || !activeProject || !activityChatEntity) return;

    const formData = new FormData();
    formData.append("file", chunk, "chunk.webm");
    if (activityChatEntity?.id) {
      formData.append("chat_entity_id", activityChatEntity.id);
    }

    try {
      mutate({ session, projectId: activeProject?.project_id, formData });
      // Store the chat_entity_id if it's new
      //   if (!activityChatEntity?.id) {
      //     // Update your state or store with the new chat_entity_id
      //     updateChatEntityId(response.data.chat_entity_id);
      //   }
    } catch (error) {
      console.error("Error sending audio chunk:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      const chunks: Blob[] = [];

      recorder.onstart = () => {
        setRecording(true);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const fullAudio = new Blob(chunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(fullAudio);
        setAudioUrl(audioURL);
      };
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          sendAudioChunk(event.data);
        }
      };
      recorder.start(5000);
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

  const handleSubmission = () => {
    if (!session || !activeProject || !activityChatEntity) return;
    setResponseStreamId(null);

    finishVoiceNote({
      session,
      projectId: activeProject.project_id,
      chatEntityId: activityChatEntity?.id!,
    });
  };

  return (
    <div className="flex items-center py-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["pendingVoiceNotes"],
              });
            }}
          >
            <AudioLines
              className="size-4"
              color={recording ? "red" : "black"}
            />
            <span className="sr-only">Voice recording</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[50vw]">
          <div className="space-y-6">
            <div className="flex space-x-4 items-center">
              <Button
                variant={recording ? "destructive" : "default"}
                size="lg"
                className="p-3"
                onClick={recording ? stopRecording : startRecording}
              >
                <Mic className="size-6" />

                <span className="pl-2">
                  {recording
                    ? "Stop Recording"
                    : isPendingVoiceNote
                    ? "Add to existing recording"
                    : "Start Recording"}
                </span>
              </Button>

              {audioUrl && (
                <div className="flex items-center space-x-2 flex-grow">
                  <audio src={audioUrl} controls className="h-8 flex-grow" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAudioUrl(null)}
                  >
                    <TrashIcon className="size-5" color="red" />
                    <span className="sr-only">Delete Recording</span>
                  </Button>
                </div>
              )}
            </div>
            <div> {isPendingVoiceNote && <PendingVoiceNote />}</div>

            <Button
              variant={"default"}
              disabled={
                !audioUrl &&
                audioModuleTextNote.length === 0 &&
                !isPendingVoiceNote
              }
              onClick={handleSubmission}
            >
              Save Note
            </Button>

            {responseStreamId && session && (
              <StreamComponent
                streamingKey={responseStreamId}
                authToken={session.access_token}
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MediaStreamerButton;
