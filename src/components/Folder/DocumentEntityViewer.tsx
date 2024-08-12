import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getcontainerEntities } from "@/api/documentRoutes";
import {
  Grid,
  Box,
  Image,
  Text,
  Icon,
  AspectRatio,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { StorageEntity, ContainerResources } from "@/types/document";
import { FiFileText } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";

const FilePreview: React.FC<{ resource: ContainerResources }> = ({
  resource,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
          <div className="border rounded-lg h-auto w-auto transition-all hover:scale-105 ">
            <Image
              src={url}
              alt={file_name}
              objectFit="cover"
              onClick={onOpen}
              cursor="pointer"
            />
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalCloseButton />
                <ModalBody p={2}>
                  <Image src={url} alt={file_name} />
                </ModalBody>
              </ModalContent>
            </Modal>
          </div>
        );
      case ".mp4":
      case ".webm":
        return (
          <AspectRatio ratio={16 / 9}>
            <video src={url} controls width="100%" height="100%">
              Your browser does not support the video tag.
            </video>
          </AspectRatio>
        );
      case ".mp3":
      case ".ogg":
      case ".wav":
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            h="100%"
            p={4}
          >
            <Box width="100%" minWidth="300px">
              <audio src={url} controls style={{ width: "100%" }}>
                Your browser does not support the audio element.
              </audio>
            </Box>
          </Box>
        );
      default:
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100%"
          >
            <Icon as={FiFileText} fontSize="4xl" />
          </Box>
        );
    }
  };

  return (
    <Box
      position="relative"
      h="100%"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AspectRatio ratio={1}>
        <Box overflow="hidden">{renderPreview()}</Box>
      </AspectRatio>
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        borderRadius={"lg"}
        p={2}
        bg="white"
        maxH="150px"
        overflow={"auto"}
      >
        {hover && (
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">
              {metadata?.description}
            </p>
          </div>
        )}
        <Text fontSize="xs">{formattedDate}</Text>
      </Box>
    </Box>
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

  if (isLoading) return <Spinner />;
  if (!data || data.length === 0) return <Text>No media files found.</Text>;

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
        <Separator className="my-4 " />
        <div className="relative">
          <div className="grid w-full gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 ">
            {data.flatMap((entity) =>
              entity.storage_relations.map((resource, index) => (
                <div
                  key={`${entity.id}-${index}`}
                  className="w-[350px] h-[350px] rounded-md  bg-muted/40 rounded-lg overflow-hidden "
                >
                  <FilePreview
                    key={`${entity.id}-${index}`}
                    resource={resource}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEntityViewer;
