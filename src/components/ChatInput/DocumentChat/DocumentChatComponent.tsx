"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentChatSelector from "./DocumentChatSelector";
import DocumentChatInterface from "./DocumentChatInterface";

export default function DocumentChatComponent({
  folderId,
}: {
  folderId: string;
}) {
  return (
    <div className="p-2">
      <Card className="h-[calc(100vh-100px)] w-full rounded-2xl">
        <CardHeader className="p-4 h-[50px]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Chat</CardTitle>
            <DocumentChatSelector folderId={folderId} />
          </div>
        </CardHeader>
        <CardContent className="p-2 ">
          <DocumentChatInterface folderId={folderId} />
        </CardContent>
      </Card>
    </div>
  );
}
