import React, { useState } from "react";
import { Grid, GridItem, Text, Flex, Icon } from "@chakra-ui/react";

import DocumentViewer from "../Folder/DocumentViewer";

const DocumentModule = () => {
  return (
    <Flex flexDir="column" w="full" height="100%">
      <DocumentViewer />
    </Flex>
  );
};

export default DocumentModule;
