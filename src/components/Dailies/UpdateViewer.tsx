import { UpdateProperties } from "@/types/updates";
import { IconButton, Flex, Text } from "@chakra-ui/react";
import { IoMdArrowRoundBack } from "react-icons/io";

interface UpdateViewerProps {
  previewCardContent: Record<string, any>;
  setPreviewCardContent: React.Dispatch<
    React.SetStateAction<UpdateProperties | null>
  >;
  setUpdateType: React.Dispatch<
    React.SetStateAction<"ACTION" | "MESSAGE" | "IMPACT">
  >;
}

function UpdateViewer({
  previewCardContent,
  setPreviewCardContent,
  setUpdateType,
}: UpdateViewerProps) {
  return (
    <Flex flexDirection={"column"} gap="2">
      <IconButton
        aria-label="Back"
        size="sm"
        icon={<IoMdArrowRoundBack />}
        onClick={() => setPreviewCardContent(null)}
      />
    </Flex>
  );
}

export default UpdateViewer;
