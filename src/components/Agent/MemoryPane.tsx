import {
  Box,
  Button,
  Heading,
  List,
  ListItem,
  Icon,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const AgentMemoryPane = ({}) => {
  return (
    <Box
      backgroundColor="brand.mid"
      color="white"
      width="full"
      height="100vh"
      padding="4"
    >
      <Box marginBottom="4">
        <Heading as="h2" size="md">
          Workspaces
        </Heading>
      </Box>
      <Box marginBottom="4"></Box>
    </Box>
  );
};

export default AgentMemoryPane;
