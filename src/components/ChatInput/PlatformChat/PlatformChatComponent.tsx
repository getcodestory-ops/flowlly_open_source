"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlatformChatSelector from "./PlatformChatSelector";
import PlatformChatInterface from "./PlatformChatInterface";

export default function PlatformChatComponent({
  folderId,
  folderName,
  chatTarget,
}: {
  folderId: string;
  folderName: string;
  chatTarget: string;
}) {
  return (
    <div className="p-2">
      <Card className="h-[calc(100vh-100px)] w-full rounded-2xl">
        <CardHeader className="p-4 h-[50px]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-medium px-8">
              {chatTarget === "schedule"
                ? "Interact with Schedule"
                : `Source for answers: ${folderName}`}
            </CardTitle>
            <PlatformChatSelector folderId={folderId} chatTarget={chatTarget} />
          </div>
        </CardHeader>
        <CardContent className="p-2 ">
          <PlatformChatInterface folderId={folderId} chatTarget={chatTarget} />
        </CardContent>
      </Card>
    </div>
  );
}
