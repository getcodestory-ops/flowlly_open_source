import React from "react";
import { Flex } from "@chakra-ui/react";

import DocumentViewer from "../Folder/DocumentViewer";

const DocumentModule = () => {
  return (
    <Flex flexDir="column" w="full" height="100%">
      <DocumentViewer />
    </Flex>
  );
};

export default DocumentModule;
