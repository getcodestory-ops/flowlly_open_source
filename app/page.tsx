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

  const { setSessionToken, setUserProjects, setActiveProject } = useStore(
    (state) => ({
      setSessionToken: state.setSession,
      setUserProjects: state.setUserProjects,
      setActiveProject: state.setActiveProject,
    })
  );

  useEffect(() => {
    async function loginCheck() {
      const { data } = await supabase.auth.getSession();

      if (!data?.session?.user) {
        router.replace("/applogin");
      } else {
        setSessionToken(data?.session);
        const projects = await getProjects(data?.session);
        console.log("projects", projects);
        setUserProjects(projects);
        setActiveProject(projects[0]);

        if (projects.length > 0) {
          const activeProject = projects[0];
          console.log("activeProject", activeProject);
          if (activeProject) {
            console.log("now redirecting to agent");

            try {
              if (!activeProject.project_id) {
                router.replace("/project/new");
              } else {
                router.push(`/project/${activeProject.project_id}/agent`);
              }
            } catch (error) {
              console.error("Navigation error:", error);
              router.push("/");
            }
          } else {
            router.replace("/");
          }
        } else {
          router.replace("/project/new");
        }
      }
    }
    loginCheck();
  }, [router, setSessionToken, setUserProjects, setActiveProject]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size="64" className="animate-spin" />
    </div>
  );
}
