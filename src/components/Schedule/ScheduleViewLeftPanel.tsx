import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ScheduleInsights from "./ScheduleInsights";
import { Button } from "@/components/ui/button";
import ScheduleGanttInterface from "./ScheduleGanttInterface";
import CustomDatePicker from "../DatePicker/DatePicker";
import ActivitiesDetailPage from "./ActivityDetailsPage";
import AddNewActivityModal from "./AddNewActivityModal";
import CsvUploadIcon from "./CSVUpload/csvUploadIcon";
import { useScheduleSync } from "./SyncSchedule/useScheduleWithProcore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useStore } from "@/utils/store";
import { useViewStore } from "@/utils/store";
import PlatformChatComponent from "../ChatInput/PlatformChat/PlatformChatComponent";
import { MessageCircle } from "lucide-react";
import Draggable from "react-draggable";
import ChatButton from "../ChatButton";

function ScheduleUiView({ uiView }: { uiView?: string | string[] }) {
  const { scheduleView, setScheduleView } = useViewStore();
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { syncSchedule } = useScheduleSync();
  const { taskToView, setTaskToView, activeProject } = useStore((state) => ({
    taskToView: state.taskToView,
    setTaskToView: state.setTaskToView,
    activeProject: state.activeProject,
  }));
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleTabChange = (value: string) => {
    setScheduleView(value as "list" | "gantt");
  };

  const handleAddActivity = () => {
    onOpen();
  };

  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    setButtonPosition({ x: data.x, y: data.y });
  };

  const nodeRef = useRef(null);

  return (
    <div className="w-full h-full flex flex-col  pt-2 ">
      <AddNewActivityModal isOpen={isOpen} onClose={onClose} />

      <div className=" flex  justify-end gap-8 items-center absolute right-8 z-50  px-2  rounded-lg">
        <div>
          <CustomDatePicker />
        </div>
        <div className="flex gap-4 items-center p-2">
          <CsvUploadIcon />
          <Button
            variant="outline"
            onClick={handleAddActivity}
            className="text-xs"
          >
            + Add Task
          </Button>
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => syncSchedule()}
          >
            Sync Procore
          </Button>
        </div>
      </div>

      <Tabs
        value={scheduleView}
        onValueChange={handleTabChange}
        defaultValue={scheduleView}
        className="flex flex-col h-full  p-2 w-full"
      >
        <TabsList className="grid grid-cols-2 w-48 ">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="flex h-full gap-2  ">
          <Card className=" flex-stretch w-full ">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Project Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleInsights />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gantt" className=" w-[calc(100vw-70px)] ">
          <Card>
            <CardContent>
              <ScheduleGanttInterface />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div
        className={`fixed z-50 right-0 h-full w-3/4 max-w-2xl bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${
          taskToView ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Card className="h-full">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-3xl">Activity Details</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTaskToView(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </CardHeader>
          <CardContent>
            <ActivitiesDetailPage />
          </CardContent>
        </Card>
      </div>
      <Draggable
        nodeRef={nodeRef}
        position={buttonPosition}
        onStop={handleDrag}
        bounds="parent"
      >
        <div ref={nodeRef} className="fixed bottom-4 right-4">
          <ChatButton
            isOpen={isChatOpen}
            onClick={() => setIsChatOpen(!isChatOpen)}
            title={
              isChatOpen
                ? "Close chat assistant"
                : "Chat with Flowlly AI about schedule"
            }
            openText="Update schedule"
            fixed={false}
          />
        </div>
      </Draggable>

      {(isChatOpen || isClosing) && (
        <div
          ref={chatRef}
          className={`fixed bottom-20 right-4 w-[calc(100vw-200px)] z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          {activeProject && (
            <PlatformChatComponent
              folderId={activeProject?.project_id}
              folderName="Schedule"
              chatTarget="schedule"
            />
          )}
          <div className="fixed p-2 z-50 top-0 ">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsClosing(true);
                setTimeout(() => {
                  setIsChatOpen(false);
                  setIsClosing(false);
                }, 300);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleUiView;
