import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/utils/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  getScheduleRevisions,
  updateActivityRevision,
  rejectRevision,
  getScheduleRevisionsById,
} from "@/api/schedule_routes";
import { useArchiveActivity } from "@/utils/useArchiveActivity";
import { Revision } from "@/types/activities";

interface ActionItemInterface {
  results: Array<{
    activity_addition: Array<{
      id: string;
      name: string;
      end: string;
      start: string;
      description: string;
    }>;
    activity_deletion: Array<{ name: string }>;
    activity_modification: Array<{
      id: string;
      status: string;
      revision: {
        name: string;
        reason: string;
        impact_on_start_date: number;
        impact_on_end_date: number;
      } | null;
    }>;
  }>;
}

function ActionItemViewer({ results }: ActionItemInterface) {
  const { toast } = useToast();
  const handleActivityArchive = useArchiveActivity();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const queryClient = useQueryClient();
  const { activity_addition, activity_deletion, activity_modification } =
    results[0];

  const approveImpact = useMutation({
    mutationFn: (revision: { id: string; revision: Revision }) => {
      if (!session?.access_token || !activeProject) {
        return Promise.reject("No active project or session");
      }
      return updateActivityRevision(
        session,
        activeProject.project_id,
        revision
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduleRevision"] });
      toast({
        title: "Success",
        description: "Revision Updated",
        duration: 9000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        duration: 9000,
      });
    },
  });

  return (
    <div className="font-normal">
      <Toaster />
      {activity_addition && activity_addition.length > 0 && (
        <div className="my-4">
          <h2 className="text-center m-2 text-xl">
            New activities to be added in schedule{" "}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity_addition.map((activity, index) => (
                <TableRow key={`addition-${index}`}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.start}</TableCell>
                  <TableCell>{activity.end}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon">
                      <Cross2Icon
                        className="h-w w-4"
                        onClick={() => handleActivityArchive(activity.id)}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activity_deletion && activity_deletion.length > 0 && (
        <div className="my-4">
          <h2 className="text-center m-2 text-xl">Activity Additions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Approve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity_deletion.map((activity, index) => (
                <TableRow key={`deletion-${index}`}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon">
                      <CheckIcon className="h-w w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activity_modification && activity_modification.length && (
        <div className="my-4">
          <h2 className="text-center m-2 text-xl">
            {" "}
            Existing activities to be changed
          </h2>
          <Table>
            {/* <TableCaption>Activity Modifications</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Impact on Start Date</TableHead>
                <TableHead>Impact on End Date</TableHead>
                <TableHead>Approve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity_modification.map((activity, index) => (
                <TableRow key={`modification-${index}`}>
                  {activity.revision && (
                    <>
                      <TableCell>{activity.revision.name}</TableCell>
                      <TableCell>{activity.revision.reason}</TableCell>
                      <TableCell>
                        {activity.revision.impact_on_start_date}
                      </TableCell>
                      <TableCell>
                        {activity.revision.impact_on_end_date}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon">
                          <CheckIcon
                            className="h-w w-4"
                            onClick={() => {
                              if (activity.id && activity.revision) {
                                approveImpact.mutate({
                                  id: activity.id,
                                  revision: {
                                    impact_on_start_date:
                                      activity.revision?.impact_on_start_date ??
                                      0,
                                    impact_on_end_date:
                                      activity.revision?.impact_on_end_date ??
                                      0,
                                  },
                                });
                              }
                            }}
                          />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default ActionItemViewer;
