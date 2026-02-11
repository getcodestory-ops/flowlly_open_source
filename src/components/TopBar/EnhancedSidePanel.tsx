"use client";

import React, { useEffect, useState, useRef } from "react";
import { Archivo_Black } from "next/font/google";
import { UserNav } from "@/components/ProjectDashboard/components/UserNav";
import { useStore, useViewStore } from "@/utils/store";
import Link from "next/link";
import {
	Calendar,
	MessageSquareCode,
	ClipboardList,
	Folder,
	ChevronRight,
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjects } from "@/api/projectRoutes";
import { getMembers } from "@/api/membersRoutes";
import { AppView } from "@/types/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CustomProjectSwitcher } from "./CustomProjectSwitcher";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ProjectEntity } from "@/types/projects";
import { cn } from "@/lib/utils";
import { Tooltipped } from "../Common/Tooltiped";
import ChatPanel from "@/components/ChatInput/PlatformChat/ChatPanel";
import WorkflowPanel from "@/components/WorkflowComponents/WorkflowPanel";
import { useChatStore } from "@/hooks/useChatStore";
const archivoBlack = Archivo_Black({
	weight: "400",
	subsets: ["latin"],
});

export function EnhancedSidePanel(): React.ReactNode {
	const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
	const [showChatPanel, setShowChatPanel] = useState(false);
	const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
	const params = useParams();
	const router = useRouter();
	const hideChatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hideWorkflowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const {
		session,
		userProjects,
		activeProject,
		setActiveProject,
		setUserProjects,
		setMembers,
		setAppView,
		setActiveChatEntity,
		setLocalChats,
	} = useStore((state) => ({
		session: state.session,
		userProjects: state.userProjects,
		activeProject: state.activeProject,
		setActiveProject: state.setActiveProject,
		setUserProjects: state.setUserProjects,
		setMembers: state.setMembers,
		setAppView: state.setAppView,
		setActiveChatEntity: state.setActiveChatEntity,
		setLocalChats: state.setLocalChats,
	}));

	const { setSelectedContexts, setIsWaitingForResponse, setChatDirectiveType } = useChatStore();

	// Track the active project to detect changes
	const previousProjectIdRef = useRef(activeProject?.project_id);

	useEffect(() => {
		// If the active project changed while the switcher is open, close it
		if (previousProjectIdRef.current !== activeProject?.project_id) {
			setShowProjectSwitcher(false);
		}

		// Update the ref with current project id
		previousProjectIdRef.current = activeProject?.project_id;
	}, [activeProject?.project_id]);

	const projectSwitcherRef = useRef<HTMLDivElement>(null);
	const projectButtonRef = useRef<HTMLButtonElement>(null);
	const chatPanelRef = useRef<HTMLDivElement>(null);
	const chatButtonRef = useRef<HTMLDivElement>(null);
	const workflowPanelRef = useRef<HTMLDivElement>(null);
	const workflowButtonRef = useRef<HTMLDivElement>(null);

	// Chat panel hover handlers with delay
	const handleChatHoverEnter = (): void => {
		// Clear any pending hide timeout
		if (hideChatTimeoutRef.current) {
			clearTimeout(hideChatTimeoutRef.current);
			hideChatTimeoutRef.current = null;
		}
		setShowChatPanel(true);
	};

	const handleChatHoverLeave = (): void => {
		// Set a delay before hiding the panel
		hideChatTimeoutRef.current = setTimeout(() => {
			setShowChatPanel(false);
		}, 500); 
	};

	const handleChatPanelMouseEnter = (): void => {
		// Clear any pending hide timeout when entering the panel
		if (hideChatTimeoutRef.current) {
			clearTimeout(hideChatTimeoutRef.current);
			hideChatTimeoutRef.current = null;
		}
	};

	const handleChatPanelMouseLeave = (): void => {
		// Add a small delay before hiding the panel when leaving the panel area
		hideChatTimeoutRef.current = setTimeout(() => {
			setShowChatPanel(false);
		}, 300); 
	};

	// Workflow panel hover handlers with delay
	const handleWorkflowHoverEnter = (): void => {
		// Clear any pending hide timeout
		if (hideWorkflowTimeoutRef.current) {
			clearTimeout(hideWorkflowTimeoutRef.current);
			hideWorkflowTimeoutRef.current = null;
		}
		setShowWorkflowPanel(true);
	};

	const handleWorkflowHoverLeave = (): void => {
		// Set a delay before hiding the panel
		hideWorkflowTimeoutRef.current = setTimeout(() => {
			setShowWorkflowPanel(false);
		}, 500); 
	};

	const handleWorkflowPanelMouseEnter = (): void => {
		// Clear any pending hide timeout when entering the panel
		if (hideWorkflowTimeoutRef.current) {
			clearTimeout(hideWorkflowTimeoutRef.current);
			hideWorkflowTimeoutRef.current = null;
		}
	};

	const handleWorkflowPanelMouseLeave = (): void => {
		// Add a small delay before hiding the panel when leaving the panel area
		hideWorkflowTimeoutRef.current = setTimeout(() => {
			setShowWorkflowPanel(false);
		}, 300); 
	};

	// Fetch project list
	const { data, isSuccess } = useQuery({
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

	// Set projects when data is loaded
	useEffect(() => {
		if (data && data.length > 0 && isSuccess) {
			setUserProjects(data);
		}
	}, [data?.length, isSuccess, setUserProjects, data]);

	// Set active project based on URL, persisted ID, or fall back to first project
	useEffect(() => {
		if (userProjects.length === 0) return;
		const projectId = params?.projectId;
		// Read latest values directly from stores to avoid stale closures
		// and to keep them OUT of the dependency array.
		// Having activeProject or persistedProjectId as deps causes a feedback loop:
		// switchProject sets both synchronously → this effect re-fires while
		// params still has the OLD projectId → reverts the switch.
		const currentActiveProject = useStore.getState().activeProject;

		if (projectId) {
			// URL takes priority, but only sync if active project doesn't already match
			if (currentActiveProject?.project_id !== projectId) {
				const project = userProjects.find(
					(project) => project.project_id === projectId,
				);
				if (project) {
					setActiveProject(project);
				}
			}
			return;
		}

		// If no active project yet, try persisted ID, then fall back to first
		if (!currentActiveProject) {
			const savedProjectId = useViewStore.getState().activeProjectId;
			const persisted = savedProjectId
				? userProjects.find((p) => p.project_id === savedProjectId)
				: null;
			setActiveProject(persisted ?? userProjects[0]);
		}
	}, [userProjects.length, userProjects, setActiveProject, params?.projectId]);

	// Fetch members for active project
	const { data: membersData } = useQuery({
		queryKey: ["memberList", session, activeProject],
		queryFn: async() => {
			if (!session || !activeProject) {
				return Promise.reject("No session or active project");
			}
			return getMembers(session, activeProject.project_id);
		},
		enabled: !!session?.access_token && !!activeProject?.project_id,
	});

	// Set members when data is loaded
	useEffect(() => {
		if (membersData && membersData.data.length > 0) {
			setMembers(membersData.data);
		}
	}, [membersData, setMembers]);

	
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent): void => {
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				// Create new chat: reset chat state
				setActiveChatEntity(null);
				setLocalChats([]);
				setSelectedContexts("untitled", []);
				setIsWaitingForResponse(false);
				setChatDirectiveType("chat");
				
				// Set app view and navigate to agent page
				setAppView("agent");
				if (activeProject) {
					router.push(`/project/${activeProject.project_id}/agent`);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeProject, router, setActiveChatEntity, setLocalChats, setSelectedContexts, setIsWaitingForResponse, setChatDirectiveType, setAppView]);

	// Handle click outside to close project switcher and chat panel
	useEffect(() => {
		function handleClickOutside(event: MouseEvent): void {
			if (
				projectSwitcherRef.current &&
				!projectSwitcherRef.current.contains(event.target as Node) &&
				projectButtonRef.current &&
				!projectButtonRef.current.contains(event.target as Node)
			) {
				setShowProjectSwitcher(false);
			}

			if (
				chatPanelRef.current &&
				!chatPanelRef.current.contains(event.target as Node) &&
				chatButtonRef.current &&
				!chatButtonRef.current.contains(event.target as Node)
			) {
				// Clear any pending timeout when clicking outside
				if (hideChatTimeoutRef.current) {
					clearTimeout(hideChatTimeoutRef.current);
					hideChatTimeoutRef.current = null;
				}
				setShowChatPanel(false);
			}

			if (
				workflowPanelRef.current &&
				!workflowPanelRef.current.contains(event.target as Node) &&
				workflowButtonRef.current &&
				!workflowButtonRef.current.contains(event.target as Node)
			) {
				// Clear any pending timeout when clicking outside
				if (hideWorkflowTimeoutRef.current) {
					clearTimeout(hideWorkflowTimeoutRef.current);
					hideWorkflowTimeoutRef.current = null;
				}
				setShowWorkflowPanel(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			// Clean up timeouts on unmount
			if (hideChatTimeoutRef.current) {
				clearTimeout(hideChatTimeoutRef.current);
			}
			if (hideWorkflowTimeoutRef.current) {
				clearTimeout(hideWorkflowTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className="flex flex-col h-full bg-white w-[55px] border-r border-gray-200 relative">
			{/* Logo and Project trigger at the top */}
			<div className="flex flex-col items-center py-4 ">
				<Link className="hover:opacity-80 transition-opacity" href="/project">
					<div
						className={`${archivoBlack.className} text-3xl text-gray-800 mb-2`}
					>
						<span>F</span>
					</div>
				</Link>
				<Tooltipped tooltip={activeProject?.name || ""}>
					<button
						className={`w-[55px] flex flex-col items-center justify-center gap-1 py-2  transition-all ${
							showProjectSwitcher
								? "bg-gray-100 text-gray-800 border border-gray-200 "
								: "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
						}`}
						onClick={() => setShowProjectSwitcher(!showProjectSwitcher)}
						ref={projectButtonRef}
					>

						{activeProject && (
							<ProjectRoundIcon
								activeProject={activeProject}
								showProjectSwitcher={showProjectSwitcher}
							/>
						)}
						<div className="text-[10px] font-medium">
							{activeProject?.name
								? activeProject.name.length > 8
									? `${activeProject.name.substring(0, 8)}...`
									: activeProject.name
								: "Project"}
						</div>
						<div className="flex items-center text-[8px] font-semibold px-2 py-0.5 rounded-full">
							<span>SWITCH</span>
							<svg
								fill="none"
								height="10"
								viewBox="0 0 15 15"
								width="10"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									clipRule="evenodd"
									d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
									fill="currentColor"
									fillRule="evenodd"
								/>
							</svg>
						</div>
					</button>
				</Tooltipped>
			</div>
			{/* Project Switcher Popover */}
			{showProjectSwitcher && (
				<div className="absolute left-16 top-8 "
					ref={projectSwitcherRef}
					style={{ zIndex: 1000 }}
				>
					<div className="bg-white rounded-md shadow-lg border border-gray-200 w-[300px]">
						{activeProject && (
							<div className="font-medium text-sm border-b border-gray-100 w-full px-2 w-full py-2 bg-indigo-50 font-bold flex flex-row gap-1 justify-between items-center">
								<div className="flex flex-row gap-1 justify-between items-center h-full">
									<ProjectRoundIcon
										activeProject={activeProject}
										activeSize="h-2 w-2 mt-1"
										avatarSize="h-4 w-4 mt-1"
										showProjectSwitcher={showProjectSwitcher}
									/>
									<Tooltipped tooltip={activeProject.name}>
										<span className="text-indigo-600 ml-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{activeProject.name}</span>
									</Tooltipped>
								</div>
								<Link className="text-gray-600 text-xs" href={`/project/${activeProject.project_id}/members`}>
									<Button 
										onClick={() => setShowProjectSwitcher(false)}
										size="sm"
										variant="outline"
									>
										View team
									</Button>
								</Link>
							</div>
						)}
						<CustomProjectSwitcher
							className="w-full"
							onProjectSwitch={() => setShowProjectSwitcher(false)}
						/>
						<Link href={`/project/${activeProject?.project_id}/projects`}>
							<Button
								className="w-full rounded-none"
								onClick={() => setShowProjectSwitcher(false)}
								size="default"
								variant="default"
							>
								View all projects
							</Button>
						</Link>
					</div>
				</div>
			)}
			{/* Chat Panel Popover */}
			{showChatPanel && activeProject && (
				<div 
					className="absolute left-[54px] top-0 h-full"
					onMouseEnter={handleChatPanelMouseEnter}
					onMouseLeave={handleChatPanelMouseLeave}
					ref={chatPanelRef}
					style={{ zIndex: 1000 }}
				>
					<ChatPanel
						chatTarget="agent"
						folderId={activeProject.project_id}
						isVisible={showChatPanel}
						onCreateNewChat={() => {
							// Navigate to agent page when creating new chat
							router.push(`/project/${activeProject.project_id}/agent`);
							setShowChatPanel(false);
						}}
					/>
				</div>
			)}
	
			{/* Navigation buttons */}
			<div className="flex-1 overflow-y-auto">
				<nav className="flex flex-col items-center py-4">
					<AllMenuButtons 
						chatButtonRef={chatButtonRef}
						onChatHoverEnter={handleChatHoverEnter}
						onChatHoverLeave={handleChatHoverLeave}
						onWorkflowHoverEnter={handleWorkflowHoverEnter}
						onWorkflowHoverLeave={handleWorkflowHoverLeave}
						workflowButtonRef={workflowButtonRef}
					/>
				</nav>
			</div>
			{/* User controls at bottom */}
			<div className="flex flex-col items-center gap-2 py-4 border-t border-gray-200">
				{/* <HeaderNotification /> */}
				<UserNav email="" />
			</div>
			{/* <SetUseStoreData /> */}
		</div>
	);
}

const ProjectRoundIcon = ({
	activeProject,
	showProjectSwitcher,
	avatarSize = "h-6 w-6",
	activeSize = "h-3 w-3",
}: {
	activeProject: ProjectEntity;
	showProjectSwitcher: boolean;
	avatarSize?: string;
	activeSize?: string;
}): React.ReactNode => {
	return (
		<div className="relative">
			<Avatar className={cn(avatarSize, "mb-1 ring-2 ring-offset-1 ring-offset-indigo-500 ring-white/30")}>
				<AvatarImage
					alt={activeProject?.name ? activeProject.name : "P"}
					className={showProjectSwitcher ? "" : "grayscale"}
					src={`https://avatar.vercel.sh/${
						activeProject?.name || "project"
					}.png`}
				/>
				<AvatarFallback>P</AvatarFallback>
			</Avatar>
			{activeProject && (
				<span className={cn(activeSize, "absolute -top-1 -right-1 rounded-full bg-green-500 border border-white")} />
			)}
		</div>
	);
};

const menuItems: {
  label: string;
  fnKey: AppView;
  icon: React.ReactNode;
  link: string;
}[] = [

	{
		label: "Meetings",
		fnKey: "meetings",
		icon: <ClipboardList className="h-5 w-5" />,
		link: "meetings",
	},
	{
		label: "Tasks",
		fnKey: "schedule",
		icon: <Calendar className="h-5 w-5" />,
		link: "schedule",
	},
	{
		label: "Drive",
		fnKey: "updates",
		icon: <Folder className="h-5 w-5" />,
		link: "documents",
	},
	{
		label: "AI Chat",
		fnKey: "agent",
		icon: <MessageSquareCode className="h-5 w-5" />,
		link: "agent",
	},

];

const AllMenuButtons = ({
	chatButtonRef,
	onChatHoverEnter,
	onChatHoverLeave,
	workflowButtonRef,
	onWorkflowHoverEnter,
	onWorkflowHoverLeave,
}: {
	chatButtonRef: React.RefObject<HTMLDivElement | null>;
	onChatHoverEnter: () => void;
	onChatHoverLeave: () => void;
	workflowButtonRef: React.RefObject<HTMLDivElement | null>;
	onWorkflowHoverEnter: () => void;
	onWorkflowHoverLeave: () => void;
}): React.ReactNode => {
	const params = useParams();
	const projectId = params ? params.projectId : null;

	const { setAppView, appView } = useStore((state) => ({
		setAppView: state.setAppView,
		appView: state.appView,
	}));

	return (
		<>
			{menuItems.map((item) => (
				<MenuButton
					hasExtendedPanel={item.fnKey === "agent" }
					icon={item.icon}
					isSelected={appView === item.fnKey}
					key={item.label}
					label={item.label}
					link={projectId ? `/project/${projectId}/${item.link}` : "/project"}
					onClick={() => setAppView(item.fnKey)}
					onMouseEnter={
						item.fnKey === "agent" 
							? onChatHoverEnter 
							: item.fnKey === "meetings" 
								? onWorkflowHoverEnter 
								: undefined
					}
					onMouseLeave={
						item.fnKey === "agent" 
							? onChatHoverLeave 
							: item.fnKey === "meetings" 
								? onWorkflowHoverLeave 
								: undefined
					}
					ref={
						item.fnKey === "agent" 
							? chatButtonRef 
							: item.fnKey === "meetings" 
								? workflowButtonRef 
								: undefined
					}
				/>
			))}
		</>
	);
};

const MenuButton = React.forwardRef<
	HTMLDivElement,
	{
		icon: React.ReactNode;
		isSelected: boolean;
		label: string;
		link: string;
		onClick: () => void;
		onMouseEnter?: () => void;
		onMouseLeave?: () => void;
		hasExtendedPanel?: boolean;
			}
			>(({ icon, isSelected, label, link, onClick, onMouseEnter, onMouseLeave, hasExtendedPanel }, ref) => {
				return (
					<div
						className={`relative flex flex-col text-center justify-center items-center py-2 w-full border-r-4 border-gray-200 gap-0 ${
							isSelected
								? "text-indigo-600 bg-indigo-50 border-indigo-600"
								: "text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 border-white"
						}`}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						ref={ref}
					>
						<Link
							className="flex h-6 w-6 items-center justify-center rounded-2xl transition-colors"
							href={link}
							onClick={onClick}
						>
							{icon}
						</Link>
						<span className="text-[0.65rem]">{label}</span>
						{hasExtendedPanel && (
							<div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2">
								<div className="rounded-full p-0.5 transition-all ">
									<ChevronRight 
										className={`w-3 h-3 transition-colors ${
											isSelected 
												? "text-indigo-600" 
												: "text-gray-600"
										}`}
									/>
								</div>
							</div>
						)}
					</div>
				);
			});

MenuButton.displayName = "MenuButton";


