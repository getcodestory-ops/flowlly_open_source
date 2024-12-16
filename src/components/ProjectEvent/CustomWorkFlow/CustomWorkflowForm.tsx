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

import { BasicMetadata } from "./components/BasicMetadata";
import { TriggerConfiguration } from "./components/TriggerConfiguration";
import { WorkflowNodes } from "./components/WorkflowNodes/WorkFlowNodes";
import { useWorkflowForm } from "./hooks/useWorkflowForm";
import { WorkflowFormData } from "./types";
import { GraphData } from "../../../../app/project/[projectId]/workbench/components/types";
import { Loader2 } from "lucide-react";

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

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6  ">
            {currentStep === 0 && (
              <BasicMetadata formData={formData} onChange={handleFormUpdate} />
            )}

            {currentStep === 1 && activeProject && (
              <TriggerConfiguration
                formData={formData}
                onChange={handleFormUpdate}
                members={members}
                activeProject={activeProject}
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
        </form>
      </Card>
    </ScrollArea>
  );
}
