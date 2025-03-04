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
  Users2,
  Building2,
  Calendar,
  MessageSquareCode,
  Workflow,
  ClipboardList,
  Folder,
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjects } from "@/api/projectRoutes";
import { getMembers } from "@/api/membersRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppView } from "@/types/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CustomProjectSwitcher } from "./CustomProjectSwitcher";
import { useParams } from "next/navigation";
const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

export function EnhancedSidePanel() {
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
        (project) => project.project_id === projectId
      );
      if (project) {
        setActiveProject(project);
      }
    }
  }, [userProjects.length, userProjects, setActiveProject, params?.projectId]);

  // Fetch members for active project
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["memberList", session, activeProject],
    queryFn: async () => {
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
  const { data: chatEntitities, isLoading: chatsLoading } = useQuery({
    queryKey: ["chatEntityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      return getAgentChatEntities(session, activeProject.project_id);
    },
    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  // Set chat entities when data is loaded
  useEffect(() => {
    if (chatEntitities && chatEntitities.length > 0) {
      setChatEntities(chatEntitities);
      setActiveChatEntity(chatEntitities[chatEntitities.length - 1]);
    } else {
      setActiveChatEntity(null);
      setChatEntities([]);
    }
  }, [chatEntitities, setActiveChatEntity, setChatEntities]);

  // Handle click outside to close project switcher
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
      <div className="flex flex-col items-center py-4 border-b border-gray-200">
        <Link href="/project" className="hover:opacity-80 transition-opacity">
          <div
            className={`${archivoBlack.className} text-2xl text-gray-800 mb-2`}
          >
            F
          </div>
        </Link>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={projectButtonRef}
              onClick={() => setShowProjectSwitcher(!showProjectSwitcher)}
              className={`w-[55px] flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all
                ${
                  showProjectSwitcher
                    ? "bg-gray-100 text-gray-800 border border-gray-200 shadow-sm"
                    : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
                }`}
            >
              <div className="relative">
                <Avatar className="h-6 w-6 mb-1 ring-2 ring-offset-1 ring-offset-indigo-500 ring-white/30">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${
                      activeProject?.name || "project"
                    }.png`}
                    alt={activeProject?.name ? activeProject.name : "P"}
                    className={showProjectSwitcher ? "" : "grayscale"}
                  />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                {activeProject && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
                )}
              </div>
              <div className="text-[10px] font-medium">
                {activeProject?.name
                  ? activeProject.name.length > 8
                    ? `${activeProject.name.substring(0, 8)}...`
                    : activeProject.name
                  : "Project"}
              </div>
              <div className="flex items-center text-[8px] font-semibold bg-gray-50 px-2 py-0.5 rounded-full">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1">SWITCH</span>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Switch Project</TooltipContent>
        </Tooltip>
      </div>

      {/* Project Switcher Popover */}
      {showProjectSwitcher && (
        <div ref={projectSwitcherRef} className="absolute left-16 top-8 z-20">
          <div className="bg-white rounded-md shadow-lg p-2 border border-gray-200 w-[300px]">
            <div className="font-medium px-2 py-1 text-sm border-b border-gray-100 mb-1">
              Project Selection
            </div>
            <CustomProjectSwitcher
              onProjectSwitch={() => setShowProjectSwitcher(false)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col items-center gap-2 py-4">
          <AllMenuButtons />
        </nav>
      </div>

      {/* User controls at bottom */}
      <div className="flex flex-col items-center gap-2 py-4 border-t border-gray-200">
        <HeaderNotification />
        <UserNav email="" />
      </div>

      <SetUseStoreData />
    </div>
  );
}

const menuItems: {
  label: string;
  fnKey: AppView;
  icon: React.ReactNode;
  link: string;
}[] = [
  {
    label: "Projects",
    fnKey: "project",
    icon: <Building2 className="h-5 w-5" />,
    link: "projects",
  },
  {
    label: "Workbench",
    fnKey: "workbench",
    icon: <ClipboardList className="h-5 w-5" />,
    link: "workbench",
  },
  {
    label: "Schedule",
    fnKey: "schedule",
    icon: <Calendar className="h-5 w-5" />,
    link: "schedule",
  },
  {
    label: "Documents",
    fnKey: "updates",
    icon: <Folder className="h-5 w-5" />,
    link: "documents",
  },
  {
    label: "Chat",
    fnKey: "agent",
    icon: <MessageSquareCode className="h-5 w-5" />,
    link: "agent",
  },
  {
    label: "Members",
    fnKey: "members",
    icon: <Users2 className="h-5 w-5" />,
    link: "members",
  },
  {
    label: "Integration",
    fnKey: "integrations",
    icon: <Workflow className="h-5 w-5" />,
    link: "integrations",
  },
];

const AllMenuButtons = () => {
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
          key={item.label}
          isSelected={appView === item.fnKey}
          onClick={() => setAppView(item.fnKey)}
          label={item.label}
          icon={item.icon}
          link={projectId ? `/project/${projectId}/${item.link}` : `/project`}
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
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`flex flex-col text-center justify-center items-center my-1 w-full ${
            isSelected
              ? "text-indigo-600 bg-gray-50"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Link
            href={link}
            className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-colors`}
            onClick={onClick}
          >
            {icon}
          </Link>
          <span className="text-[0.6rem]">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};

const SetUseStoreData = () => {
  const {
    session,
    activeProject,
    scheduleDate,
    scheduleProbability,
    setUserActivities,
    setTaskToView,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    scheduleDate: state.scheduleDate,
    scheduleProbability: state.scheduleProbability,
    setUserActivities: state.setUserActivities,
    setTaskToView: state.setTaskToView,
  }));

  const { data: activities, isSuccess } = useQuery({
    queryKey: [
      "activityList",
      session,
      activeProject,
      scheduleDate,
      scheduleProbability,
    ],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("Set session first !");
      }
      const date = getCurrentDateFormatted(scheduleDate || new Date());
      return getActivities(
        session,
        activeProject.project_id,
        date,
        scheduleProbability
      );
    },
    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  useEffect(() => {
    if (isSuccess && activities && activities.length > 0) {
      setUserActivities(activities);
    } else if (isSuccess && activities && activities.length === 0) {
      setUserActivities([]);
    }
  }, [activities, isSuccess, setUserActivities]);

  return <></>;
};
