import React, { useState, useEffect } from "react";
import { useDailyMessageQueue } from "./useDailyMessageQueue";

import {
  Button,
  Flex,
  Textarea,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Icon,
  TableContainer,
} from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";

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
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th width="20%">Contact</Th>
              <Th width="80%">Message</Th>
            </Tr>
          </Thead>
          <Tbody>
            {messages &&
              messages.length > 0 &&
              messages.map((message) => (
                <Tr
                  key={message.id}
                  flexDirection={"row"}
                  gap="2"
                  fontSize="xs"
                  p="8"
                  borderBottom={"2px solid #E2E8F0"}
                >
                  <Td>
                    {message.action && (
                      <>
                        <Text>Email : {message.action.email ?? ""}</Text>
                        <Text>Phone Number : {message.action.phone ?? ""}</Text>

                        <Flex gap="2">
                          {message.status === "Done" ? (
                            <Icon color={"green.600"} as={FaCheck} />
                          ) : (
                            <>
                              <Icon
                                as={FaCheck}
                                onClick={() => updateMessage(message)}
                                cursor="pointer"
                              />
                              <Icon
                                as={VscChromeClose}
                                onClick={() => deleteMessage(message.id)}
                                cursor="pointer"
                              />
                            </>
                          )}
                        </Flex>
                      </>
                    )}
                  </Td>
                  <Td>
                    <Textarea
                      value={message.message}
                      width={"full"}
                      size="xs"
                      rows={12} // Default number of rows
                      onChange={(e) => updateQueue(message.id, e.target.value)}
                    />
                  </Td>

                  {/* <Td>
                    <Flex gap="2">
                      <Icon
                        as={FaCheck}
                        onClick={() => updateMessage(message)}
                        cursor="pointer"
                      />

                      <Icon
                        as={VscChromeClose}
                        onClick={() => deleteMessage(message.id)}
                        cursor="pointer"
                      />
                    </Flex>
                  </Td> */}
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}

export default DailyMessageQueue;
