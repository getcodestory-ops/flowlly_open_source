import React, { useState } from "react";
import {
	Video,
	List,
	FileText,
	MessageSquare,
	LogsIcon,
	Calendar,
	ArrowLeft,
} from "lucide-react";
import ActionItemViewer from "@/components/AiActions/ActionItemViewer";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltipped } from "@/components/Common/Tooltiped";
import type { NodeData, ActionData, EventResult } from "./types";
import { useStore } from "@/utils/store";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/hooks/useChatStore";

import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
import MeetingChatFromMeetingInstance from "./Meeting/MeetingChatFromMeetingInstance";
import MeetingRecording from "./Meeting/MeetingRecording";
import MinutesViewer from "./Meeting/MinutesViewer";
import MeetingAgendaViewer from "./Meeting/MeetingAgendaViewer";

interface ResultViewerProps {
  currentResult: EventResult;
  cacheId?: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
	currentResult,
	cacheId: _CACHE_ID,
}) => {
	const session = useStore((state) => state.session);
	const { activeProject, setAppView } = useStore((state) => ({
		activeProject: state.activeProject,
		setAppView: state.setAppView,
	}));
	const { setCurrentResult } = useWorkflow();
	const { clearChatContext, setChatDirectiveType } = useChatStore();
	const router = useRouter();

	// Handler for back button
	const handleBackToMeetings = (): void => {
		// Clear any meeting context when leaving the meeting view
		clearChatContext();
		setChatDirectiveType("chat");
		
		setCurrentResult(null);
		setAppView("meetings");
		if (activeProject) {
			router.push(`/project/${activeProject.project_id}/meetings`);
		}
	};

	// Get specific nodes from the workflow
	const getNodeByType = (type: string): NodeData | undefined => {
		return currentResult?.nodes?.find((node) => 
			node.id.toLowerCase().includes(type.toLowerCase()),
		);
	};

	const recordingNode = getNodeByType("record_meeting");
	const transcribeNode = getNodeByType("transcribe_meeting");
	const minutesNode = getNodeByType("save_minutes_in_project_documents");
	const actionItemsNode = getNodeByType("determine_action_items");
	const distributeNode = getNodeByType("distribute_minutes_of_meeting");
	const meetingAgendaNode = getNodeByType("create_next_meeting_agenda");


	
	// Helper function to check if agenda is available
	const isAgendaAvailable = (): boolean => {
		if (!meetingAgendaNode) return false;
		if (!meetingAgendaNode.output) return false;
		if (meetingAgendaNode.status === "failed") return false;
		
		// Check if has resource_id or other content
		return !!(
			meetingAgendaNode.output.resource_id || 
			(typeof meetingAgendaNode.output === "string" && meetingAgendaNode.output.trim()) ||
			(typeof meetingAgendaNode.output === "object" && Object.keys(meetingAgendaNode.output).length > 0)
		);
	};

	// Static tab configuration
	const staticTabs = [
		{
			id: "create_next_meeting_agenda",
			label: "Agenda",
			icon: <Calendar className="h-4 w-4" />,
			hasData: isAgendaAvailable(),
		},
		{
			id: "streaming",
			label: "Live Updates",
			icon: <LogsIcon className="h-4 w-4" />,
			hasData: !!(session?.access_token && currentResult?.streaming),
		},
		{
			id: "meeting_recording",
			label: "Recording",
			icon: <Video className="h-4 w-4" />,
			hasData: !!(recordingNode || transcribeNode),
		},
		{
			id: "minutes",
			label: "Minutes",
			icon: <FileText className="h-4 w-4" />,
			hasData: !!minutesNode,
		},
		{
			id: "questions",
			label: "Chat",
			icon: <MessageSquare className="h-4 w-4" />,
			hasData: true, // Always available
		},		{
			id: "action_items",
			label: "Action Items",
			icon: <List className="h-4 w-4" />,
			hasData: !!actionItemsNode,
		},
	];

	// Set default active tab to first available tab
	const getDefaultActiveTab = (): string => {
		// Try streaming first if available
		if (session?.access_token && currentResult?.streaming) {
			return "streaming";
		}
		
		// Otherwise, find first tab with data
		const availableTabs = staticTabs.filter((tab) => tab.hasData);
		return availableTabs.length > 0 ? availableTabs[0].id : "meeting_recording";
	};

	const [activeTab, setActiveTab] = useState<string>(getDefaultActiveTab());

	// Gmail-style tab styling helper
	const getTabStyles = (tab: typeof staticTabs[0], isActive: boolean): string => {
		const baseStyles = "flex items-center gap-2 px-4 py-2 rounded-none border-b-2 transition-all duration-200 text-sm font-medium";
		
		if (isActive) {
			return `${baseStyles} text-gray-900 border-gray-900 bg-gray-50`;
		}
		
		return `${baseStyles} text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent`;
	};

	return (
		<>
			{/* Always show tabs - no conditional rendering */}
			<div className="h-full  min-h-0 overflow-hidden">
				<Tabs 
					className="flex-1 flex flex-col min-h-0 h-full" 
					onValueChange={setActiveTab} 
					value={activeTab}
				>
					<div className="border-b border-gray-200 bg-white flex-shrink-0">
						<div className="flex items-center gap-4 px-4">
							<div className="flex items-center">
								<Tooltipped tooltip="Back to meetings">
									<Button
										className="shrink-0 h-8 w-8 p-0 bg-white hover:bg-gray-50 border border-gray-200"
										onClick={handleBackToMeetings}
										size="icon"
										variant="ghost"
									>
										<ArrowLeft className="h-4 w-4" />
									</Button>
								</Tooltipped>
							</div>
							<div className="flex overflow-x-auto scrollbar-hide">
								{staticTabs
									.filter((tab) => tab.hasData)
									.map((tab) => (
										<button
											className={getTabStyles(tab, activeTab === tab.id)}
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
										>
											{tab.icon}
											<span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
											<div className="w-2 h-2 rounded-full ml-1 bg-green-500" />
										</button>
									))}
							</div>
						</div>
					</div>
					<div className="flex-1 min-h-0 overflow-hidden">
						<TabsContent 
							className="h-full m-0 p-0 overflow-hidden" 
							value="create_next_meeting_agenda"
						>
							<MeetingAgendaViewer agendaNode={meetingAgendaNode} />
						</TabsContent>
						<TabsContent 
							className="h-full m-0 p-4 overflow-hidden" 
							value="streaming"
						>
							{session?.access_token && currentResult?.streaming ? (
								<div className="h-full border rounded-lg overflow-hidden relative border-l-green-500 border-l-4">
									<div className="relative h-full flex flex-col">
										<div className="p-4 flex items-center justify-between bg-white border-b flex-shrink-0">
											<div className="flex items-center gap-2">
												<LogsIcon className="h-5 w-5 text-gray-600" />
												<h3 className="font-medium">Live Streaming Logs</h3>
											</div>
										</div>
										<div className="flex-1 min-h-0 overflow-y-auto p-4">
											<StreamComponent
												authToken={session.access_token}
												streamingKey={currentResult.id}
											/>
										</div>
										<div className="h-1 w-full bg-gray-100 overflow-hidden">
											<div
												className="h-1 w-full bg-gradient-to-r from-blue-100 to-purple-200 absolute"
												style={{
													animation: "progressLine 10s ease-in-out infinite",
												}}
											/>
										</div>
									</div>
								</div>
							) : (
								<NoDataAvailable message="Streaming is not available , currently !" />
							)}
						</TabsContent>
						<TabsContent 
							className="h-full m-0 p-4 overflow-hidden" 
							value="meeting_recording"
						>
							<MeetingRecording 
								currentResult={currentResult} 
								recordingNode={recordingNode}
							/>
						</TabsContent>
						<TabsContent 
							className="h-full m-0 p-4 overflow-auto" 
							value="minutes"
						>
							<MinutesViewer 
								distributeNode={distributeNode}
								minutesNode={minutesNode}
							/>
						</TabsContent>
						<TabsContent 
							className="h-full m-0 p-4 overflow-auto" 
							value="action_items"
						>
							{actionItemsNode ? (
								<ActionItemViewer results={actionItemsNode.output as ActionData} />
							) : (
								<NoDataAvailable message="Action items not available" />
							)}
						</TabsContent>
						<TabsContent 
							className="p-2 h-full " 
							value="questions"
						>
							<MeetingChatFromMeetingInstance 
								currentResult={currentResult}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</>
	);
};

// Helper component for no data state
const NoDataAvailable: React.FC<{ message: string }> = ({ message }) => (
	<div className="flex items-center justify-center h-full text-gray-500">
		<div className="text-center">
			<FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
			<p>{message}</p>
		</div>
	</div>
);
