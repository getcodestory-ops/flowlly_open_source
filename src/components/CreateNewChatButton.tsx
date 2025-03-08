import React from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useStore } from "@/utils/store";

const CreateNewChatButton = () => {
	const setChatSession = useStore((state) => state.setChatSession);
	const setChatHistory = useStore((state) => state.setChatHistory);
	const setActiveChatEntity = useStore((state) => state.setActiveChatEntity);
	const setLocalChats = useStore((state) => state.setLocalChats);

	const createNewChat = () => {
		// setChatSession(null);
		// setChatHistory([]);
		setActiveChatEntity(null);
		setLocalChats([]);
	};

	return (
	// <Flex
	//   display="flex"
	//   alignItems="center"
	//   p={2}
	//   width="full"
	//   borderRadius="md"
	// >
		<Flex
			_hover={{ bg: "none", color: "brand.dark" }}
			align="center"
			bg="none"
			borderRadius="md"
			cursor="pointer"
			gap="2"
			justify="center"
			onClick={() => createNewChat()}
			p="2"
			width="full"
		>
			<Icon as={FiPlus} />
			<Text noOfLines={{ base: 2, md: 1 }} width="full">
        New Chats
			</Text>
		</Flex>
	// </Flex>
	);
};

export default CreateNewChatButton;
