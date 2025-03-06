"use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import AssistantChatInterface from "../Schedule/AssistantChatInterface";
// import AssistantChatSelector from "../Schedule/AssistantChatSelector";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/utils/store";
export default function ChatComponent() {
  const activeProject = useStore((state) => state.activeProject);
  return (
    <div className="p-2">
      <Toaster />
      {activeProject && (
        <PlatformChatComponent
          folderId={activeProject?.project_id}
          folderName="Agent"
          chatTarget="agent"
        />
      )}
      {/* <Card className="h-full w-full rounded-2xl">
        <CardHeader className="p-4 h-[50px]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Chat</CardTitle>
            <AssistantChatSelector />
          </div>
        </CardHeader>
        <CardContent className="p-2 h-[calc(100vh-140px)]">
          <AssistantChatInterface />
        </CardContent>
      </Card> */}
    </div>
  );
}
