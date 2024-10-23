import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  Cross2Icon,
  Pencil1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/utils/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { updateActivityRevision } from "@/api/schedule_routes";
import { useArchiveActivity } from "@/utils/useArchiveActivity";
import {
  ActivityEntity,
  Revision,
  UpdateActivityTypes,
} from "@/types/activities";
import { Input } from "@/components/ui/input";
import AddNewActivityModal from "../Schedule/AddNewActivityModal";
import { Textarea } from "@/components/ui/textarea";
import { updateActivity } from "@/api/activity_routes";

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

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

  const { mutate: updateActivityMutation } = useMutation({
    mutationFn: (activity: UpdateActivityTypes) => {
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

  const [editableModifications, setEditableModifications] = useState(
    (activity_modification || []).map((activity) => ({
      ...activity,
      isEditing: false,
      editedRevision: activity.revision ? { ...activity.revision } : null,
    }))
  );

  const handleEdit = (index: number) => {
    setEditableModifications((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              isEditing: !item.isEditing,
              revision: item.isEditing ? item.editedRevision : item.revision,
              editedRevision: item.revision ? { ...item.revision } : null,
            }
          : item
      )
    );
  };

  const handleInputChange = (
    index: number,
    field: keyof Revision,
    value: string | number
  ) => {
    setEditableModifications((prev) =>
      prev.map((item, i) =>
        i === index && item.editedRevision
          ? {
              ...item,
              editedRevision: {
                ...item.editedRevision,
                [field]: field.includes("impact") ? Number(value) : value,
              },
            }
          : item
      )
    );
  };

  const handleApprove = (activity: (typeof editableModifications)[0]) => {
    if (activity.id) {
      const currentRevision = activity.revision;
      // console.log(currentRevision, activity.editedRevision, activity.revision);
      if (currentRevision) {
        approveImpact.mutate({
          id: activity.id,
          revision: {
            impact_on_start_date: currentRevision.impact_on_start_date,
            impact_on_end_date: currentRevision.impact_on_end_date,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: ["activityList"] });
    }
  };

  const handleReject = (activity: (typeof editableModifications)[0]) => {
    if (activity.id) {
      approveImpact.mutate({
        id: activity.id,
        revision: {
          impact_on_start_date: 0,
          impact_on_end_date: 0,
        },
      });
    }
  };

  const [editableAdditions, setEditableAdditions] = useState(
    (activity_addition || []).map((activity) => ({
      ...activity,
      isEditing: false,
      isNew: false,
    }))
  );

  const handleAdditionEdit = (index: number) => {
    setEditableAdditions((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  };

  const handleAdditionInputChange = (
    index: number,
    field: keyof (typeof editableAdditions)[0],
    value: string
  ) => {
    setEditableAdditions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAdditionApprove = (activity: (typeof editableAdditions)[0]) => {
    // Implement the logic to approve the addition
    toast({
      title: "Approving addition",
      description: "Approving addition",
    });

    if (activity.id) {
      updateActivityMutation({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        start: activity.start,
        end: activity.end,
        status: "In Progress",
        duration: 0,
        active: true,
      });
    } else {
      toast({
        title: "Error approving addition",
        description: "Activity ID not found",
        variant: "destructive",
      });
    }
  };

  const handleAdditionReject = (activity: (typeof editableAdditions)[0]) => {
    // Implement the logic to reject the addition
    toast({
      title: "Rejecting addition",
      description: "Rejecting addition",
    });

    if (activity.id) {
      updateActivityMutation({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        start: activity.start,
        end: activity.end,
        status: "Not Started",
        duration: 0,
        active: false,
      });
    } else {
      toast({
        title: "Error rejecting addition",
        description: "Activity ID not found",
        variant: "destructive",
      });
    }
  };

  const handleAddNewActivity = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="font-normal">
      <Toaster />
      <AddNewActivityModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
      {editableAdditions.length > 0 && (
        <div className="my-4">
          <h2 className="m-2 text-xl font-bold">
            New activities to be added in schedule
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableAdditions.map((activity, index) => (
                <TableRow key={`addition-${index}`}>
                  <TableCell>
                    {activity.isEditing ? (
                      <Input
                        value={activity.name}
                        onChange={(e) =>
                          handleAdditionInputChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      activity.name
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.isEditing ? (
                      <Textarea
                        value={activity.description}
                        onChange={(e) =>
                          handleAdditionInputChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      activity.description
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.isEditing ? (
                      <Input
                        type="date"
                        value={activity.start}
                        onChange={(e) =>
                          handleAdditionInputChange(
                            index,
                            "start",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      activity.start
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.isEditing ? (
                      <Input
                        type="date"
                        value={activity.end}
                        onChange={(e) =>
                          handleAdditionInputChange(
                            index,
                            "end",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      activity.end
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAdditionEdit(index)}
                      >
                        {activity.isEditing ? (
                          <CheckIcon className="h-w w-4" />
                        ) : (
                          <Pencil1Icon className="h-w w-4" />
                        )}
                      </Button>
                      {!activity.isEditing && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAdditionApprove(activity)}
                          >
                            <CheckIcon className="h-w w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAdditionReject(activity)}
                          >
                            <Cross2Icon className="h-w w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNewActivity}
            className="mt-4"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Activity
          </Button>
        </div>
      )}

      {activity_deletion && activity_deletion.length > 0 && (
        <div className="my-8">
          <h2 className="m-2 text-xl font-bold">Activities to be deleted</h2>
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
                      <CheckIcon
                        className="h-w w-4"
                        // onClick={() => handleAdditionReject(activity)}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {activity_modification && activity_modification.length > 0 && (
        <div className="my-4">
          <h2 className="m-2 text-xl font-bold">
            Existing activities to be changed
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Impact on Start Date</TableHead>
                <TableHead>Impact on End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableModifications.map((activity, index) => (
                <TableRow key={`modification-${index}`}>
                  {activity.revision && (
                    <>
                      <TableCell>
                        {activity.isEditing ? (
                          <Input
                            value={activity.editedRevision?.name || ""}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "name" as keyof Revision,
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          activity.revision.name
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.isEditing ? (
                          <Textarea
                            value={activity.editedRevision?.reason || ""}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "reason" as keyof Revision,
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          activity.revision.reason
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.isEditing ? (
                          <Input
                            type="number"
                            value={
                              activity.editedRevision?.impact_on_start_date || 0
                            }
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "impact_on_start_date",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          activity.revision.impact_on_start_date
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.isEditing ? (
                          <Input
                            type="number"
                            value={
                              activity.editedRevision?.impact_on_end_date || 0
                            }
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "impact_on_end_date",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          activity.revision.impact_on_end_date
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(index)}
                          >
                            {activity.isEditing ? (
                              <CheckIcon className="h-w w-4" />
                            ) : (
                              <Pencil1Icon className="h-w w-4" />
                            )}
                          </Button>
                          {!activity.isEditing && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleApprove(activity)}
                              >
                                <CheckIcon className="h-w w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleReject(activity)}
                              >
                                <Cross2Icon className="h-w w-4" />
                              </Button>
                            </>
                          )}
                        </div>
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
