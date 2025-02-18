import React, { useRef, useEffect, useLayoutEffect } from "react";
import { useScheduleUpdate } from "@/components/Agent/useAgentFunctions";
import AgentMessageInteractiveView from "../AiActions/AgentMessageInteractiveView";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, MessageCircleMore } from "lucide-react";
import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssistantChatInterface() {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    activeProject,
    handleChatSubmit,
    setChatInput,
    chatInput,
    currentTaskId,
    session,
    selectedModel,
    setSelectedModel,
    includeContext,
    setIncludeContext,
  } = useScheduleUpdate();

  const models = [
    { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
    { id: "gpt-4o", name: "GPT-4.0" },
    { id: "gemini-2.0-flash", name: "Gemini Flash" },
    { id: "gemini-2.0-pro-exp-02-05", name: "Gemini Pro" },
  ];

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

  return (
    <div>
      <ScrollArea className="px-4 h-[calc(100vh-270px)]" ref={chatContainerRef}>
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
          <>
            <div className="relative overflow-hidden rounded-lg border border-black bg-background focus-within:ring-1 focus-within:ring-ring">
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <div className="absolute bottom-0 left-2 z-10 ">
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedModel}
                    onValueChange={(value) => setSelectedModel(value)}
                  >
                    <SelectTrigger className="w-36 h-2 text-xs">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="includeContext"
                      checked={includeContext}
                      onChange={(e) => setIncludeContext(e.target.checked)}
                      className="h-3 w-3"
                    />
                    <label htmlFor="includeContext" className="text-xs">
                      Include project context
                    </label>
                  </div>
                </div>
              </div>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0 "
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
          </>
        )}
      </div>
    </div>
  );
}
