// components/ConsentModal.js
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Link,
} from "@chakra-ui/react";

interface ConsentModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function ConsentModal({ isOpen, onOpen, onClose }: ConsentModalProps) {
  return (
    <>
      {/* <Button onClick={onOpen}>Review SMS Policy</Button> */}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review SMS Policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Please review the{" "}
            <Link href="/sms-policy" isExternal color="blue.500">
              SMS policy
            </Link>{" "}
            and click OK to continue.
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                //console.log("Consent given");
                onClose();
              }}
            >
              OK
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ConsentModal;
