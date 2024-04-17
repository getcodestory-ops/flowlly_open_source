import React, { useState, useEffect } from "react";
import { useDailyMessageQueue } from "./useDailyMessageQueue";

import { Button, Flex, Textarea, Text } from "@chakra-ui/react";

function DailyMessageQueue() {
  const { dailyMessageQueue, updateMessage, deleteMessage } =
    useDailyMessageQueue();

  const [messages, setMessages] = useState(dailyMessageQueue);
  useEffect(() => {
    setMessages(dailyMessageQueue);
  }, [dailyMessageQueue]);

  const updateQueue = (id: string, newMessage: string) => {
    if (!messages) return;
    const updatedMessages = messages.map((message) =>
      message.id === id ? { ...message, message: newMessage } : message
    );
    setMessages(updatedMessages);
  };

  return (
    <Flex flexDirection={"column"} width="100%" gap="4">
      {messages &&
        messages.length > 0 &&
        messages.map((message) => (
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
              rows={15} // Default number of rows
              onChange={(e) => updateQueue(message.id, e.target.value)}
            />
            <Flex gap="2">
              <Button
                size="xs"
                colorScheme="yellow"
                onClick={() => updateMessage(message)}
              >
                Update
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                onClick={() => deleteMessage(message.id)}
              >
                Reject
              </Button>
            </Flex>
          </Flex>
        ))}
    </Flex>
  );
}

export default DailyMessageQueue;
