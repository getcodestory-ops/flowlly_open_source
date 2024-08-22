import React, { useState } from "react";

import { StorageResourceEntity } from "@/types/document";
import { FileText, File } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "../DocumentEditor/useStorageTextSave";
import { useDocumentTracer } from "./useDocumentTracer";

export const MediaViewer: React.FC<{ resource: StorageResourceEntity }> = ({
  resource,
}) => {
  const { file_name, metadata, url, created_at } = resource || {};
  const fileExt = metadata?.extension?.toLowerCase();
  const { onSubmit, isPending } = useStorageTextFileSave(resource?.id);
  const traces = useDocumentTracer(resource?.id);

  const renderPreview = () => {
    switch (fileExt) {
      case ".jpg":
      case ".jpeg":
      case ".png":
      case ".gif":
        return (
          <Dialog>
            <DialogTrigger asChild>
              <div className="max-h-96 overflow-auto">
                <img src={url} alt={file_name} className="object-cover" />
              </div>
            </DialogTrigger>
            <DialogContent className="">
              <img src={url} alt={file_name} />
            </DialogContent>
          </Dialog>
        );
      case ".mp4":
      case ".webm":
        return (
          <div className="overflow-auto">
            <AspectRatio ratio={1}>
              <video controls>
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag
              </video>
            </AspectRatio>
          </div>
        );
      case ".mp3":
      case ".ogg":
      case ".wav":
        return (
          <div className="flex flex-col items-center justify-center  p-4">
            <div className="w-full min-w-[300px]">
              <audio src={url} controls style={{ width: "100%" }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        );

      case ".txt":
        return (
          <Dialog>
            <DialogTrigger asChild>
              <div className="rounded-lg  transition-all cursor-pointer mt-4">
                <div className="flex flex-row items-center gap-4">
                  <FileText className="text-2xl hover:scale-105" />
                  <div>
                    No Preview.{" "}
                    <span
                      className="text-primary cursor-pointer 
                    hover:underline
                    "
                    >
                      Open
                    </span>{" "}
                    to edit!
                  </div>
                  <div>{traces && JSON.stringify(traces)}</div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-6xl ">
              <ContentEditor
                content={metadata?.content}
                saveFunction={onSubmit}
              />
            </DialogContent>
          </Dialog>
        );
      default:
        return (
          <div className="flex items-center justify-center ">
            <div className="flex flex-row items-center gap-4">
              <File className="text-2xl" />
              <div>Sorry No Preview Available</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <div>{renderPreview()}</div>
      {metadata?.description && (
        <div className="rounded-lg p-2 bg-white max-h-96 overflow-auto">
          <div className="space-y-1 text-sm">
            <p className="text-xs ">{metadata?.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
