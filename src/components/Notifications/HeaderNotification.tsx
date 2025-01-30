"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "@/api/notification";
import { useStore } from "@/utils/store";
import { formatDistanceToNow, parseISO } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: "read" | "unread";
  refreshInterval?: number;
  invalidateQueries?: {
    queryKey: string[]; // Array to match React Query's queryKey format
  }[];
}

function convertIsoToTimeAgo(dateString?: string) {
  if (!dateString) return "";

  const utcDate = parseISO(`${dateString}Z`);
  const timeAgo = formatDistanceToNow(utcDate, {
    addSuffix: true,
  });
  return timeAgo;
}

export default function HeaderNotification() {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();
  const [notifiedEventIds, setNotifiedEventIds] = useState<string[]>([]);
  const refreshInterval = useStore((state) => state.refreshInterval);
  const setRefreshInterval = useStore((state) => state.setRefreshInterval);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => {
      if (!session || !activeProject) return [];
      return getNotifications(session, activeProject.project_id);
    },
    refetchInterval: refreshInterval,
    enabled: !!session && !!activeProject,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
      setUnreadCount(
        data.filter((n: Notification) => n.read !== "read").length
      );
    }
  }, [data]);

  useEffect(() => {
    const handleNotifications = () => {
      // Process all notifications that have invalidation instructions
      notifications.forEach((notification) => {
        if (notification.invalidateQueries) {
          notification.invalidateQueries.forEach((query) => {
            queryClient.invalidateQueries({ queryKey: query.queryKey });
          });
        }
        if (notification.refreshInterval) {
          setRefreshInterval(notification.refreshInterval);
        }
      });
    };

    handleNotifications();
  }, [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((notification: Notification, index) => (
              <DropdownMenuItem
                key={index}
                // onSelect={() => markAsRead(notification.id)}
              >
                <div
                  className={`w-full ${notification.read ? "opacity-50" : ""}`}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {convertIsoToTimeAgo(notification.timestamp)}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
