import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import AgentMessageInteractiveView from "@/components/AiActions/AgentMessageInteractiveView";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CornerDownLeft,
  MessageCircleMore,
  Check,
  Loader2,
} from "lucide-react";
import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { usePlatformChat } from "./usePlatformChat";

export default function PlatformChatInterface({
  folderId,
  chatTarget,
  onContentUpdate,
}: {
  folderId: string;
  chatTarget: string;
  onContentUpdate?: (newContent: string) => void;
}) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    activeProject,
    handleChatSubmit,
    setChatInput,
    chatInput,
    currentTaskId,
    session,
  } = usePlatformChat(folderId, chatTarget);

  // Ref to store the index of the last message we processed
  const lastChatIndexRef = useRef<number>(-1);

  const [applyingChanges, setApplyingChanges] = useState<{
    [key: number]: boolean;
  }>({});

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chats]);

  // Remove the automatic content update useEffect and add a function to handle applying changes
  const handleApplyChanges = (index: number) => {
    if (chats && chats.length > 0) {
      setApplyingChanges((prev) => ({ ...prev, [index]: true }));

      const lastChat = chats[chats.length - 1];
      if (lastChat.sender !== "User" && lastChat.message.content) {
        if (typeof lastChat.message.content === "string" && onContentUpdate) {
          onContentUpdate(lastChat.message.content);

          // Reset the state after a brief delay to show success
          setTimeout(() => {
            setApplyingChanges((prev) => ({ ...prev, [index]: false }));
          }, 1000);
        }
      }
    }
  };

  return (
    <div>
      <ScrollArea className="px-4 h-[calc(100vh-300px)]" ref={chatContainerRef}>
        {chats &&
          chats.length > 0 &&
          chats.map((history, index) => (
            <div key={index} className="w-full">
              <div className="max-w-full px-8 py-2 text-white">
                <Card className="mt-4 bg-background text-foreground">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-1">
                      <MessageCircleMore className="mr-2 h-6 w-6 text-indigo-500" />
                      <span className="font-bold">{history.sender}</span>
                      <span className="text-xs ml-2">
                        {history.created_at
                          ? new Date(history.created_at).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    {history.message.content && (
                      <AgentMessageInteractiveView message={history.message} />
                    )}
                    {chatTarget === "editor" &&
                      history.sender.toLowerCase() !== "user" && (
                        <div className="mt-2">
                          <Button
                            onClick={() => handleApplyChanges(index)}
                            variant="secondary"
                            size="sm"
                            disabled={applyingChanges[index]}
                          >
                            {applyingChanges[index] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Apply Changes
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        {currentTaskId && session && (
          <StreamComponent
            key={currentTaskId}
            streamingKey={currentTaskId}
            authToken={session.access_token}
          />
        )}
      </ScrollArea>
      <div className="px-4 py-2 flex flex-col justify-end">
        {activeProject && (
          <div className="relative overflow-hidden rounded-lg border border-black bg-background focus-within:ring-1 focus-within:ring-ring">
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              onChange={(e) => setChatInput(e.target.value)}
              value={chatInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSubmit();
                }
              }}
            />
            <div className="flex items-center p-3 pt-0">
              <Button
                type="submit"
                size="sm"
                className="ml-auto gap-1.5"
                onClick={handleChatSubmit}
              >
                Send Message
                <CornerDownLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
