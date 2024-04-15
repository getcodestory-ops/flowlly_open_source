import React, { useEffect } from "react";
import { useDailyMessageQueue } from "./useDailyMessageQueue";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Box,
  Flex,
  Textarea,
  Text,
} from "@chakra-ui/react";

function DailyMessageQueue() {
  const { dailyMessageQueue } = useDailyMessageQueue();

  useEffect(() => {
    console.log(dailyMessageQueue);
  }, [dailyMessageQueue]);

  //   const updateMessage = (id: string, newMessage: string) => {
  //     const updatedMessages = messages.map((message) =>
  //       message.id === id ? { ...message, message: newMessage } : message
  //     );
  //     setMessages(updatedMessages);
  //   };

  return (
    <Flex flexDirection={"column"} width="100%" gap="4">
      {dailyMessageQueue &&
        dailyMessageQueue.map((message) => (
          <Flex
            key={message.id}
            flexDirection={"column"}
            gap="2"
            fontSize="xs"
            p="8"
            borderBottom={"2px solid #E2E8F0"}
          >
            <Text>Email : {message.action.email ?? ""}</Text>
            <Text>Phone Number : {message.action.phone ?? ""}</Text>

            <Textarea
              value={message.message}
              width={"full"}
              size="xs"
              rows={20} // Default number of rows
              //   onChange={(e) =>
              //     updateMessage(message.id, e.target.value)
              //   }
            />
            <Flex>
              <Button
                size="xs"
                colorScheme="yellow"
                //   onClick={() => updateMessage(message.id, message.message)}
              >
                Update
              </Button>
            </Flex>
          </Flex>
        ))}
    </Flex>
  );
}

export default DailyMessageQueue;
