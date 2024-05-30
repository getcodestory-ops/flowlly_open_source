import { UpdateProperties } from "@/types/updates";
import { Button, Flex, Text } from "@chakra-ui/react";

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
      <Text
        fontSize={"14px"}
        fontWeight={"bold"}
        cursor="pointer"
        as={"u"}
        onClick={() => setPreviewCardContent(null)}
      >
        Home
      </Text>

      <Flex
        w="full"
        mb={"2"}
        p={"2"}
        fontSize="sm"
        background={"brand.background"}
        dropShadow={"lg"}
        cursor={"pointer"}
        display="flex"
        flexDirection="row"
        justifyContent={"space-between"}
        borderRadius={"md"}
        _hover={{ bg: "brand.dark", color: "white" }}
        onClick={() => setUpdateType("ACTION")}
      >
        Daily Report
      </Flex>
      <Flex
        w="full"
        mb={"2"}
        p={"2"}
        fontSize="sm"
        background={"brand.background"}
        dropShadow={"lg"}
        cursor={"pointer"}
        display="flex"
        flexDirection="column"
        borderRadius={"md"}
        _hover={{ bg: "brand.dark", color: "white" }}
        onClick={() => setUpdateType("MESSAGE")}
      >
        Messages
      </Flex>
      <Flex
        w="full"
        mb={"2"}
        p={"2"}
        fontSize="sm"
        background={"brand.background"}
        dropShadow={"lg"}
        cursor={"pointer"}
        display="flex"
        flexDirection="column"
        borderRadius={"md"}
        _hover={{ bg: "brand.dark", color: "white" }}
        onClick={() => setUpdateType("IMPACT")}
      >
        Impact
      </Flex>
    </Flex>
  );
}

export default UpdateViewer;
