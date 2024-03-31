import React, { useState } from "react";
import {
  Box,
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

function NotificationButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState([
    { message: "New project created" },
  ]);

  return (
    <>
      <IconButton
        icon={<FiBell />}
        variant="outline"
        onClick={onOpen}
        aria-label="Notifications"
        borderRadius={"50%"}
      />

      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"} isCentered={false}>
        <ModalOverlay />
        <ModalContent
          marginTop="8rem" // Adjust top margin to position from the top
          marginRight="1rem" // Adjust right margin to position from the right
          marginLeft="auto" // Automatically adjust the left margin
          marginBottom="auto"
        >
          <ModalHeader>Notifications</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {notifications.length ? (
              notifications.map((notification, index) => (
                <Box key={index} p={2} borderBottomWidth="1px">
                  <Text>{notification.message}</Text>
                </Box>
              ))
            ) : (
              <Text>No new notifications.</Text>
            )}
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
