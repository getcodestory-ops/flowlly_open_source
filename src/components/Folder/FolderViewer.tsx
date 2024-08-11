import React from "react";
import { useStore } from "@/utils/store";
import { Flex, Box, Icon, Text } from "@chakra-ui/react";
import { CiFolderOn } from "react-icons/ci";

function FolderViewer({
  setFolderView,
}: {
  folderView: boolean;
  setFolderView: (value: boolean) => void;
}) {
  const { folderList, setSelectedContext } = useStore((state) => ({
    folderList: state.folderList,
    setSelectedContext: state.setSelectedContext,
  }));

  return (
    <Flex direction={"column"} gap="4">
      {folderList &&
        folderList.map((folder) => (
          <Box
            key={folder.name}
            onClick={() => {
              setSelectedContext(folder);
              setFolderView(false);
            }}
            bg="brand.gray"
            sx={{
              cursor: "pointer",
              borderRadius: "md",
              "&:hover": {
                bg: "brand.dark",
                color: "white",
              },
            }}
          >
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              py={2}
              cursor="pointer"
            >
              <Icon as={CiFolderOn} color="inherit" h={4} mb={2} />
              <Text textAlign="center" fontSize="md">
                {folder.name}
              </Text>
            </Flex>
          </Box>
        ))}
    </Flex>
  );
}

export default FolderViewer;
