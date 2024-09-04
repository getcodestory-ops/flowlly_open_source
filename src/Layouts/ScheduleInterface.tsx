"use client";

import React from "react";
import ScheduleUIView from "@/components/Schedule/ScheduleViewLeftPanel";
import { useStore } from "@/utils/store";

import { AddNewProjectButton } from "@/components/Schedule/AddNewProjectModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ScheduleInterface({ view }: { view?: string | string[] }) {
  const { activeProject } = useStore((state) => ({
    activeProject: state.activeProject,
  }));

  return (
    <div>
      {activeProject ? (
        <ScheduleUIView uiView={view} />
      ) : (
        <div className="justify-center items-center w-full h-full flex">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                To get started first create a new project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddNewProjectButton />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ScheduleInterface;
