import React, { useEffect } from "react";
import {
	ArrowLeft,
	Settings,
	Calendar,
	Users,
	Plus,
	AlertCircle
} from "lucide-react";
import { EventScheduleList } from "../EventScheduleList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltipped } from "@/components/Common/Tooltiped";
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
					<div className="p-6 pb-4">
						<div className="flex flex-row items-center gap-3 mb-6">
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
								className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
								onClick={handleBackToAllMeetings}
								variant="ghost"
							>
							All Meetings
							</Button>
						</div>
						{/* New Meeting Button - Consistent with ChatPanel */}
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
							<Plus className="h-5 w-5" />
							<span className="font-medium">New Meeting</span>
						</Button>
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
						) : !graphs || graphs.length === 0 ? (
							<div className="text-center py-12 px-6">
								<div className="mb-4">
									<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
										<Calendar className="h-6 w-6 text-gray-400" />
									</div>
								</div>
								<h3 className="text-sm font-medium text-gray-900 mb-2">No meetings created yet</h3>
								<p className="text-xs text-gray-500 mb-4">Create your first meeting to get started</p>
							</div>
						) : (
							<div className="h-full flex-1">
								<ScrollArea className="h-full px-6">
									<div className="py-6">
										{graphs.filter((graph) => graph.event_type === "meeting").map((meeting, index, array) => {
											// Group meetings by date
											const date = new Date(meeting.created_at);
											const today = new Date();
											const yesterday = new Date(today);
											yesterday.setDate(yesterday.getDate() - 1);
										
											let dateLabel = "";
											if (index === 0 || (index > 0 && new Date(array[index - 1].created_at).toDateString() !== date.toDateString())) {
												if (date.toDateString() === today.toDateString()) {
													dateLabel = "Today";
												} else if (date.toDateString() === yesterday.toDateString()) {
													dateLabel = "Yesterday";
												} else {
													dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
												}
											}

											return (
												<div className="w-80" key={meeting.id}>
													{dateLabel && (
														<div className="text-xs font-medium text-gray-500 m-3 first:mt-0 w-32">
															{dateLabel}
														</div>
													)}
													<div
														className="group cursor-pointer p-4 rounded-lg mb-2 transition-all duration-200 hover:bg-white hover:shadow-sm"
														onClick={() => handleMeetingSelect(meeting.id)}
													>
														<div className="flex items-start gap-3">
															<div className="p-2 rounded-lg bg-gray-200">
																<Calendar className="h-4 w-4 text-gray-600" />
															</div>
															<div className="flex-1 min-w-0">
																<h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
																	{meeting.name}
																</h3>
																{meeting.description && (
																	<p className="text-xs text-gray-500 mt-1 line-clamp-2">
																		{meeting.description}
																	</p>
																)}
																<div className="flex items-center justify-between mt-2">
																	<div className="flex items-center gap-2 text-xs text-gray-500">
																		{meeting.metadata?.frequency && (
																			<span className="capitalize">
																				{meeting.metadata.frequency}
																			</span>
																		)}
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</ScrollArea>
							</div>
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