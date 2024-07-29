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
  Tooltip,
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
import { FaRegFileAudio } from "react-icons/fa6";

const FilePreview: React.FC<{ resource: ContainerResources }> = ({
  resource,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { file_name, metadata, url, created_at } =
    resource.storage_resources || {};
  const fileExt = metadata?.extension?.toLowerCase();
  const [hover, setHover] = useState(false);

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString()
    : "Date unknown";

  const renderPreview = () => {
    switch (fileExt) {
      case ".jpg":
      case ".jpeg":
      case ".png":
      case ".gif":
        return (
          <>
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
                <ModalBody p={0}>
                  <Image src={url} alt={file_name} />
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
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
        bg="blackAlpha.600"
        color="white"
        borderRadius={"lg"}
        p={2}
        maxH="150px"
        overflow={"auto"}
      >
        {hover && <Text fontSize="sm">{metadata?.description}</Text>}
        <Text fontSize="xs">{formattedDate}</Text>
      </Box>
    </Box>
  );
};

const MediaGallery: React.FC = () => {
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
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
      {data.flatMap((entity) =>
        entity.storage_relations.map((resource, index) => (
          <FilePreview key={`${entity.id}-${index}`} resource={resource} />
        ))
      )}
    </Grid>
  );
};

export default MediaGallery;
