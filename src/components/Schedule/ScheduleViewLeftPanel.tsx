import React, { useState } from "react";
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

function ScheduleUiView({ uiView }: { uiView?: string | string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);
  const { syncSchedule } = useScheduleSync();

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
        defaultValue="list"
        className="flex flex-col h-full overflow-y-scroll p-2   "
      >
        <TabsList className="grid grid-cols-2 w-48 ">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
        </TabsList>
        <TabsContent
          value="list"
          className="flex h-full overflow-scroll  gap-4 "
        >
          <Card className="overflow-y-scroll">
            <CardHeader>
              <CardTitle>Project Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleInsights />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivitiesDetailPage />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gantt" className="flex-1 overflow-scroll">
          <Card>
            <CardContent>
              <ScheduleGanttInterface />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ScheduleUiView;
