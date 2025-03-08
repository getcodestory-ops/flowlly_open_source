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
// import ScheduleNotifications from "./ScheduleNotifications";
// import { useWebSocket } from "@/hooks/useWebSocket";
import StreamingResponse from "./StreamWebResponse";

function NotificationButton() {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			<IconButton
				aria-label="Notifications"
				borderRadius="50%"
				icon={<FiBell />}
				onClick={onOpen}
				size="xs"
				variant="solid"
			/>
			<Modal
				isCentered={false}
				isOpen={isOpen}
				onClose={onClose}
				size="2xl"
			>
				<ModalOverlay />
				<ModalContent // Adjust top margin to position from the top
					backgroundColor="brand.light"
					marginLeft="auto"
					marginRight="1rem" // Adjust right margin to position from the right
				>
					<ModalCloseButton />
					<ModalBody maxH="50vh" overflow="auto">
            Notifications
						{/* <ScheduleNotifications /> */}
						<Flex align="center" direction="column">
							{/* <StreamingResponse /> */}
						</Flex>
					</ModalBody>
					<ModalFooter>
						<Button
							colorScheme="yellow"
							mr={3}
							onClick={onClose}
						>
              Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}

export default NotificationButton;
