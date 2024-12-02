"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProjectInfoDisplay from "@/components/ProjectDashboard/ProjectInfoDisplay";
import { SideMenuPanel } from "@/components/TopBar/SideMenuPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabaseClient";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { setSessionToken } = useStore((state) => ({
    setSessionToken: state.setSession,
    userProjects: state.userProjects,
    setActiveProject: state.setActiveProject,
  }));

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        router.replace("/applogin");
      } else {
        setSessionToken(data?.session);
      }
    }
    loginCheck();
  }, [router, setSessionToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <TooltipProvider>
        <div className="flex flex-col w-[100vw] h-[100vh]">
          <div className="h-[65px] w-[100vw] overlow-hidden">
            <ProjectInfoDisplay />
          </div>
          <div className="flex w-[100vw] h-[calc(100vh-65px)] overlow-hidden">
            <div className="w-[50px] h-[calc(100vh-65px)] border-r-2  border-black bg-gradient-to-b from-indigo-500 to-purple-500">
              <SideMenuPanel />
            </div>
            <ScrollArea className="w-[calc(100vw-50px)] h-[calc(100vh-65px)] overflow-hidden">
              {children}
            </ScrollArea>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
