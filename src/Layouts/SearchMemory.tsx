import React, { useEffect, useState } from "react";
import {
	Button,
	Flex,
	Box,
	Icon,
	useToast,
	Input,
	Heading,
	Stack,
	Collapse,
	useBreakpointValue,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuDivider,
	Text,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { Session } from "@supabase/supabase-js";
import {
	getChatSessions,
	deleteChatSession,
	updateChatSessionName,
} from "@/api/chatRoutes";
import { getAgentChats } from "@/api/agentRoutes";
import CreateNewChatButton from "@/components/CreateNewChatButton";
import { FiEdit, FiTrash, FiCheck, FiX } from "react-icons/fi";
import { BsChatLeftDots } from "react-icons/bs";
import { MdBorderColor } from "react-icons/md";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

const SearchMemory = () => {
	const toast = useToast();
	const {
		session,
		chatSession,
		setChatSession,
		setChatSessions,
		chatSessions,
		activeProject,
	} = useStore((state) => ({
		session: state.session,
		chatSession: state.chatSession,
		setChatSession: state.setChatSession,
		setChatSessions: state.setChatSessions,
		chatSessions: state.chatSessions,
		activeProject: state.activeProject,
	}));

	const [refreshChatList, setRefreshChatList] = useState<boolean>(false);
	const [editChatSessionId, setEditChatSessionId] = useState<string>("");
	const [newChatSessionName, setNewChatSessionName] = useState<string>("");
	const [show, setShow] = useState(false);
	const isLargerThanLg = useBreakpointValue({ base: false, lg: false });

	const deleteChat = async(chatId: string) => {
		if (!session) return;
		const response = await deleteChatSession(session, chatId);
		setChatSession(null);
		setChatSessions(chatSessions.filter((chats) => chats.chat_id !== chatId));
		toast({
			title: response.message,
			status: "success",
			duration: 2000,
			isClosable: true,
			position: "top-right",
		});
	};

	useEffect(() => {
		if (!session || !activeProject) return;

		const fetchchat = async() => {
			try {
				const chats = await getChatSessions(session, activeProject.project_id);
				setChatSessions(chats);
				setChatSession(chats[0]);
			} catch (error) {
				console.error("There was a problem with the fetch operation:", error);
			}
		};
		fetchchat();
	}, [session, activeProject]);

	useEffect(() => {
		if (isLargerThanLg !== undefined) {
			setShow(isLargerThanLg);
		}
	}, [isLargerThanLg]);

	const editChatSessionMetadata = async(chatId: string) => {
		setEditChatSessionId("");
		const updateChat = await updateChatSessionName(
      session!,
      chatId,
      newChatSessionName,
		);
		setChatSessions([
			updateChat,
			...chatSessions.filter((chats) => chats.chat_id !== chatId),
		]);
		toast({
			title: `Successfully updated  ${updateChat.chat_name}`,
			status: "success",
			duration: 2000,
			isClosable: true,
			position: "top-right",
		});
	};

	return (
		<Flex
			flexDirection="column"
			borderColor="gray.200"
			// position={"absolute"}
			// mx="32"
			// top="28"
			// zIndex={"overlay"}
			fontSize="xs"
		>
			<Menu>
				<MenuButton
					_hover={{ bg: "brand.dark", color: "white" }}
					as={Button}
					bg="white"
					rightIcon={<IoChevronDown />}
					size="xs"
				>
          Saved Chats
				</MenuButton>
				<MenuList>
					<MenuItem>
						<CreateNewChatButton />
					</MenuItem>
					<MenuDivider />
					{chatSessions.length > 0 &&
            chatSessions.map((chats, index) => (
            	<MenuItem
            		_hover={{ bg: "gray.100" }}
            		key={`chat-${chats.chat_id}-index-${index}`}
            		onClick={() => setChatSession(chats)}
            	>
            		<Flex
            			alignItems="center"
            			justifyContent="space-between"
            			w="full"
            		>
            			<Flex alignItems="center">
            				<Icon as={BsChatLeftDots} mr={4} />
            				<Text
            					fontWeight={
            						chats.chat_id === chatSession?.chat_id ? "bold" : ""
            					}
            				>
            					{chats.chat_name}
            				</Text>
            			</Flex>
            			{editChatSessionId !== chats?.chat_id &&
                    chats.chat_id === chatSession?.chat_id && (
            				<Flex>
            					<Flex
            						_hover={{ bg: "brand.dark", color: "white" }}
            						color="brand.dark"
            						onClick={() => {
            							setNewChatSessionName(chatSession?.chat_name);
            							setEditChatSessionId(chatSession?.chat_id);
            						}}
            					>
            						<Icon as={FiEdit} />
            					</Flex>
            					<Flex
            						_hover={{ bg: "brand.dark", color: "white" }}
            						color="brand.dark"
            						onClick={() => deleteChat(chatSession?.chat_id)}
            					>
            						<Icon as={FiTrash} />
            					</Flex>
            				</Flex>
            			)}
            			{editChatSessionId === chats?.chat_id && (
            				<Flex alignItems="center" flexGrow={1}>
            					<Input
            						ml={4}
            						onChange={(e) => setNewChatSessionName(e.target.value)}
            						placeholder={chats.chat_name}
            						value={newChatSessionName!}
            					/>
            					<Button
            						_hover={{ bg: "gray.200" }}
            						color="brand.dark"
            						onClick={() => {
            							chatSession
            								? editChatSessionMetadata(chatSession?.chat_id)
            								: null;
            						}}
            						size="sm"
            						variant="ghost"
            					>
            						<Icon as={FiCheck} />
            					</Button>
            					<Button
            						_hover={{ bg: "gray.200" }}
            						color="brand.dark"
            						onClick={() => setEditChatSessionId("")}
            						size="sm"
            						variant="ghost"
            					>
            						<Icon as={FiX} />
            					</Button>
            				</Flex>
            			)}
            		</Flex>
            	</MenuItem>
            ))}
				</MenuList>
			</Menu>
		</Flex>
	);
};

export default SearchMemory;
