import React, { useEffect } from "react";
import {
	ArrowLeft,
	Settings,
	Users,
	AlertCircle
} from "lucide-react";
import { EventScheduleList } from "../EventScheduleList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltipped } from "@/components/Common/Tooltiped";
import { MeetingsList } from "../Meeting/MeetingsList";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useStore } from "@/utils/store";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import type { ProjectEvents } from "../types";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";

interface WorkflowPanelProps {
	isVisible: boolean;
	onNavigateBack?: () => void;
}

export default function WorkflowPanel({
	isVisible,
	onNavigateBack,
}: WorkflowPanelProps): React.ReactNode {
	const completedWorkflows = useWorkflow((state) => state.completedWorkflows());
	const {
		eventSchedule,
		setCurrentGraphId,
		setCurrentResult,
		currentGraphId,
		graphs,
		currentGraph,
		setCurrentGraph,
		setGraphs,
		setEventSchedule,
	} = useWorkflow();
	
	const { setAppView, activeProject, session } = useStore((state) => ({
		setAppView: state.setAppView,
		activeProject: state.activeProject,
		session: state.session,
	}));
	
	const router = useRouter();

	// Fetch project events when the panel is visible
	const { data: projectEventsData, isLoading: isLoadingEvents, isError } = useQuery({
		queryKey: ["projectEvents"],
		queryFn: async() => {
			if (!session || !activeProject) return [];
			const result = await getProjectEvents({
				session: session,
				projectId: activeProject.project_id,
			});
			return result;
		},
		enabled: !!session && !!activeProject && isVisible,
	});

	// Update graphs when data is loaded
	useEffect(() => {
		if (projectEventsData) {
			setGraphs(projectEventsData.map((d: ProjectEvents) => d.project_events));
		}
	}, [projectEventsData, setGraphs]);

	// Update current graph and event schedule when graphs change
	useEffect(() => {
		if (graphs && currentGraphId) {
			const graph = graphs?.find((g) => g.id === currentGraphId);
			setCurrentGraph(graph || null);

			// Check if there's any event_schedule data
			if (graph?.event_schedule && graph.event_schedule.length > 0) {
				setEventSchedule(graph.event_schedule);
			} else {
				setEventSchedule([]);
			}
		}
	}, [graphs, currentGraphId, setCurrentGraph, setEventSchedule]);

	const handleBackToAllMeetings = (): void => {
		setCurrentGraphId(null);
		setCurrentResult(null);
		setCurrentGraph(null);
		onNavigateBack?.();
	};

	const handleMeetingSelect = (meetingId: string): void => {
		const selectedMeeting = graphs?.find((g) => g.id === meetingId);
		if (selectedMeeting) {
			setCurrentGraphId(meetingId);
			setCurrentGraph(selectedMeeting);
		}
	};



	if (!isVisible) return null;

	// No meeting selected - show meeting list
	if (!currentGraphId) {
		return (
			<div className={`absolute top-0 h-full bg-gray-50 shadow-lg z-50 flex flex-col transition-all ${isVisible ? "left-0 w-96 duration-600" : "-left-96 w-0 duration-1000"}`}>
				<div className="h-full flex flex-col">
					{/* Header */}
					<div className="p-6 ">
						<div className="flex flex-row items-center gap-3">
							<Tooltipped tooltip="Back to meetings page">
								<Button
									className="shrink-0 h-10 w-10 p-0 bg-white hover:bg-gray-50 border border-gray-200"
									onClick={handleBackToAllMeetings}
									size="icon"
									variant="ghost"
								>
									<ArrowLeft className="h-4 w-4" />
								</Button>
							</Tooltipped>
							<Button
								className="px-4 py-2 text-xs font-medium rounded-lg"
								onClick={handleBackToAllMeetings}
								
							>
							All Meetings
							</Button>
						</div>
					</div>
					<div className="flex-1 overflow-hidden">
						{isLoadingEvents ? (
							<div className="flex items-center justify-center h-full">
								<LoaderAnimation />
							</div>
						) : isError ? (
							<div className="text-center py-12 px-6">
								<div className="mb-4">
									<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
										<AlertCircle className="h-6 w-6 text-red-500" />
									</div>
								</div>
								<h3 className="text-sm font-medium text-gray-900 mb-2">Failed to load meetings</h3>
								<p className="text-xs text-gray-500 mb-4">Please try again later</p>
							</div>
						) : (
							<MeetingsList
								meetings={graphs}
								onMeetingSelect={handleMeetingSelect}
							/>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Meeting selected - show meeting instances
	return (
		<div className={`absolute top-0 h-full bg-gray-50 shadow-lg z-50 flex flex-col transition-all ${isVisible ? "left-0 w-96 duration-600" : "-left-96 w-0 duration-1000"}`}>
			<div className="h-full flex flex-col">
				{/* Header */}
				<div className="p-6 pb-4">
					<div className="flex flex-row items-center gap-3 mb-6">
						<Tooltipped tooltip="Back to meeting list">
							<Button
								className="shrink-0 h-10 w-10 p-0 bg-white hover:bg-gray-50 border border-gray-200"
								onClick={() => {
									setCurrentGraphId(null);
									setCurrentGraph(null);
									setCurrentResult(null);
								}}
								size="icon"
								variant="ghost"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Tooltipped>
						<div className="flex-1 min-w-0">
							<h3 className="text-sm font-medium text-gray-900 truncate">
								{currentGraph?.name || "Meeting"}
							</h3>
							<p className="text-xs text-gray-500">Meeting instances</p>
						</div>
					</div>
					{/* Meeting Setup Button - Consistent with header style */}
					<Button
						className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg flex items-center justify-center gap-3 mb-6 shadow-sm"
						onClick={() => {
							setCurrentResult(null);
							setAppView("meetings");
							if (activeProject) {
								router.push(`/project/${activeProject.project_id}/meetings`);
							}
						}}
						variant="outline"
					>
						<Settings className="h-5 w-5" />
						<span className="font-medium">Meeting Setup</span>
					</Button>
				</div>
				<div className="flex-1 overflow-hidden">
					{isLoadingEvents ? (
						<div className="flex items-center justify-center h-full">
							<LoaderAnimation />
						</div>
					) : !eventSchedule || !completedWorkflows || completedWorkflows.length === 0 ? (
						<div className="text-center py-12 px-6">
							<div className="mb-4">
								<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
									<Users className="h-6 w-6 text-gray-400" />
								</div>
							</div>
							<h3 className="text-sm font-medium text-gray-900 mb-2">No meeting instances yet</h3>
							<p className="text-xs text-gray-500 mb-4">Meeting instances will appear here once they&apos;re created</p>
						</div>
					) : (
						<div className="h-full flex-1">
							<ScrollArea className="h-full px-6 py-4">
								<EventScheduleList
									graphs={completedWorkflows}
									onWorkflowSelect={() => {
										setAppView("meetings");
										if (activeProject) {
											router.push(`/project/${activeProject.project_id}/meetings`);
										}
									}}
								/>
							</ScrollArea>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}