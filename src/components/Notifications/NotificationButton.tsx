import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import ScheduleNotifications from "./ScheduleNotifications";
import { useWebSocket } from "@/hooks/useWebSocket";

function NotificationButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [counter, setCounter] = useState(0);

  const [notifications, setNotifications] = useState([
    { message: "New project created" },
  ]);
  const { isConnected, lastMessage, sendMessage } = useWebSocket();

  const handleSendNotification = () => {
    setCounter((state) => state + 1);
    sendMessage(`${counter} New notification`);
  };

  useEffect(() => {
    if (isConnected && lastMessage) {
      setNotifications((state) => [...state, { message: lastMessage }]);
    }
  }, [isConnected, lastMessage]);

  return (
    <>
      <IconButton
        icon={<FiBell />}
        size="xs"
        variant="solid"
        onClick={onOpen}
        aria-label="Notifications"
        borderRadius={"50%"}
      />

      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"} isCentered={false}>
        <ModalOverlay />
        <ModalContent // Adjust top margin to position from the top
          marginRight="1rem" // Adjust right margin to position from the right
          marginLeft="auto"
          backgroundColor="brand.light"
        >
          <ModalCloseButton />
          <ModalBody maxH={"50vh"} overflow="auto">
            This is notification area
            {/* <ScheduleNotifications /> */}
            <Flex direction="column" align="center">
              <Button onClick={handleSendNotification}>
                Send Notification
              </Button>
              <Text>Notifications:</Text>
              {notifications.map((notification, index) => (
                <Box key={index}>{notification.message}</Box>
              ))}
              {/* <Text>Last message: {lastMessage}</Text> */}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="yellow" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default NotificationButton;
