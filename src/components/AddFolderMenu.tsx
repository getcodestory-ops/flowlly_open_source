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
						className="custom-selector"
						onChange={(e) => setFolderName(e.target.value)}
						placeholder="Folder Name"
						value={folderName}
					/>
				</ModalBody>
				<ModalFooter>
					<Button
						_hover={{ bg: "brand.accent", color: "brand.dark" }}
						bg="brand.dark"
						color="white"
						disabled={!folderName}
						mr={3}
						onClick={handleCreateFolder}
					>
            Create
					</Button>
					<Button onClick={onClose} variant="ghost">
            Cancel
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
