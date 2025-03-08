import React, { useEffect, useState } from "react";
import {
	Box,
	Flex,
	Button,
	useDisclosure,
	IconButton,
	Text,
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import { useWebSocket } from "@/hooks/useWebSocket";

function NotificationWebSocket() {
	const { onOpen } = useDisclosure();
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
				aria-label="Notifications"
				borderRadius="50%"
				icon={<FiBell />}
				onClick={onOpen}
				size="xs"
				variant="solid"
			/>
			<Flex align="center" direction="column">
				<Button onClick={handleSendNotification}>Send Notification</Button>
				<Text>Notifications:</Text>
				{notifications.map((notification, index) => (
					<Box key={index}>{notification.message}</Box>
				))}
				{/* <Text>Last message: {lastMessage}</Text> */}
			</Flex>
		</>
	);
}

export default NotificationWebSocket;
