import React, { useEffect, useState } from "react";

import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";

import { getActivities } from "@/api/activity_routes";

import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import UpdateDailyUpdateScheduleModal from "../Schedule/ConfigureTaskQueue/ConfigureDailyUpdateModal";

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
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppView } from "@/types/store";

export function SideMenuPanel() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onClose = () => setIsOpen(false);
  return (
    <>
      <SetUseStoreData />
      <div className="px-1 py-4 flex flex-col items-center bg-white h-full rounded-xl custom-shadow">
        {isOpen && (
          <UpdateDailyUpdateScheduleModal isOpen={isOpen} onClose={onClose} />
        )}
        <aside className="inset-y-0 hidden w-14 flex-col bg-background sm:flex w-full">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <AllMenuButtons />
          </nav>
        </aside>
        <MenuButton
          isSelected={false}
          onClick={() => setIsOpen(true)}
          label="Configuration"
          icon={<FileClock className="h-5 w-5" />}
        />
      </div>
    </>
  );
}

const menuItems: { label: string; fnKey: AppView; icon: React.ReactNode }[] = [
  {
    label: "Projects",
    fnKey: "project",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: "Dashboard",
    fnKey: "dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Schedule",
    fnKey: "schedule",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Agent",
    fnKey: "agent",
    icon: <MessageSquareCode className="h-5 w-5" />,
  },
  {
    label: "Documents",
    fnKey: "updates",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Members",
    fnKey: "members",
    icon: <Users2 className="h-5 w-5" />,
  },
  {
    label: "Integration",
    fnKey: "integrations",
    icon: <Workflow className="h-5 w-5" />,
  },
];

const AllMenuButtons = () => {
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
        />
      ))}
    </>
  );
};

const MenuButton = ({
  isSelected,
  onClick,
  label,
  icon,
}: {
  isSelected: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="#"
          className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-colors ${
            isSelected
              ? "text-foreground font-semibold bg-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onClick}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Link>
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
      setUserActivities([
        {
          id: "SCHEDULE",
          project_id: "parent",
          name: "No active task",
          start: "01/02/23",
          end: "01/02/23",
          progress: 0,
          activity_critical: {
            critical_path: false,
          },
        },
      ]);
    }
  }, [activities, isSuccess, setUserActivities]);

  useEffect(() => {
    setTaskToView(defaultTask);
  }, [activeProject]);

  return <></>;
};
