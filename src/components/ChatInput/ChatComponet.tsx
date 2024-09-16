"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssistantChatInterface from "../Schedule/AssistantChatInterface";
import AssistantChatSelector from "../Schedule/AssistantChatSelector";

export default function ChatComponent() {
  return (
    <div className="p-2">
      <Card className="h-full w-full rounded-2xl">
        <CardHeader className="p-4 h-[50px]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Chat</CardTitle>
            <AssistantChatSelector />
          </div>
        </CardHeader>
        <CardContent className="p-2 h-[calc(100vh-140px)]">
          <AssistantChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
