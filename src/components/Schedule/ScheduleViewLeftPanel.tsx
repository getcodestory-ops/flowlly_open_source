import React, { useState, useEffect } from "react";
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

function ScheduleUiView({ uiView }: { uiView?: string | string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);
  const { syncSchedule } = useScheduleSync();
  const { taskToView, setTaskToView } = useStore((state) => ({
    taskToView: state.taskToView,
    setTaskToView: state.setTaskToView,
  }));
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(
    (searchParams && searchParams.get("scheduleView")) || "list"
  );

  useEffect(() => {
    const view = searchParams && searchParams.get("scheduleView");
    if (view === "gantt" || view === "list") {
      setActiveTab(view);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`?scheduleView=${value}`);
  };

  const handleAddActivity = () => {
    onOpen();
  };

  return (
    <div className="w-full h-full flex flex-col ">
      <AddNewActivityModal isOpen={isOpen} onClose={onClose} />

      <div className=" flex  justify-end gap-8 items-center absolute right-8 ">
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
        value={activeTab}
        onValueChange={handleTabChange}
        defaultValue="list"
        className="flex flex-col h-full  p-2 w-full"
      >
        <TabsList className="grid grid-cols-2 w-48 ">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="flex h-full   gap-4  ">
          <Card className=" flex-stretch w-full ">
            <CardHeader>
              <CardTitle className="text-3xl">Project Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleInsights />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gantt" className="w-[calc(100vw-70px)] ">
          <Card>
            <CardContent>
              <ScheduleGanttInterface />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div
        className={`fixed  right-0 h-full w-3/4 max-w-2xl bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${
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
    </div>
  );
}

export default ScheduleUiView;
