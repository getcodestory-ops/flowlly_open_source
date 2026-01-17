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
		false,
	);
	
	// Get workflow state and actions  
	const { currentGraph, graphs, setCurrentResult, setCurrentGraph } = useWorkflow((state) => ({
		currentGraph: state.currentGraph,
		graphs: state.graphs,
		setCurrentResult: state.setCurrentResult,
		setCurrentGraph: state.setCurrentGraph,
	}));
	
	const { setChatContext, setMeetingChatTags, resetForNewChat, setMeetingChatDirective, setMeetingWorkflowData, setIsFromMeetingInstance } = useChatStore();

	// Set navigation state on mount and clear on unmount
	useEffect(() => {
		setIsFromMeetingInstance(true);
		
		return () => {
			setIsFromMeetingInstance(false);
		};
	}, [setIsFromMeetingInstance]);

	// Find the meeting type (graph) from the graphs list using currentResult.event_id
	const meetingType = useMemo(() => {
		// First check if currentGraph matches
		if (currentGraph && currentGraph.id === currentResult?.event_id) {
			return currentGraph;
		}
		// Otherwise, find the meeting type from graphs list
		if (graphs && currentResult?.event_id) {
			return graphs.find((graph) => graph.id === currentResult.event_id) || null;
		}
		return currentGraph;
	}, [currentGraph, graphs, currentResult?.event_id]);

	// Extract meeting information and transcript
	const meetingInfo = useMemo(() => {
		if (!currentResult || !currentResult.nodes) {
			return null;
		}

		const meetingName = currentResult.name || "Meeting";
		const meetingDate = currentResult.run_time ? new Date(currentResult.run_time).toLocaleDateString() : "Unknown date";
		
		// Find transcript from nodes - prioritize raw_transcript_data from record_meeting
		const recordingNode = currentResult.nodes.find((node) => 
			node.id.toLowerCase().includes("record_meeting")
		);
		const rawTranscriptData = recordingNode?.output?.raw_transcript_data;
		
		let transcription = "No transcription available";
		
		if (rawTranscriptData && Array.isArray(rawTranscriptData) && rawTranscriptData.length > 0) {
			// Format raw transcript data into readable text
			// Group by participant and extract words
			const formattedTranscript: string[] = [];
			let currentParticipant = "";
			let currentText: string[] = [];
			
			rawTranscriptData.forEach((entry: any) => {
				const participantName = entry.participant?.name || "Unknown";
				const words = entry.words?.map((w: any) => w.text || w.word || "").join(" ") || "";
				
				if (participantName !== currentParticipant) {
					// Save previous participant's text
					if (currentParticipant && currentText.length > 0) {
						formattedTranscript.push(`${currentParticipant}: ${currentText.join(" ")}`);
					}
					currentParticipant = participantName;
					currentText = [words];
				} else {
					currentText.push(words);
				}
			});
			
			// Add last participant's text
			if (currentParticipant && currentText.length > 0) {
				formattedTranscript.push(`${currentParticipant}: ${currentText.join(" ")}`);
			}
			
			transcription = formattedTranscript.join("\n\n");
		} else {
			// Fallback to transcribe_meeting node output
			const transcribeNode = currentResult.nodes.find((node) => 
				node.id.toLowerCase().includes("transcribe_meeting")
			);
			if (transcribeNode?.output) {
				// Check if output is a string or object
				if (typeof transcribeNode.output === "string") {
					transcription = transcribeNode.output;
				} else if (transcribeNode.output.text) {
					transcription = transcribeNode.output.text;
				} else if (transcribeNode.output.transcript) {
					transcription = transcribeNode.output.transcript;
				}
			}
		}

		return {
			meetingName,
			meetingDate,
			transcription,
		};
	}, [currentResult]);

	const getPrompt = useCallback(() => {
		if (!meetingInfo) {
			return "";
		}

		// Build context using :::context for collapsible UI
		// Format transcript to be on single line (replace newlines with separator)
		const formattedTranscript = meetingInfo.transcription.replace(/\n\n/g, " | ").replace(/\n/g, " ");
		const prompt = `:::context\nMeeting "${meetingInfo.meetingName}" on ${meetingInfo.meetingDate}. Transcript: ${formattedTranscript}\n:::`;

		return prompt;
	}, [meetingInfo]);

	// Reset to new chat state when meeting loads or changes
	useEffect(() => {
		if (meetingInfo) {
			// Ensure workflow state is synced with the current meeting result
			setCurrentResult(currentResult);
			
			// Also set the currentGraph if we found the meetingType
			if (meetingType) {
				setCurrentGraph(meetingType);
			}
			
			// Reset for new chat to ensure fresh start
			setActiveChatEntity(null);
			setLocalChats([]);
			resetForNewChat();
			
			// Set meeting chat directive with the current meeting
			setMeetingChatDirective(currentResult.id);
			
			// Set the isFromMeetingInstance flag AFTER reset (since reset clears it)
			setIsFromMeetingInstance(true);
			
			// Store complete meeting workflow data for the form
			// Use meetingType which is derived from graphs list if currentGraph is not available
			// Always set meetingWorkflowData with at least the instance so downstream code can use currentResult.event_id
			if (setMeetingWorkflowData) {
				setMeetingWorkflowData({
					meetingType: meetingType || null,
					meetingInstance: currentResult,
				});
			}
		}
	}, [meetingInfo?.meetingName, resetForNewChat, setActiveChatEntity, setLocalChats, setMeetingChatDirective, currentResult, meetingType, setMeetingWorkflowData, setCurrentResult, setIsFromMeetingInstance, setCurrentGraph]); // Only trigger when meeting name changes

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