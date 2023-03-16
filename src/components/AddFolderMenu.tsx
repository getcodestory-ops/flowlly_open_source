import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

interface FolderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

export default function AddFolderMenu({
  isOpen,
  onClose,
  onCreateFolder,
}: FolderFormProps) {
  const [folderName, setFolderName] = useState("");

  const handleCreateFolder = () => {
    onCreateFolder(folderName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Folder</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            colorScheme="blackAlpha"
            onClick={handleCreateFolder}
            ml={3}
            disabled={!folderName}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
