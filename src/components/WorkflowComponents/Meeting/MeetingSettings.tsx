import React, { useState, useEffect } from "react";
import { Settings, FileText, Crown, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MeetingInformation } from "./MeetingSettingsComponents/MeetingInformation";
import { MeetingsParticipants } from "./MeetingSettingsComponents/MeetingsParticipants";
import { DistributionFlow } from "./MeetingSettingsComponents/DistributionFlow";
import { MeetingTemplates } from "./MeetingSettingsComponents/MeetingTemplates";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useStore } from "@/utils/store";
import { EventAccessRole } from "@/components/WorkflowComponents/types";

interface MeetingSettingsProps {}

export const MeetingSettings: React.FC<MeetingSettingsProps> = () => {
	const { eventParticipants, currentGraphId, setUserRoleForEvent, getCurrentUserRole } = useWorkflow();
	const session = useStore((state) => state.session);
	
	// Meeting setup state
	const [sendAgendaDays, setSendAgendaDays] = useState("3");
	const [wrapUpHours, setWrapUpHours] = useState("24");
	const [allowCommentsHours, setAllowCommentsHours] = useState("96");

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

	// Get role badge properties
	const getRoleBadge = () => {
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
				<Tabs className="h-full flex flex-col" defaultValue="template">
					<div className="flex items-center justify-between mb-8">
						<TabsList className="grid grid-cols-2 h-11">
							<TabsTrigger className="flex items-center gap-2 text-sm font-medium" value="template">
								<FileText className="h-4 w-4" />
								Meeting Templates
							</TabsTrigger>
							<TabsTrigger className="flex items-center gap-2 text-sm font-medium" value="meeting-settings">
								<Settings className="h-4 w-4" />
								Meeting Setup
							</TabsTrigger>
						</TabsList>
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
				</Tabs>
			</div>
		</div>
	);
};

export default MeetingSettings; 