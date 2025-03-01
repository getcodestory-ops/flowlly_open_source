"use client";

import React, { useEffect } from "react";
import { useStore } from "@/utils/store";
import { useRouter, usePathname } from "next/navigation";
import supabase from "@/utils/supabaseClient";
import { getProjects } from "@/api/projectRoutes";
import { Loader2 } from "lucide-react";

export default function MainLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const { setSessionToken } = useStore((state) => ({
    setSessionToken: state.setSession,
  }));

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        router.replace("/applogin");
      } else {
        setSessionToken(data?.session);
        const projects = await getProjects(data?.session);

        if (projects.length > 0) {
          const activeProject = projects[0];
          if (activeProject) {
            router.replace(`/project/${activeProject.project_id}/agent`);
          } else {
            router.replace("/");
          }
        } else {
          router.replace("/project/new");
        }
      }
    }
    loginCheck();
  }, [router, setSessionToken]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size="64" className="animate-spin" />
    </div>
  );
}
