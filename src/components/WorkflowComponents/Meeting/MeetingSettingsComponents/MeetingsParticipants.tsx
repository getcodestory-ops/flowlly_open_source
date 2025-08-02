import React, { useEffect, useState } from "react";
import { Plus, X, Users, Crown,  UserCheck,  ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Participant, EventAccessRole } from "@/components/WorkflowComponents/types";
import { useWorkflow } from "@/hooks/useWorkflow";
import { getEventParticipants, updateEventParticipants } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export const MeetingsParticipants: React.FC = () => {
	const { eventParticipants, setEventParticipants, currentGraphId, getCurrentUserRole, canEditSettings } = useWorkflow();
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const memberDirectory = useStore((state) => state.members);
	const { toast } = useToast();
	
	const [newParticipantEmail, setNewParticipantEmail] = useState("");
	const [selectedMember, setSelectedMember] = useState<string>("");
	const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);

	// Check if current user can edit a specific participant
	const canEditParticipant = (targetRole: EventAccessRole): boolean => {
		const userRole = getCurrentUserRole();
		if (!userRole) return false;
		
		// Admin can edit everyone (including other Admins)
		if (userRole === EventAccessRole.ADMIN) {
			return true;
		}
		
		// Owner can edit Members and Participants, but not Admins or other Owners
		if (userRole === EventAccessRole.OWNER) {
			return targetRole === EventAccessRole.MEMBER || targetRole === EventAccessRole.PARTICIPANT;
		}
		
		// Members and Participants cannot edit anyone
		return false;
	};

	// Check if we can change a role (considering admin protection)
	const canChangeRole = (participantId: string, currentRole: EventAccessRole, newRole: EventAccessRole): { canChange: boolean; reason?: string } => {
		// Check if user has permission to edit this participant
		if (!canEditParticipant(currentRole)) {
			return { canChange: false, reason: "You don't have permission to edit this participant" };
		}
		
		// Protect against removing the last admin
		if (currentRole === EventAccessRole.ADMIN && newRole !== EventAccessRole.ADMIN) {
			const adminCount = eventParticipants?.filter((p) => getParticipantRole(p) === EventAccessRole.ADMIN).length || 0;
			if (adminCount <= 1) {
				return { canChange: false, reason: "There must be at least one admin for this meeting" };
			}
		}
		
		return { canChange: true };
	};

	// Check if we can remove a participant
	const canRemoveParticipant = (participantId: string, role: EventAccessRole): { canRemove: boolean; reason?: string } => {
		// Check if user has permission to edit this participant
		if (!canEditParticipant(role)) {
			return { canRemove: false, reason: "You don't have permission to remove this participant" };
		}
		
		// Protect against removing the last admin
		if (role === EventAccessRole.ADMIN) {
			const adminCount = eventParticipants?.filter((p) => getParticipantRole(p) === EventAccessRole.ADMIN).length || 0;
			if (adminCount <= 1) {
				return { canRemove: false, reason: "Cannot remove the last admin from this meeting" };
			}
		}
		
		return { canRemove: true };
	};

	const { data, isLoading, isError } = useQuery({
		queryKey: ["eventParticipants", activeProject?.project_id, currentGraphId],
		queryFn: async() => {
			if (!session || !activeProject || !currentGraphId) return [];
			const result = await getEventParticipants({
				session: session,
				projectId: activeProject.project_id,
				eventId: currentGraphId,
			});
			return result;
		},
		enabled: !!session && !!activeProject && !!currentGraphId,
	});

	useEffect(() => {
		if (data) {
			setEventParticipants(data);
		}
	}, [data, setEventParticipants]);

	// Helper functions
	const getParticipantRole = (participant: Participant): EventAccessRole => {
		return participant.participant_metadata.role;
	};

	const getParticipantInfo = (participant: Participant) => {
		// Only email is present now
		return {
			email: participant.participant_metadata.metadata.email,
		};
	};

	// Update participants with API persistence (no metadata enhancement needed)
	const updateParticipants = async(updatedParticipants: Participant[]) => {
		if (!session || !activeProject || !currentGraphId) {
			return;
		}
		try {
			setEventParticipants(updatedParticipants);
			await updateEventParticipants({
				session,
				projectId: activeProject.project_id,
				eventId: currentGraphId,
				participants: updatedParticipants,
			});
			toast({
				title: "Participants updated",
				description: "Your team members have been updated.",
			});
		} catch (error) {
			setEventParticipants(eventParticipants);
			toast({
				title: "Update failed",
				description: "Failed to update team members. Please try again.",
				variant: "destructive",
			});
			throw error;
		}
	};

	// Add a new participant (email only)
	const addNewParticipant = async(newParticipant: Participant) => {
		const currentParticipants = eventParticipants || [];
		const updatedParticipants = [...currentParticipants, newParticipant];
		await updateParticipants(updatedParticipants);
	};

	// Update a specific participant's role
	const updateParticipantRoleEnhanced = async(participantId: string, newRole: EventAccessRole) => {
		if (!eventParticipants) return;
		
		const participant = eventParticipants.find((p) => p.id === participantId);
		if (!participant) return;
		
		const currentRole = getParticipantRole(participant);
		const { canChange, reason } = canChangeRole(participantId, currentRole, newRole);
		
		if (!canChange) {
			toast({
				title: "Cannot change role",
				description: reason,
				variant: "destructive",
			});
			return;
		}
		
		const updatedParticipants = eventParticipants.map((participant) => {
			if (participant.id === participantId) {
				return {
					...participant,
					participant_metadata: {
						...participant.participant_metadata,
						role: newRole,
					},
				};
			}
			return participant;
		});
		await updateParticipants(updatedParticipants);
	};

	// Remove a participant
	const removeParticipantEnhanced = async(participantId: string) => {
		if (!eventParticipants) return;
		
		const participant = eventParticipants.find((p) => p.id === participantId);
		if (!participant) return;
		
		const role = getParticipantRole(participant);
		const { canRemove, reason } = canRemoveParticipant(participantId, role);
		
		if (!canRemove) {
			toast({
				title: "Cannot remove participant",
				description: reason,
				variant: "destructive",
			});
			return;
		}
		
		const updatedParticipants = eventParticipants.filter((p) => p.id !== participantId);
		await updateParticipants(updatedParticipants);
	};
 
	const toggleParticipationRole = (participantId: string, canParticipate: boolean) => {
		const newRole = canParticipate ? EventAccessRole.MEMBER : EventAccessRole.GUEST;
		updateParticipantRoleEnhanced(participantId, newRole);
	};

	const toggleOwnerStatus = (participantId: string) => {
		const participant = eventParticipants?.find((p) => p.id === participantId);
		if (!participant) return;
		
		const currentRole = getParticipantRole(participant);
		const newRole = currentRole === EventAccessRole.ADMIN ? EventAccessRole.MEMBER : EventAccessRole.ADMIN;
		updateParticipantRoleEnhanced(participantId, newRole);
	};

	const removeParticipant = (participantId: string) => {
		removeParticipantEnhanced(participantId);
	};

	// Add participant by email (only if user can edit settings)
	const addParticipantByEmail = async() => {
		if (!canEditSettings()) {
			toast({
				title: "Permission denied",
				description: "You don't have permission to add participants",
				variant: "destructive",
			});
			return;
		}
		
		if (!newParticipantEmail.trim() || !currentGraphId) return;
		// Check if participant already exists
		const exists = eventParticipants?.some((p) => {
			return p.participant_metadata?.metadata?.email?.toLowerCase() === newParticipantEmail.toLowerCase();
		});
		if (exists) {
			toast({
				title: "Duplicate email",
				description: "This email is already added as a participant",
				variant: "destructive",
			});
			return;
		}
		const newParticipant: Participant = {
			id: crypto.randomUUID(),
			event_id: currentGraphId,
			participant_metadata: {
				role: EventAccessRole.MEMBER,
				identification: "email" as const,
				metadata: {
					email: newParticipantEmail,
				},
			},
		};
		await addNewParticipant(newParticipant);
		setNewParticipantEmail("");
	};

	const addParticipantFromDirectory = () => {
		if (!canEditSettings()) {
			toast({
				title: "Permission denied",
				description: "You don't have permission to add participants",
				variant: "destructive",
			});
			return;
		}
		
		if (!selectedMember || !currentGraphId || !memberDirectory) return;
		
		const member = memberDirectory.find((m) => m.id === selectedMember);
		if (!member) return;

		// Check if participant already exists
		const exists = eventParticipants?.some((p) => {
			return p.participant_metadata?.metadata?.email?.toLowerCase() === member.email.toLowerCase();
		});
		
		if (exists) {
			toast({
				title: "Duplicate member",
				description: "This member is already added as a participant",
				variant: "destructive",
			});
			return;
		}

		// Always create a new participant for each person
		const newParticipant: Participant = {
			id: crypto.randomUUID(),
			event_id: currentGraphId,
			participant_metadata: {
				role: EventAccessRole.MEMBER,
				identification: "email" as const,
				metadata: {
					email: member.email,
				},
			},
		};

		addNewParticipant(newParticipant);
		setSelectedMember("");
	};

	const getRoleText = (role: EventAccessRole) => {
		switch (role) {
			case EventAccessRole.OWNER:
				return "Owner";
			case EventAccessRole.ADMIN:
				return "Admin";
			case EventAccessRole.MEMBER:
				return "Member";
			default:
				return "Member";
		}
	};

	const getRoleIcon = (role: EventAccessRole) => {
		switch (role) {
			case EventAccessRole.OWNER:
				return <Crown className="h-4 w-4 text-amber-600" />;
			case EventAccessRole.ADMIN:
				return <UserCheck className="h-4 w-4 text-blue-600" />;
			case EventAccessRole.MEMBER:
				return <UserCheck className="h-4 w-4 text-green-600" />;
			default:
				return <UserCheck className="h-4 w-4 text-gray-600" />;
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-1">Participants</h3>
					<p className="text-sm text-gray-600">Add people to your meeting by email</p>
				</div>
				<div className="flex items-center justify-center py-8">
					<div className="text-sm text-gray-500">Loading participants...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900 mb-1">Participants</h3>
				<p className="text-sm text-gray-600">Add people to your meeting by email</p>
			</div>
			{canEditSettings() && (
				<div className="space-y-3">
					<div className="flex gap-2">
						<Input
							className="border-none bg-gray-50 hover:bg-gray-100 focus:bg-white h-9"
							onChange={(e) => setNewParticipantEmail(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && addParticipantByEmail()}
							placeholder="Add participant by email"
							value={newParticipantEmail}
						/>
						<Button 
							className="h-9 px-3 hover:bg-gray-100" 
							onClick={addParticipantByEmail}
							size="sm"
							variant="ghost"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					{memberDirectory && memberDirectory.length > 0 && (
						<div className="flex gap-2">
							<Select onValueChange={setSelectedMember} value={selectedMember}>
								<SelectTrigger className="border-none bg-gray-50 hover:bg-gray-100 h-9">
									<SelectValue placeholder="Add from project members" />
								</SelectTrigger>
								<SelectContent>
									{memberDirectory
										.filter((member) => {
											// Filter out members already added as participants
											return !eventParticipants?.some((p) => {
												return p.participant_metadata?.metadata?.email?.toLowerCase() === member.email.toLowerCase();
											});
										})
										.map((member) => (
											<SelectItem key={member.id} value={member.id}>
												<div className="flex items-center gap-2">
													<span>{member.first_name} {member.last_name}</span>
													<span className="text-xs text-gray-500">({member.email})</span>
												</div>
											</SelectItem>
										))}
								</SelectContent>
							</Select>
							<Button 
								className="h-9 px-3 hover:bg-gray-100" 
								disabled={!selectedMember}
								onClick={addParticipantFromDirectory}
								size="sm"
								variant="ghost"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			)}
			{eventParticipants && eventParticipants.length > 0 && (
				<div className="space-y-1">
					{eventParticipants.map((participant) => {
						const role = getParticipantRole(participant);
						const info = getParticipantInfo(participant);
						const isHovered = hoveredParticipant === participant.id;
						const canEdit = canEditParticipant(role);
						const canRemove = canRemoveParticipant(participant.id, role).canRemove;
						
						return (
							<div 
								className="group flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors"
								key={participant.id}
								onMouseEnter={() => setHoveredParticipant(participant.id)}
								onMouseLeave={() => setHoveredParticipant(null)}
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
										<span className="text-sm font-medium text-gray-600">
											{info.email?.charAt(0).toUpperCase()}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium text-gray-900 truncate">
												{info.email}
											</p>
											{role === EventAccessRole.OWNER && (
												<Crown className="h-3 w-3 text-amber-500 flex-shrink-0" />
											)}
											{role === EventAccessRole.ADMIN && (
												<Crown className="h-3 w-3 text-blue-500 flex-shrink-0" />
											)}
										</div>
										<div className="flex items-center gap-2 text-xs text-gray-500">
											<span className="truncate">{getRoleText(role)}</span>
										</div>
									</div>
								</div>
								{canEdit && (
									<div className={`flex items-center gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
										<Select 
											onValueChange={(newRole) => {
												updateParticipantRoleEnhanced(participant.id, newRole as EventAccessRole);
											}}
											value={role}
										>
											<SelectTrigger className="h-7 w-7 border-none p-0">
												<ChevronDown className="h-3 w-3" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={EventAccessRole.OWNER}>Owner</SelectItem>
												<SelectItem value={EventAccessRole.ADMIN}>Admin</SelectItem>
												<SelectItem value={EventAccessRole.MEMBER}>Member</SelectItem>
											</SelectContent>
										</Select>
										{canRemove && (
											<Button
												className="h-7 w-7 p-0"
												onClick={() => {
													removeParticipant(participant.id);
												}}
												size="sm"
												variant="ghost"
											>
												<X className="h-3 w-3" />
											</Button>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
			{(!eventParticipants || eventParticipants.length === 0) && !isLoading && (
				<div className="text-center py-8">
					<Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
					<p className="text-sm text-gray-500 mb-2">No participants added yet</p>
					<p className="text-xs text-gray-400">Add people using their email</p>
				</div>
			)}
			{!canEditSettings() && (
				<div className="text-center py-4">
					<p className="text-xs text-gray-400">You don&apos;t have permission to manage participants</p>
				</div>
			)}
		</div>
	);
}; 