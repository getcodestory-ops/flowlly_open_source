import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getcontainerEntities } from "@/api/documentRoutes";
import { StorageEntity, ContainerResources } from "@/types/document";
import { FiFileText } from "react-icons/fi";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const FilePreview: React.FC<{ resource: ContainerResources }> = ({
  resource,
}) => {
  const { file_name, metadata, url, created_at } =
    resource.storage_resources || {};
  const fileExt = metadata?.extension?.toLowerCase();
  const [hover, setHover] = useState(false);

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
            <DialogContent className="sm:max-w-[425px]">
              <img src={url} alt={file_name} />
            </DialogContent>
          </Dialog>
        );
      case ".mp4":
      case ".webm":
        return (
          <AspectRatio ratio={16 / 9}>
            <video controls>
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
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
      default:
        return (
          <div className="flex items-center justify-center ">
            <FiFileText className="text-4xl" />
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
      <div className="overflow-hidden">{renderPreview()}</div>

      <div className="absolute bottom-0 left-0 right-0 rounded-lg p-2 bg-white max-h-[150px] overflow-auto">
        {hover && (
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">
              {metadata?.description}
            </p>
          </div>
        )}
        <p className="text-xs">{formattedDate}</p>
      </div>
    </div>
  );
};

const DocumentEntityViewer: React.FC = () => {
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const { data, isLoading } = useQuery<StorageEntity[]>({
    queryKey: ["mediaDocumentList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("no session or project");
      return getcontainerEntities(session, activeProject.project_id, "media");
    },
    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data || data.length === 0) return <p>No media files found.</p>;

  return (
    <div className="h-full">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Media Files
            </h2>
            <p className="text-sm text-muted-foreground">
              Updates on media files in the project
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid w-full gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {data.flatMap((entity) =>
              entity.storage_relations.map((resource, index) => (
                <Card
                  key={`${entity.id}-${index}`}
                  className="w-[350px] h-[350px] overflow-hidden"
                >
                  <CardContent className="p-0">
                    <FilePreview resource={resource} />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DocumentEntityViewer;
