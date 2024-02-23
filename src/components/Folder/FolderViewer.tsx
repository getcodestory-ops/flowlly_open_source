import React, { useState } from "react";
import { useStore } from "@/utils/store";
import { Flex, Box, Icon, Text } from "@chakra-ui/react";
import { CiFolderOn } from "react-icons/ci";

function FolderViewer({
  folderView,
  setFolderView,
}: {
  folderView: boolean;
  setFolderView: (value: boolean) => void;
}) {
  const { folderList, selectedContext, setSelectedContext } = useStore(
    (state) => ({
      folderList: state.folderList,
      selectedContext: state.selectedContext,
      setSelectedContext: state.setSelectedContext,
    })
  );

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
            bg="brand.background"
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
              p={4}
              borderRadius="md"
              cursor="pointer"
            >
              <Icon as={CiFolderOn} color="inherit" w={4} h={4} mb={2} />
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
