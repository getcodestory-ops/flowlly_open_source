import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import getCurrentDateFormatted, {
  dateDiffInDays,
} from "@/utils/getCurrentDateFormatted";
import { updateActivity } from "@/api/activity_routes";
import { ActivityEntity } from "@/types/activities";
import MultiSelect from "../MultiSelect/MultiSelect";
import { getMembers } from "@/api/membersRoutes";
import { MemberEntity } from "@/types/members";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
interface UpdateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ActivityEntity[];
  modifyTask: ActivityEntity;
  updateSource?: string;
}

function UpdateActivityModal({
  isOpen,
  onClose,
  tasks,
  modifyTask,
  updateSource,
}: UpdateActivityModalProps) {
  const { toast } = useToast();
  const dateToday = getCurrentDateFormatted();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const [activity, setActivity] = useState<ActivityEntity>(modifyTask);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(activity.start) || new Date(),
    to: new Date(activity.end) || new Date(),
  });

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setActivity((state) => ({
        ...state,
        start: format(dateRange?.from || new Date(), "yyyy-MM-dd"),
        end: format(dateRange?.to || new Date(), "yyyy-MM-dd"),
        duration: dateDiffInDays(
          dateRange.from || new Date(),
          dateRange.to || new Date()
        ),
      }));
    }
  }, [dateRange]);

  useEffect(() => {
    setActivity(modifyTask);
  }, [modifyTask]);

  const queryClient = useQueryClient();

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["memberList", session, activeProject],
    queryFn: async () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }

      return getMembers(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  const { mutate } = useMutation({
    mutationFn: (activity: ActivityEntity) => {
      if (!activity || !activeProject) return Promise.reject("No activity");
      return updateActivity(session!, activeProject.project_id, activity);
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error updating activity",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Activity updated",
        description: "Activity has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["activityList"] });
    },
  });

  const updateTask = () => {
    if (!activity) return;
    mutate(activity);
    onClose();
  };

  useEffect(() => {
    if (activity.start && activity.end) {
      const startDate = new Date(activity.start);
      const endDate = new Date(activity.end);
      setActivity((state) => ({
        ...state,
        duration: dateDiffInDays(startDate, endDate),
      }));
    }
  }, [activity.start, activity.end]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-96 lg:w-full"
        aria-describedby="activity update"
      >
        {!activeProject ? (
          <DialogHeader>
            <DialogTitle>No Project Selected</DialogTitle>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Update Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Task Name
                </Label>
                <Input
                  id="name"
                  value={activity.name}
                  onChange={(e) =>
                    setActivity((state) => ({
                      ...state!,
                      name: e.target.value,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Date Range
                  </Label>
                  <CalendarDateRangePicker
                    className="col-span-3"
                    date={dateRange}
                    setDate={setDateRange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Duration</Label>
                <div className="col-span-3">{activity.duration} days</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={activity.description}
                  onChange={(e) =>
                    setActivity((state) => ({
                      ...state!,
                      description: e.target.value,
                    }))
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Assignees</Label>
                <div className="col-span-3">
                  <MultiSelect
                    title="Assignees"
                    options={members?.data.map((member: MemberEntity) => ({
                      label: `${member.first_name} ${member.last_name}`,
                      id: member.id,
                    }))}
                    onChange={(selectedOptions) => {
                      setActivity((state) => ({
                        ...state!,
                        owner: selectedOptions,
                      }));
                    }}
                    existingSelection={activity?.owner ?? []}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dependencies</Label>
                <div className="col-span-3">
                  <MultiSelect
                    key={activity.id}
                    title="Depends on"
                    options={tasks.map((activity: ActivityEntity) => ({
                      label: `${activity.name}`,
                      id: activity.id,
                    }))}
                    onChange={(selectedOptions) => {
                      setActivity((state) => ({
                        ...state!,
                        dependencies: selectedOptions,
                      }));
                    }}
                    existingSelection={activity.dependencies}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={(value) =>
                    setActivity((state) => ({
                      ...state!,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={activity.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button onClick={updateTask}>Update</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UpdateActivityModal;
