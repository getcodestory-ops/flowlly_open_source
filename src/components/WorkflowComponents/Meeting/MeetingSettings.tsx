import React, { useState, useEffect } from "react";
import { Settings, FileText, Crown, UserCheck, AlertCircle, Users, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltipped } from "@/components/Common/Tooltiped";
import { MeetingInformation } from "./MeetingSettingsComponents/MeetingInformation";
import { MeetingsParticipants } from "./MeetingSettingsComponents/MeetingsParticipants";
import { DistributionFlow } from "./MeetingSettingsComponents/DistributionFlow";
import { MeetingTemplates } from "./MeetingSettingsComponents/MeetingTemplates";
import { EventScheduleList } from "../EventScheduleList";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useStore } from "@/utils/store";
import { EventAccessRole, EventSchedule } from "@/components/WorkflowComponents/types";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import type { ProjectEvents } from "@/components/WorkflowComponents/types";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import { useRouter } from "next/navigation";

interface MeetingSettingsProps {}

export const MeetingSettings: React.FC<MeetingSettingsProps> = () => {
	const { 
		eventParticipants, 
		currentGraphId, 
		setUserRoleForEvent, 
		getCurrentUserRole,
		setCurrentGraph,
		setCurrentGraphId,
		setCurrentResult,
		currentGraph,
		graphs,
		setGraphs,
		setEventSchedule,
	} = useWorkflow();
	const { session, activeProject, setAppView } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
		setAppView: state.setAppView,
	}));
	const router = useRouter();
	
	// Meeting setup state
	const [sendAgendaDays, setSendAgendaDays] = useState("3");
	const [wrapUpHours, setWrapUpHours] = useState("24");
	const [allowCommentsHours, setAllowCommentsHours] = useState("96");

	// Fetch project events for all meetings tab
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
		enabled: !!session && !!activeProject,
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

	// Detect and store current user's role when participants are loaded
	useEffect(() => {
		if (eventParticipants && session?.user?.email && currentGraphId) {
			const currentUser = eventParticipants.find((p) => 
				p.participant_metadata?.metadata?.email?.toLowerCase() === session.user.email?.toLowerCase(),
			);
			
			if (currentUser) {
				const role = currentUser.participant_metadata.role;
				setUserRoleForEvent(currentGraphId, role);
			}
		}
	}, [eventParticipants, session?.user?.email, currentGraphId, setUserRoleForEvent]);

	// Handler for back to all meetings
	const handleBackToAllMeetings = (): void => {
		setCurrentGraphId(null);
		setCurrentResult(null);
		setCurrentGraph(null);
		setEventSchedule([]);
		setAppView("meetings");
		if (activeProject) {
			router.push(`/project/${activeProject.project_id}/meetings`);
		}
	};

	// Get all instances for the current selected meeting
	const getCurrentMeetingInstances = (): EventSchedule[] => {
		if (!currentGraph || !currentGraph.event_schedule) return [];
		return currentGraph.event_schedule;
	};

	// Get role badge properties
	const getRoleBadge = (): {
		text: string;
		variant: "default" | "secondary" | "outline";
		icon: React.JSX.Element;
		className: string;
	} | null => {
		const userRole = getCurrentUserRole();
		if (!userRole) return null;

		switch (userRole) {
			case EventAccessRole.ADMIN:
				return {
					text: "Admin",
					variant: "default" as const,
					icon: <Crown className="h-3 w-3" />,
					className: "bg-blue-100 text-blue-800 border-blue-200",
				};
			case EventAccessRole.OWNER:
				return {
					text: "Owner", 
					variant: "default" as const,
					icon: <Crown className="h-3 w-3" />,
					className: "bg-amber-100 text-amber-800 border-amber-200",
				};
			case EventAccessRole.MEMBER:
				return {
					text: "Member",
					variant: "secondary" as const,
					icon: <UserCheck className="h-3 w-3" />,
					className: "bg-gray-100 text-gray-700 border-gray-200",
				};
			default:
				return {
					text: "Guest",
					variant: "outline" as const,
					icon: <UserCheck className="h-3 w-3" />,
					className: "bg-gray-50 text-gray-600 border-gray-300",
				};
		}
	};

	const roleBadge = getRoleBadge();

	return (
		<div className="container h-full overflow-auto">
			<div className="p-6 h-full max-w-7xl mx-auto">

				<Tabs className="h-full flex flex-col justify-start" defaultValue="all-meetings">
		
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-4">
							<div className="flex items-center ">
								<Tooltipped tooltip="Back to all meetings">
									<Button
										className="shrink-0 h-10 w-10 p-0 bg-white hover:bg-gray-50 border border-gray-200"
										onClick={handleBackToAllMeetings}
										size="icon"
										variant="ghost"
									>
										<ArrowLeft className="h-4 w-4" />
									</Button>
								</Tooltipped>
							</div>
							<TabsList className="grid grid-cols-3 h-11">
								<TabsTrigger className="flex items-center gap-2 text-sm font-medium" value="all-meetings">
									<Users className="h-4 w-4" />
								Meetings
								</TabsTrigger>
								<TabsTrigger className="flex items-center gap-2 text-sm font-medium" value="template">
									<FileText className="h-4 w-4" />
								Meeting Template
								</TabsTrigger>
								<TabsTrigger className="flex items-center gap-2 text-sm font-medium" value="meeting-settings">
									<Settings className="h-4 w-4" />
								Meeting Setup
								</TabsTrigger>
	
							</TabsList>
						</div>
						{roleBadge && (
							<Badge className={`flex items-center gap-1.5 px-3 py-1 ${roleBadge.className}`} variant={roleBadge.variant}>
								{roleBadge.icon}
								{roleBadge.text}
							</Badge>
						)}
					</div>
					<TabsContent className="flex-1" value="template">
						<div className="h-full">
							<MeetingTemplates />
						</div>
					</TabsContent>
					<TabsContent className="flex-1" value="meeting-settings">
						<div className="space-y-8">
							<div className="grid gap-8 lg:grid-cols-3">
								{/* Main meeting info takes up 2 columns */}
								<div className="lg:col-span-2 space-y-8">
									<MeetingInformation />
									<DistributionFlow
										allowCommentsHours={allowCommentsHours}
										sendAgendaDays={sendAgendaDays}
										setAllowCommentsHours={setAllowCommentsHours}
										setSendAgendaDays={setSendAgendaDays}
										setWrapUpHours={setWrapUpHours}
										wrapUpHours={wrapUpHours}
									/>
								</div>
								{/* Guests sidebar */}
								<div className="lg:col-span-1">
									<MeetingsParticipants />
								</div>
							</div>
						</div>
					</TabsContent>
					<TabsContent className="flex-1 " value="all-meetings">
						
						<div className="h-full">
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
							) : !currentGraph ? (
								<div className="text-center py-12 px-6">
									<div className="mb-4">
										<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
											<Users className="h-6 w-6 text-gray-400" />
										</div>
									</div>
									<h3 className="text-sm font-medium text-gray-900 mb-2">No meeting selected</h3>
									<p className="text-xs text-gray-500 mb-4">Please select a meeting first to view its instances</p>
								</div>
							) : getCurrentMeetingInstances().length === 0 ? (
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
										<h1 className="text-xl font-bold border-b border-gray-200 pb-4">Select a meeting Date to view the minutes</h1>
										<EventScheduleList
											graphs={getCurrentMeetingInstances()}
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
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default MeetingSettings; 