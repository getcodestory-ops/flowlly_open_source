import React, { useCallback, useEffect, useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import type { EventResult } from "../types";
import { usePlatformChat } from "@/components/ChatInput/PlatformChat/usePlatformChat";
import ChatComponent from "@/components/ChatInput/ChatComponet";

interface MeetingChatProps {
	currentResult: EventResult;
}



export default function MeetingChatFromMeetingInstance({
	currentResult,
}: MeetingChatProps): React.ReactElement {
	const { activeProject, setActiveChatEntity, setLocalChats } = useStore((state) => ({
		activeProject: state.activeProject,
		setActiveChatEntity: state.setActiveChatEntity,
		setLocalChats: state.setLocalChats,
	}));
	const { isWaitingForResponse } = usePlatformChat(
		activeProject?.project_id || "", 
		"agent", 
		"gemini-2.5-pro", 
		false,
	);
	
	// Get workflow state and actions  
	const { currentGraph, setCurrentResult } = useWorkflow((state) => ({
		currentGraph: state.currentGraph,
		setCurrentResult: state.setCurrentResult,
	}));
	
	const { setChatContext, setMeetingChatTags, resetForNewChat, setMeetingChatDirective, setMeetingWorkflowData, setIsFromMeetingInstance } = useChatStore();

	// Set navigation state on mount and clear on unmount
	useEffect(() => {
		setIsFromMeetingInstance(true);
		
		return () => {
			setIsFromMeetingInstance(false);
		};
	}, [setIsFromMeetingInstance]);

	// Extract meeting information and transcript
	const meetingInfo = useMemo(() => {
		if (!currentResult || !currentResult.nodes) {
			return null;
		}

		const meetingName = currentResult.name || "Meeting";
		const meetingDate = currentResult.run_time ? new Date(currentResult.run_time).toLocaleDateString() : "Unknown date";
		
		// Find transcription from nodes
		const transcribeNode = currentResult.nodes.find((node) => node.id === "transcribe_meeting");
		const transcription = transcribeNode ? transcribeNode.output : "No transcription available";

		return {
			meetingName,
			meetingDate,
			transcription,
		};
	}, [currentResult]);

	const getPrompt = useCallback(() => {
		if (!meetingInfo) {
			return "Ask questions about this meeting.";
		}

		let prompt = ":::context\nYou have been provided with a meeting transcript and additional context for analysis:\n\n";

		// Add meeting transcript
		prompt += `**Meeting: ${meetingInfo.meetingName}**\n`;
		prompt += `**Date: ${meetingInfo.meetingDate}**\n\n`;
		prompt += `**Transcript:**\n${meetingInfo.transcription}\n\n`;

		// Note: Additional documents will be handled through the chat interface

		prompt += "**Please analyze the meeting content and answer questions based on the transcript and any additional documents provided.**\n:::\n";

		return prompt;
	}, [meetingInfo]);

	// Reset to new chat state when meeting loads or changes
	useEffect(() => {
		if (meetingInfo) {
			// Ensure workflow state is synced with the current meeting result
			setCurrentResult(currentResult);
			
			// Reset for new chat to ensure fresh start
			setActiveChatEntity(null);
			setLocalChats([]);
			resetForNewChat();
			
			// Set meeting chat directive with the current meeting
			setMeetingChatDirective(currentResult.id);
			
			// Set the isFromMeetingInstance flag AFTER reset (since reset clears it)
			setIsFromMeetingInstance(true);
			
			// Store complete meeting workflow data for the form
			if (currentGraph && setMeetingWorkflowData) {
				setMeetingWorkflowData({
					meetingType: currentGraph,
					meetingInstance: currentResult,
				});
			}
		}
	}, [meetingInfo?.meetingName, resetForNewChat, setActiveChatEntity, setLocalChats, setMeetingChatDirective, currentResult, currentGraph, setMeetingWorkflowData, setCurrentResult, setIsFromMeetingInstance]); // Only trigger when meeting name changes

	// Set up meeting chat context and tags after reset
	useEffect(() => {
		if (meetingInfo && !isWaitingForResponse) {
			// Set meeting-specific tags
			setMeetingChatTags(meetingInfo.meetingName);
			
			// Set the context with meeting transcript
			const prompt = getPrompt();
			setChatContext(prompt);
		}
		
		// Cleanup function to clear context when component unmounts or meeting changes
		return () => {
			if (meetingInfo) {
				setChatContext("");
			}
		};
	}, [meetingInfo, getPrompt, setChatContext, setMeetingChatTags, isWaitingForResponse]);

	if (!meetingInfo) {
		return (
			<div className="flex items-center justify-center h-full text-gray-500">
				<div className="text-center">
					<MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
					<p>No meeting data available for chat</p>
				</div>
			</div>
		);
	}


	return (
		<div className="h-full">
			<ChatComponent />
		</div>
	);
}