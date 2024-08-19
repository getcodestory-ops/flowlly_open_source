import { DialogContent } from "@/components/ui/dialog";

import { StorageResourceEntity } from "@/types/document";
import { FileText } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";

interface MediaDialogTriggerProps {
  file: StorageResourceEntity;
  onSubmit?: () => void;
}

export const MediaDialogTrigger: React.FC<MediaDialogTriggerProps> = ({
  file,
  onSubmit,
}) => {
  const { file_name, metadata, url } = file || {};
  const description = metadata?.description;
  const fileExt = metadata?.extension?.toLowerCase();
  switch (fileExt) {
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return (
        <DialogContent className="">
          <img src={url} alt={file_name} />
          <p className="text-center">{description}</p>
        </DialogContent>
      );
    case ".mp4":
    case ".webm":
      return (
        <DialogContent className="">
          <AspectRatio ratio={1}>
            <video controls>
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag
            </video>
          </AspectRatio>
          <p className="text-center">{description}</p>
        </DialogContent>
      );
    case ".mp3":
    case ".ogg":
    case ".wav":
      return (
        <DialogContent className="">
          <div className="flex flex-col items-center justify-center  p-4">
            <div className="w-full min-w-[300px]">
              <audio src={url} controls style={{ width: "100%" }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
          <p className="text-center">{description}</p>
        </DialogContent>
      );
    case ".txt":
      return (
        <DialogContent className="max-w-6xl ">
          <ContentEditor content={metadata?.content} saveFunction={onSubmit} />
        </DialogContent>
      );
    default:
      return (
        <DialogContent className="flex items-center justify-center ">
          <FileText className="text-4xl" />
          Sorry No Preview Available
          <p className="text-center">{description}</p>
        </DialogContent>
      );
  }
};
