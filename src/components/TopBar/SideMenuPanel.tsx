"use client";

import React, { use, useEffect } from "react";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { getActivities } from "@/api/activity_routes";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  Home,
  Package,
  Users2,
  Building2,
  Calendar,
  MessageSquareCode,
  Workflow,
  FileClock,
  BrainCircuit,
  ClipboardList,
  Folder,
  CircleGauge,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppView } from "@/types/store";

export function SideMenuPanel() {
  return (
    <>
      <SetUseStoreData />
      <div className=" flex flex-col items-center  h-full rounded-xl custom-shadow">
        <aside className="inset-y-0 hidden w-14 flex-col  sm:flex w-full">
          <nav className="flex flex-col items-center gap-4  sm:py-5">
            <AllMenuButtons />
          </nav>
        </aside>
      </div>
    </>
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
  // {
  //   label: "Dashboard",
  //   fnKey: "dashboard",
  //   icon: <CircleGauge className="h-5 w-5" />,
  //   link: "dashboard",
  // },
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
  {
    label: "Config",
    fnKey: "configuration",
    icon: <FileClock className="h-5 w-5" />,
    link: "configuration",
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
        {/* <div className="flex flex-col text-center justify-center items-center my-1"> */}
        <div
          className={`flex flex-col text-center justify-center items-center my-1 w-full text-white ${
            isSelected ? "bg-black" : "hover:bg-white hover:text-black"
          }`}
        >
          <Link
            href={link}
            className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-colors `}
            onClick={onClick}
          >
            {icon}
          </Link>
          <span className="text-[0.45rem] ">{label}</span>
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

  const defaultTask = {
    id: "SCHEDULE",
    project_id: "parent",
    name: "No active task",
    start: "01/02/23",
    end: "01/02/23",
    progress: 0,
    activity_critical: {
      critical_path: false,
    },
  };

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

  // useEffect(() => {
  //   setTaskToView(defaultTask);
  // }, [activeProject]);

  return <></>;
};
