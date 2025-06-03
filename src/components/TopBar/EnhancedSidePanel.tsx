"use client";

import React, { useEffect, useState, useRef } from "react";
import { Archivo_Black } from "next/font/google";
import { UserNav } from "@/components/ProjectDashboard/components/UserNav";
import HeaderNotification from "../Notifications/HeaderNotification";
import { useStore } from "@/utils/store";
import { getActivities } from "@/api/activity_routes";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import Link from "next/link";
import {
	Calendar,
	MessageSquareCode,
	ClipboardList,
	Folder,
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjects } from "@/api/projectRoutes";
import { getMembers } from "@/api/membersRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { AppView } from "@/types/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CustomProjectSwitcher } from "./CustomProjectSwitcher";
import { useParams } from "next/navigation";
import { Button } from "../ui/button";
import { ProjectEntity } from "@/types/projects";
import { cn } from "@/lib/utils";
import { Tooltipped } from "../Common/Tooltiped";
const archivoBlack = Archivo_Black({
	weight: "400",
	subsets: ["latin"],
});

export function EnhancedSidePanel(): React.ReactNode {
	const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
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
	} = useStore((state) => ({
		session: state.session,
		userProjects: state.userProjects,
		activeProject: state.activeProject,
		setActiveProject: state.setActiveProject,
		setUserProjects: state.setUserProjects,
		setMembers: state.setMembers,
		setActiveChatEntity: state.setActiveChatEntity,
		setChatEntities: state.setChatEntities,
	}));

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

	// Set active project based on URL if needed
	useEffect(() => {
		if (userProjects.length === 0) return;
		const projectId = params?.projectId;

		if (projectId) {
			const project = userProjects.find(
				(project) => project.project_id === projectId,
			);
			if (project) {
				setActiveProject(project);
			}
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

	// Fetch chat entities for active project
	// const { data: chatEntitities } = useQuery({
	// 	queryKey: ["chatEntityList", session, activeProject],
	// 	queryFn: () => {
	// 		if (!session || !activeProject) {
	// 			return Promise.reject("No session or active project");
	// 		}
	// 		return getAgentChatEntities(session, activeProject.project_id);
	// 	},
	// 	enabled: !!session?.access_token && !!activeProject?.project_id,
	// });

	// Set chat entities when data is loaded
	// useEffect(() => {
	// 	if (chatEntitities && chatEntitities.length > 0) {
	// 		setChatEntities(chatEntitities);
	// 		setActiveChatEntity(chatEntitities[chatEntitities.length - 1]);
	// 	} else {
	// 		setActiveChatEntity(null);
	// 		setChatEntities([]);
	// 	}
	// }, [chatEntitities, setActiveChatEntity, setChatEntities]);

	// Handle click outside to close project switcher
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
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
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
						{/* <div className="relative">
								<Avatar className="h-6 w-6 mb-1 ring-2 ring-offset-1 ring-offset-indigo-500 ring-white/30">
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
									<span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border border-white" />
								)}
							</div> */}
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
				<div className="absolute left-16 top-8 z-20" ref={projectSwitcherRef}>
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
			{/* Navigation buttons */}
			<div className="flex-1 overflow-y-auto">
				<nav className="flex flex-col items-center py-4">
					<AllMenuButtons />
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
	// {
	// 	label: "Projects",
	// 	fnKey: "project",
	// 	icon: <Building2 className="h-5 w-5" />,
	// 	link: "projects",
	// },
	{
		label: "Workflow",
		fnKey: "workflows",
		icon: <ClipboardList className="h-5 w-5" />,
		link: "workbench",
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
	// {
	// 	label: "Team",
	// 	fnKey: "members",
	// 	icon: <Users2 className="h-5 w-5" />,
	// 	link: "members",
	// },
	// {
	// 	label: "Connect",
	// 	fnKey: "integrations",
	// 	icon: <Workflow className="h-5 w-5" />,
	// 	link: "integrations",
	// },
];

const AllMenuButtons = (): React.ReactNode => {
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
					icon={item.icon}
					isSelected={appView === item.fnKey}
					key={item.label}
					label={item.label}
					link={projectId ? `/project/${projectId}/${item.link}` : "/project"}
					onClick={() => setAppView(item.fnKey)}
				/>
			))}
		</>
	);
};

const MenuButton = ({
	isSelected,
	onClick,
	label,
	link,
	icon,
}: {
  isSelected: boolean;
  onClick: () => void;
  label: string;
  link: string;
  icon: React.ReactNode;
}): React.ReactNode => {
	return (
		<div
			className={`flex flex-col text-center justify-center items-center py-2 w-full border-r-4 border-gray-200 gap-0 ${
				isSelected
					? "text-indigo-600 bg-indigo-50 border-indigo-600"
					: "text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 border-white"
			}`}
		>
			<Link
				className="flex h-6 w-6 items-center justify-center rounded-2xl transition-colors"
				href={link}
				onClick={onClick}
			>
				{icon}
			</Link>
			<span className="text-[0.65rem]">{label}</span>
		</div>
	);
};


