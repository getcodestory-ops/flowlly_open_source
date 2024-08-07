import React from "react";
import { Flex } from "@chakra-ui/react";
import ScheduleUIView from "@/components/Schedule/ScheduleViewLeftPanel";
import { useStore } from "@/utils/store";
import CreateNewProjectButton from "@/components/Schedule/NewProjectButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ScheduleInterface({ view }: { view?: string | string[] }) {
  const { activeProject } = useStore((state) => ({
    activeProject: state.activeProject,
  }));

  return (
    <div className="w-full h-full overflow-hidden">
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
              <CreateNewProjectButton />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ScheduleInterface;
