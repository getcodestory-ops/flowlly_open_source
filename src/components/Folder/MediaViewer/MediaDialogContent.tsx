import { StorageResourceEntity } from "@/types/document";
import { FileText } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";

import { useStorageTextFileSave } from "@/components/DocumentEditor/useStorageTextSave";
interface MediaDialogContentProps {
  resource: StorageResourceEntity;
}

export const MediaDialogContent: React.FC<MediaDialogContentProps> = ({
  resource,
}) => {
  const { file_name, metadata, url } = resource || {};
  const description = metadata?.description;
  const fileExt = metadata?.extension?.toLowerCase();

  const { onSubmit, isPending } = useStorageTextFileSave(resource?.id);
  switch (fileExt) {
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return (
        <>
          <img
            src={url}
            alt={file_name}
            className="align-middle object-cover max-h-80"
          />
          <DescriptionContent description={description} />
        </>
      );
    case ".mp4":
    case ".webm":
      return (
        <>
          {/* <AspectRatio ratio={1}> */}
          <div className="max-h-96  overflow-auto">
            <video controls>
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag
            </video>
          </div>
          {/* </AspectRatio> */}
          <DescriptionContent description={description} />
        </>
      );
    case ".mp3":
    case ".ogg":
    case ".wav":
      return (
        <>
          <div className="flex flex-col items-center justify-center  p-4">
            <div className="w-full min-w-[300px]">
              <audio src={url} controls style={{ width: "100%" }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
          <DescriptionContent description={description} />
        </>
      );
    case ".txt":
      return (
        <ContentEditor content={metadata?.content} saveFunction={onSubmit} />
      );
    default:
      return (
        <>
          <FileText className="text-4xl" />
          Sorry No Preview Available
          <DescriptionContent description={description} />
        </>
      );
  }
};

const DescriptionContent = ({ description }: { description: string }) => {
  return (
    <div className="rounded-lg p-2 bg-white max-h-96 overflow-auto">
      <div className="space-y-1 text-sm">
        <p className="text-sm ">{description}</p>
      </div>
    </div>
  );
};
