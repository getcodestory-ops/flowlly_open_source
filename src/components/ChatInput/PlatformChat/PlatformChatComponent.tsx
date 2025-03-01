"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlatformChatSelector from "./PlatformChatSelector";
import PlatformChatInterface from "./PlatformChatInterface";

const titleMap: Record<string, string> = {
  document: "Source for answers",
  schedule: "Interact with ",
  "document-edit": "Document Editor",
  workflow: " ",
};

export default function PlatformChatComponent({
  folderId,
  folderName,
  chatTarget,
  onContentUpdate,
}: {
  folderId: string;
  folderName: string;
  chatTarget:
    | "workflow"
    | "editor"
    | "schedule"
    | "project"
    | "agent"
    | "folder";
  onContentUpdate?: (newContent: string) => void;
}) {
  return (
    <div className="p-2 container mx-auto">
      <Card className=" h-[calc(100vh-100px)] w-full rounded-2xl">
        <CardHeader className="p-4 h-[50px]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-medium px-8">
              {titleMap[chatTarget]} {folderName}
            </CardTitle>
            <PlatformChatSelector folderId={folderId} chatTarget={chatTarget} />
          </div>
        </CardHeader>
        <CardContent className="p-2 ">
          <PlatformChatInterface
            folderId={folderId}
            chatTarget={chatTarget}
            onContentUpdate={onContentUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
