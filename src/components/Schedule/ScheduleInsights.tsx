import React, { useRef, useEffect } from "react";
import {
  Flex,
  Button,
  Box,
  Icon,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { AiTwotoneAlert } from "react-icons/ai";
import { IoAlertCircleSharp } from "react-icons/io5";

function ScheduleInsights() {
  return (
    <Flex>
      <Flex marginTop="10">
        <Button
          display="flex"
          flexDirection="column"
          marginLeft="10"
          marginRight={5}
          height="70px"
          width="100px"
        >
          <Box display="flex" flexDirection="column" width="full">
            <Box display="flex" justifyContent="flex-start" fontSize="xs">
              <AiTwotoneAlert color="red" />
            </Box>

            <Text fontWeight="bold" fontSize="2xl">
              20
            </Text>
          </Box>
          <Text fontSize="xs">Delayed</Text>
        </Button>
        <Button
          display="flex"
          flexDirection="column"
          height="70px"
          width="100px"
        >
          <Box display="flex" flexDirection="column" width="full">
            <Box display="flex" justifyContent="flex-start" fontSize="xs">
              {/* <IoAlertCircleSharp color="brand.light" /> */}
              <Icon as={IoAlertCircleSharp} color="brand.accent" />
            </Box>

            <Text fontWeight="bold" fontSize="2xl">
              20
            </Text>
          </Box>
          <Text fontSize="xs">At Risk</Text>
        </Button>
      </Flex>
    </Flex>
  );
}

export default ScheduleInsights;
