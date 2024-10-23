import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createPlatformChatEntity } from "@/api/agentRoutes";

function AddNewPlatformChatEntity({ folderId }: { folderId: string }) {
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));
  const { toast } = useToast();

  const [chatName, setChatName] = useState("");
  const [chatDescription, setChatDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!session || !activeProject) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No session or active project",
        });
        return Promise.reject("No session or active project");
      }
      return createPlatformChatEntity(session, {
        project_id: activeProject.project_id,
        chat_name: chatName,
        chat_details: chatDescription,
        relation_id: folderId,
        relation_type: "folder",
      });
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chat entity created",
      });
      queryClient.invalidateQueries({ queryKey: ["documentChatEntityList"] });
      // Clear input fields after success
      setChatName("");
      setChatDescription("");
    },
  });

  return (
    <Popover>
      <PopoverTrigger>
        <Button>Add New Chat Entity</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="p-4">
          <h2 className="text-lg font-medium">Create New Chat Entity</h2>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Chat Name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
            />
            <Textarea
              placeholder="Chat Description"
              value={chatDescription}
              onChange={(e) => setChatDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              onClick={() => {
                mutation.mutate();
              }}
            >
              Save
            </Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AddNewPlatformChatEntity;
