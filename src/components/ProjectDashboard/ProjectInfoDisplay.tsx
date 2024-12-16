"use client";
import React from "react";
import { Archivo_Black } from "next/font/google";
import { ProjectSwitcher } from "@/components/ProjectDashboard/components/ProjectSwitcher";
import { UserNav } from "@/components/ProjectDashboard/components/UserNav";
import HeaderNotification from "../Notifications/HeaderNotification";
import MediaRecorderButton from "../ChatInput/MediaRecorderButton";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

function ProjectInfoDisplay() {
  return (
    <div className="flex flex-col w-full bg-white">
      <div className="hidden flex-col md:flex">
        <div className="border-b bg-background  border-gradient-to-r from-indigo-700 to-purple-500">
          <div className="flex h-16 items-center px-4 gap-4">
            <div className={`${archivoBlack.className} text-2xl`}>FLOWLLY</div>
            <ProjectSwitcher />
            <HeaderNotification />
            <MediaRecorderButton />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav email={"user.email" ?? ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectInfoDisplay;
