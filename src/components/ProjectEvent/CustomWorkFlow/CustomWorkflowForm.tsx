"use client";

import { useState } from "react";
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

import { BasicMetadata } from "./components/BasicMetadata";
import { TriggerConfiguration } from "./components/TriggerConfiguration";
import { WorkflowNodes } from "./components/WorkflowNodes/WorkFlowNodes";
import { useWorkflowForm } from "./hooks/useWorkflowForm";
import { WorkflowFormData } from "./types";
import { GraphData } from "../../../../app/project/[projectId]/workbench/components/types";

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
  } = useWorkflowForm({ session, activeProject, members });

  const handleFormUpdate = (updates: Partial<WorkflowFormData>) => {
    updateFormData(updates);
  };

  return (
    <ScrollArea className="w-full h-full">
      <Card
        className={`w-full ${currentStep < 2 ? "max-w-2xl" : "w-full"} mx-auto`}
      >
        <CardHeader>
          <CardTitle>Create Custom Workflow</CardTitle>
          <span className="text-sm mt-2 font-thin ">
            {new Date().toLocaleTimeString()} {formData.timeZone}
          </span>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6  ">
            {currentStep === 0 && (
              <BasicMetadata formData={formData} onChange={handleFormUpdate} />
            )}

            {currentStep === 1 && (
              <TriggerConfiguration
                formData={formData}
                onChange={handleFormUpdate}
                members={members}
              />
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
                type="submit"
                disabled={!formData.nodes.length}
                onClick={handleSubmit}
              >
                Save Workflow
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </ScrollArea>
  );
}
