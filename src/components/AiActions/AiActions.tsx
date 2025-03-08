import React, { useEffect, useState } from "react";
import { Flex, Grid, GridItem, Icon, Button, Tooltip } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { PiRobot } from "react-icons/pi";
import { getBrains } from "@/api/brainRoutes";
import { getChatSessions } from "@/api/chatRoutes";
import { getFirstFiveWords } from "@/utils/getFirstWords";
import { createNewChatSession, getChatHistory } from "@/api/chatRoutes";
import {
	getContext,
	updateContext,
	getContexualAnswer,
} from "@/utils/getAiAnswers";
import ChatComponent from "../ChatInput/ChatComponet";

function AiActions() {
	const [chatInput, setChatInput] = useState("");

	const {
		AiActionsView,
		setAiActionsView,
		sessionToken,
		chatSession,
		chatSessions,
		selectedContext,
		folderList,
		setSelectedContext,
		setChatSessions,
		setChatSession,
		setChatHistory,
		updateChatHistory,
		setFolderList,
		activeProject,
	} = useStore((state) => ({
		AiActionsView: state.AiActionsView,
		setAiActionsView: state.setAiActionsView,
		sessionToken: state.session,
		chatSession: state.chatSession,
		chatSessions: state.chatSessions,
		selectedContext: state.selectedContext,
		setSelectedContext: state.setSelectedContext,
		folderList: state.folderList,
		setChatSessions: state.setChatSessions,
		setChatSession: state.setChatSession,
		setChatHistory: state.setChatHistory,
		updateChatHistory: state.updateChatHistory,
		activeProject: state.activeProject,
		setFolderList: state.setFolderList,
	}));

	useEffect(() => {
		if (!sessionToken || chatSessions.length > 0) return;
		const fetchchat = async() => {
			try {
				if (!activeProject) return;
				const chats = await getChatSessions(
					sessionToken,
					activeProject?.project_id,
				);
				setChatSessions(chats);
				setChatSession(chats[0]);
			} catch (error) {
				console.error("There was a problem with the fetch operation:", error);
			}
		};
		fetchchat();
	}, [sessionToken]);

	useEffect(() => {
		const fetchFolderLists = async() => {
			if (!sessionToken || !activeProject?.project_id) return;
			const brains = await getBrains(sessionToken, activeProject.project_id);
			setFolderList(brains || null);
		};

		fetchFolderLists();
	}, [sessionToken, setFolderList, activeProject]);

	useEffect(() => {
		if (!sessionToken || !chatSession) return;
		const fetchChatHistory = async() => {
			try {
				const chats = await getChatHistory(sessionToken, chatSession.chat_id);
				setChatHistory([]);
				updateChatHistory(chatSession.chat_id, chats);
			} catch (error) {
				console.error("There was a problem with the fetch operation:", error);
			}
		};
		fetchChatHistory();
	}, [sessionToken, chatSession, setChatHistory, updateChatHistory]);

	useEffect(() => {
		if (!folderList) return;

		setSelectedContext(folderList?.[0] ?? null);
	}, [folderList, setSelectedContext]);

	return (
		<Flex h="full" w="full">
			{AiActionsView === "open" && <ChatComponent />}
		</Flex>
	);
}

export default AiActions;
