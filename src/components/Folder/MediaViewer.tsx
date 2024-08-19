import React, { useState } from "react";

import { StorageResourceEntity } from "@/types/document";
import { BookOpen, FileText } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "../DocumentEditor/useStorageTextSave";

export const MediaViewer: React.FC<{ resource: StorageResourceEntity }> = ({
  resource,
}) => {
  const { file_name, metadata, url, created_at } = resource || {};
  const fileExt = metadata?.extension?.toLowerCase();
  const [hover, setHover] = useState(false);
  const { onSubmit, isPending } = useStorageTextFileSave(resource?.id);

  const formattedDate = created_at
    ? new Date(created_at).toDateString() +
      " " +
      new Date(created_at).toLocaleTimeString()
    : "Date unknown";

  const renderPreview = () => {
    switch (fileExt) {
      case ".jpg":
      case ".jpeg":
      case ".png":
      case ".gif":
        return (
          <Dialog>
            <DialogTrigger asChild>
              <div className="border rounded-lg h-auto w-auto transition-all hover:scale-105 cursor-pointer">
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
          <AspectRatio ratio={1}>
            <video controls>
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag
            </video>
          </AspectRatio>
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
              <div className="rounded-lg  transition-all hover:scale-105 cursor-pointer">
                <div className="flex  items-center p-8 ">
                  <FileText className="text-4xl" />
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
            <FileText className="text-4xl" />
          </div>
        );
    }
  };

  return (
    <div
      className="relative "
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="overflow-hidden min-h-32 max-w-96">{renderPreview()}</div>
      {hover && metadata?.description && (
        <div className="absolute bottom-0 left-0 right-0 rounded-lg p-2 bg-white max-h-[150px] overflow-auto">
          <div className="space-y-1 text-sm">
            <p className="text-xs ">{metadata?.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
