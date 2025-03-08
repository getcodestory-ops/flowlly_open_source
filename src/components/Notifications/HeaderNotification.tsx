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
import { convertIsoToTimeAgo } from "@/utils/dateUtils";

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

export default function HeaderNotification() {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();
  const refreshInterval = useStore((state) => state.refreshInterval);
  const setRefreshInterval = useStore((state) => state.setRefreshInterval);
  const [lastNotificationId, setLastNotificationId] = useState("0");

  // Add default interval constant
  const DEFAULT_REFRESH_INTERVAL = 15000; // or whatever default you prefer

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => {
      if (!session || !activeProject) return [];
      return getNotifications(
        session,
        activeProject.project_id,
        lastNotificationId
      );
    },
    refetchInterval: refreshInterval,
    enabled: !!session && !!activeProject,
  });

  useEffect(() => {
    if (!data || !data.length) return;

    // Find new notifications by comparing with current notifications state
    const newNotifications = data.filter(
      (newNotification: Notification) =>
        !notifications.some(
          (existing: Notification) => existing.id === newNotification.id
        )
    );

    if (newNotifications.length === 0) return;

    setNotifications((state) => [...state, ...newNotifications]);
    setUnreadCount(data.filter((n: Notification) => n.read !== "read").length);

    // Process invalidateQueries
    [...newNotifications]
      .sort((a, b) => {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      })
      .slice(0, 5)
      .forEach((notification: Notification) => {
        if (notification.invalidateQueries) {
          notification.invalidateQueries.forEach((query: any) => {
            queryClient.invalidateQueries({ queryKey: query.queryKey });
          });
        }
      });

    // Update lastNotificationId and refreshInterval
    const smallestInterval = Math.min(
      ...newNotifications.map(
        (n: Notification) => n.refreshInterval || DEFAULT_REFRESH_INTERVAL
      )
    );
    setLastNotificationId(newNotifications[newNotifications.length - 1].id);
    setRefreshInterval(smallestInterval);
  }, [data, queryClient, setRefreshInterval]);

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
