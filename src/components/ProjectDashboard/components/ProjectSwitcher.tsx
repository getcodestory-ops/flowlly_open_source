"use client";
import { useState, useEffect } from "react";
import {
	CaretSortIcon,
	CheckIcon,
	PlusCircledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";

import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AddNewProjectModalContent } from "@/components/Schedule/AddNewProjectModal";
import {
	usePathname,
	useSearchParams,
	useRouter,
	useParams,
} from "next/navigation";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useStore, useViewStore } from "@/utils/store";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMembers } from "@/api/membersRoutes";
import { getProjects } from "@/api/projectRoutes";
import { RiTeamLine } from "react-icons/ri";
import { MembersModal } from "@/components/MembersModal/MembersModal";
// import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";
import { useChatStore } from "@/hooks/useChatStore";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export function ProjectSwitcher({ className }: TeamSwitcherProps) : JSX.Element {
	const pathname = usePathname();
	const router = useRouter();
	const params = useParams();

	const {
		session,
		userProjects,
		activeProject,
		setActiveProject,
		setUserProjects,
		setMembers,
		setActiveChatEntity,
		setChatEntities,
		setLocalChats,
	} = useStore((state) => ({
		session: state.session,
		userProjects: state.userProjects,
		activeProject: state.activeProject,
		setActiveProject: state.setActiveProject,
		setUserProjects: state.setUserProjects,
		setMembers: state.setMembers,
		setActiveChatEntity: state.setActiveChatEntity,
		setChatEntities: state.setChatEntities,
		setLocalChats: state.setLocalChats,
	}));
	const { resetForNewChat } = useChatStore();

	const [isMembersOpen, setIsMembersOpen] = useState(false);

	const { data: membersData, isLoading: membersLoading } = useQuery({
		queryKey: ["memberList", session, activeProject],
		queryFn: async() => {
			if (!session || !activeProject) {
				return Promise.reject("No session or active project");
			}
			return getMembers(session, activeProject.project_id);
		},
		enabled: !!session?.access_token,
	});

	useEffect(() => {
		if (membersData && membersData.data.length > 0) {
			setMembers(membersData.data);
		}
	}, [membersData, setMembers]);

	const { data, isLoading, isSuccess } = useQuery({
		queryKey: ["initialProjectList", session],
		queryFn: () => {
			if (session && session.access_token) {
				return getProjects(session!, "SCHEDULE");
			}
			return Promise.reject("No session or access token");
		},
		enabled: !!session?.access_token,
		placeholderData: keepPreviousData,
	});

	const persistedProjectId = useViewStore((s) => s.activeProjectId);

	useEffect(() => {
		if (userProjects.length === 0) return;
		const projectId = params?.projectId;

		if (projectId) {
			// URL takes priority
			const project = userProjects.find(
				(project) => project.project_id === projectId,
			);
			if (project) {
				setActiveProject(project);
				return;
			}
		}

		// If no active project yet, try persisted ID, then fall back to first
		if (!activeProject) {
			const persisted = persistedProjectId
				? userProjects.find((p) => p.project_id === persistedProjectId)
				: null;
			setActiveProject(persisted ?? userProjects[0]);
		}
	}, [userProjects.length, userProjects, setActiveProject, params?.projectId, persistedProjectId, activeProject]);

	useEffect(() => {
		if (data && data.length > 0 && isSuccess) {
			setUserProjects(data);
		}
	}, [data?.length, isSuccess, setUserProjects, data]);

	// const { data: chatEntitities, isLoading: chatsLoading } = useQuery({
	// 	queryKey: ["chatEntityList", session, activeProject],
	// 	queryFn: () => {
	// 		if (!session || !activeProject) {
	// 			return Promise.reject("No session or active project");
	// 		}
	// 		return getAgentChatEntities(session, activeProject.project_id);
	// 	},
	// 	enabled: !!session?.access_token,
	// });

	// useEffect(() => {
	// 	if (chatEntitities && chatEntitities.length > 0) {
	// 		setChatEntities(chatEntitities);
	// 		setActiveChatEntity(chatEntitities[chatEntitities.length - 1]);
	// 	} else {
	// 		setActiveChatEntity(null);
	// 		setChatEntities([]);
	// 	}
	// }, [chatEntitities, setActiveChatEntity]);

	const switchProject = (project: ProjectEntity) :void => {
		// Reset all chat state when switching projects
		setActiveChatEntity(null);
		setChatEntities([]);
		setLocalChats([]);
		resetForNewChat();
		
		const projectId = params ? params?.projectId : null;

		if (projectId && pathname && pathname.includes(`/${projectId}/`)) {
			const newPath = pathname.replace(
				`/${projectId}/`,
				`/${project.project_id}/`,
			);
			router.push(newPath);
		}

		setActiveProject(project);
		setOpen(false);
	};

	const [open, setOpen] = useState(false);
	const [showNewTeamDialog, setShowNewTeamDialog] = useState(false);

	return (
		<>
			<AlertDialog onOpenChange={setShowNewTeamDialog} open={showNewTeamDialog}>
				<Popover onOpenChange={setOpen} open={open}>
					<PopoverTrigger asChild>
						<Button
							aria-expanded={open}
							aria-label="Select a team"
							className={cn("w-[200px] justify-between", className)}
							role="combobox"
							variant="outline"
						>
							<Avatar className="mr-2 h-5 w-5">
								<AvatarImage
									alt={activeProject?.name ? activeProject.name : "No Project"}
									className="grayscale"
									src="https://avatar.vercel.sh/personal.png"
								/>
								<AvatarFallback />
							</Avatar>
							{activeProject?.name.length
								? activeProject.name.slice(0, 15)
								: "No Project"}
							<CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[300px] p-0">
						<Command>
							<CommandList>
								<CommandInput placeholder="Search Project..." />
								<CommandEmpty>No Project found.</CommandEmpty>
								<CommandGroup>
									{userProjects && userProjects.length > 0 ? (
										userProjects.map((project) => (
											<CommandItem
												className="text-sm"
												key={project.project_id}
												onSelect={() => {
													switchProject(project);
												}}
											>
												<div className="flex flex-row gap-2">
													<CheckIcon
														className={cn(
															"mr-auto h-4 w-4",
															activeProject?.project_id === project.project_id
																? "opacity-100"
																: "opacity-0",
														)}
													/>
													<span className="mr-2">{project.name}</span>
												</div>
												<div
													className="ml-auto h-5 w-5 flex items-center justify-center cursor-pointer"
													onClick={() => setIsMembersOpen(true)}
												>
													<RiTeamLine
														className={
															activeProject?.project_id === project.project_id
																? "opacity-100"
																: "opacity-0"
														}
													/>
												</div>
											</CommandItem>
										))
									) : (
										<CommandItem>No projects available</CommandItem>
									)}
								</CommandGroup>
							</CommandList>
							<CommandSeparator />
							<CommandList>
								<CommandGroup>
									<AlertDialogTrigger asChild>
										<CommandItem
											onSelect={() => {
												setOpen(false);
												setShowNewTeamDialog(true);
											}}
										>
											<PlusCircledIcon className="mr-2 h-5 w-5" />
                      						Create Project
										</CommandItem>
									</AlertDialogTrigger>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				<AddNewProjectModalContent setIsOpen={setShowNewTeamDialog} />
			</AlertDialog>
			<MembersModal
				isOpen={isMembersOpen}
				onCancel={() => setIsMembersOpen(false)}
				projectAccessId={activeProject?.project_id}
			/>
		</>
	);
}
