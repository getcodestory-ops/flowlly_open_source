"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "../../ui/use-toast";
import { useStore } from "@/utils/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, addMinutes, roundToNearestMinutes } from "date-fns";
import { Label } from "@/components/ui/label";
import { BasicMetadata } from "./components/BasicMetadata";
import { TriggerConfiguration } from "./components/TriggerConfiguration";
import { WorkflowNodes } from "./components/WorkflowNodes/WorkFlowNodes";
import { useWorkflowForm } from "./hooks/useWorkflowForm";
import { WorkflowFormData } from "./types";
import { GraphData } from "../../../../app/project/[projectId]/workbench/components/types";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function CustomWorkflowForm({
  onClose,
  editData,
}: {
  onClose: () => void;
  editData?: GraphData;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const members = useStore((state) => state.members);

  const {
    currentStep,
    formData,
    handleNext,
    handleBack,
    handleSubmit,
    isFormValid,
    updateFormData,
    isPending,
    isSuccess,
  } = useWorkflowForm({ session, activeProject, members });

  const handleFormUpdate = (updates: Partial<WorkflowFormData>) => {
    updateFormData(updates);
  };

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  useEffect(() => {
    handleFormUpdate({
      accessByKey: activeProject?.project_id ?? "",
    });
    if (formData.triggerBy === "email_subject") {
      // Set default values for email triggers
      handleFormUpdate({
        triggerByKey: session?.user?.email ?? "User",
      });
    }
  }, [formData.triggerBy, activeProject, session]);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState(
    format(roundToNearestMinutes(new Date(), { nearestTo: 30 }), "HH:mm")
  );
  const [duration, setDuration] = useState("60");
  const [recurrence, setRecurrence] = useState<string>("once");
  const [weeklyRecurrenceDay, setWeeklyRecurrenceDay] = useState(
    format(new Date(), "EEEE")
  );
  const [triggerType, setTriggerType] = useState<"manual" | "scheduled">(
    "manual"
  );

  return (
    <ScrollArea className="w-full h-full">
      <Card
        className={`w-full ${
          currentStep < 2 ? "max-w-4xl" : "w-full"
        } mx-auto `}
      >
        <CardHeader>
          <CardTitle>Deploy a new worker</CardTitle>
          <span className="text-sm mt-2 font-thin ">
            {new Date().toLocaleTimeString()} {formData.timeZone}
          </span>
        </CardHeader>

        <div>
          <CardContent className="space-y-6  ">
            {currentStep === 0 && (
              <BasicMetadata formData={formData} onChange={handleFormUpdate} />
            )}

            {currentStep === 1 && activeProject && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="triggerType">
                    How do you want to initiate this workflow?
                  </Label>
                  <Select
                    name="triggerBy"
                    value={formData.triggerBy}
                    onValueChange={(
                      value: "email_subject" | "phone" | "time" | "ui"
                    ) => handleFormUpdate({ triggerBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui">Via UI</SelectItem>
                      <SelectItem value="email_subject">Via Email</SelectItem>
                      <SelectItem value="phone">Via Phone</SelectItem>
                      <SelectItem value="time">At a specific time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.triggerBy === "time" && (
                  <>
                    <div className="space-y-2 m-2 p-2 bg-secondary rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="recurrence">Repeat</Label>
                        <Select
                          name="recurrence"
                          value={recurrence}
                          defaultValue="once"
                          onValueChange={setRecurrence}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select repeat frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">
                              Does not repeat
                            </SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekdays">Weekdays</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {recurrence === "weekly" && (
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="weeklyRecurrenceDay">On</Label>
                            <Select
                              value={weeklyRecurrenceDay}
                              onValueChange={setWeeklyRecurrenceDay}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "Sunday",
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                ].map((day) => (
                                  <SelectItem key={day} value={day}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>
                            {recurrence === "once" ? "Date" : "Start Date"}
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={
                                  !startDate ? "text-muted-foreground" : ""
                                }
                              >
                                {startDate
                                  ? format(startDate, "PPP")
                                  : "Pick a date"}
                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => setStartDate(date as Date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        {recurrence !== "once" && (
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={
                                    !endDate ? "text-muted-foreground" : ""
                                  }
                                >
                                  {endDate
                                    ? format(endDate, "PPP")
                                    : "Pick a date"}
                                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={(date) => setEndDate(date as Date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startTime">Start Time</Label>
                          <Select
                            value={startTime}
                            onValueChange={setStartTime}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 96 }, (_, i) => {
                                const date = addMinutes(
                                  new Date().setHours(0, 0, 0, 0),
                                  i * 15
                                );
                                return (
                                  <SelectItem
                                    key={i}
                                    value={format(date, "HH:mm")}
                                  >
                                    {format(date, "p")}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <TriggerConfiguration
                  formData={formData}
                  onChange={handleFormUpdate}
                  members={members}
                  activeProject={activeProject}
                />
              </>
            )}

            {currentStep === 2 && (
              <WorkflowNodes formData={formData} onChange={handleFormUpdate} />
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {currentStep < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 0 && !isFormValid}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!formData.nodes.length || isPending}
                onClick={handleSubmit}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Save Workflow"
                )}
              </Button>
            )}
          </CardFooter>
        </div>
      </Card>
    </ScrollArea>
  );
}
