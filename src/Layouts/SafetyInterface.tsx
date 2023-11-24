import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import DatePicker from "@/components/DatePicker/DatePicker";

function SafetyInterface() {
  return (
    <Flex>
      <Box>Safety Interface</Box>
      <DatePicker />
    </Flex>
  );
}

export default SafetyInterface;
