import React from "react";
import { Button, Text, Flex, Box, Heading } from "@chakra-ui/react";

const IntegrationHandler = () => {
  return (
    <Flex direction="column" height="100vh" bg="brand.mid" width="full" p="4">
      <Box marginBottom="4">
        <Heading as="h2" size="md" color="white">
          Integrations
        </Heading>
      </Box>
      <Button
        bg="brand.dark"
        colorScheme="teal"
        size="sm"
        _hover={{ bg: "brand.accent", color: "brand.dark" }}
      >
        Prolog integration coming soon
      </Button>
    </Flex>
  );
};

export default IntegrationHandler;
