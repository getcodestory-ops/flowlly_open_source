import React from "react";
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
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import NotificationWebSocket from "./NotificationWebSocket";

function NotificationButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
              <NotificationWebSocket />
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
