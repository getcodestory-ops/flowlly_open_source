import React, { useRef } from "react";
import {
	Button,
	Modal,
	Flex,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Input,
	FormControl,
	Tooltip,
	Icon,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";

import { useVoiceUpload } from "./useVoiceUpload";
import { BsFiletypeMp3 } from "react-icons/bs";

function UploadVoiceModal() {
	// { documentId }: { documentId?: string | string[] }
	const { documentId } = useStore((state) => ({
		documentId: state.documentId,
	}));
	const { isOpen, onClose, onOpen, handleSubmit, mutate } = useVoiceUpload();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// useEffect(() => {
	//   //console.log("documentId", documentId);
	// }, [documentId]);

	return (
		<>
			{typeof documentId === "string" && (
				<Flex>
					<Tooltip
						bg="white"
						color="brand.dark"
						label="Upload audio file"
					>
						<Button
							_hover={{ bg: "brand.dark", color: "white" }}
							bg="white"
							boxShadow="lg"
							cursor="pointer"
							onClick={onOpen}
							size="sm"
						>
							<Icon as={BsFiletypeMp3} />
						</Button>
					</Tooltip>
					<Modal isOpen={isOpen} onClose={onClose}>
						<ModalOverlay />
						<ModalContent>
							<ModalHeader>Upload MP3 File</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<FormControl>
									<Input
										accept=".mp3"
										ref={fileInputRef}
										type="file"
									/>
								</FormControl>
							</ModalBody>
							<ModalFooter>
								<Button
									_hover={{ bg: "brand.accent", color: "brand.dark" }}
									bg="brand.dark"
									color="white"
									mr={3}
									onClick={(e) =>
										handleSubmit(documentId, fileInputRef.current?.files?.[0])
									}
									type="submit"
								>
                  Upload
								</Button>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</Flex>
			)}
		</>
	);
}

export default UploadVoiceModal;
