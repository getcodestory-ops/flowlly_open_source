"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateNewActivity } from "@/types/activities";
import { useCSVUploader } from "./useCsvUpload";
import { Upload, Loader2 } from "lucide-react";

export default function CSVUploader() {
  const {
    fileRef,
    isModalOpen,
    unmatchedHeaders,
    csvHeaders,
    headerMappings,
    isPending,
    selectedFile,
    setSelectedFile,
    handleHeaderMappingChange,
    handleCsvFileHeaderCheck,
    setModalOpen,
    handleUpload,
  } = useCSVUploader();

  return (
    <div className="flex flex-col">
      <div className="relative flex items-center justify-center border rounded-lg cursor-pointer hover:bg-primary hover:text-primary-foreground">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center px-2">
              <Upload className="w-4 h-4" />
              <Input
                type="file"
                accept=".csv"
                ref={fileRef}
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload CSV file</p>
          </TooltipContent>
        </Tooltip>
        {selectedFile !== null && (
          <Button
            onClick={handleCsvFileHeaderCheck}
            size="sm"
            className="bg-accent text-accent-foreground"
          >
            Process
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPending
                ? "Processing"
                : "We did not find corresponding headers, please match them manually"}
            </DialogTitle>
          </DialogHeader>
          {!isPending && (
            <>
              <div className="space-y-4">
                {unmatchedHeaders.map((header, index) => (
                  <div
                    key={`${header}-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <span>{header}</span>
                    <Select
                      value={headerMappings[header] || ""}
                      onValueChange={(value) =>
                        handleHeaderMappingChange(
                          header,
                          value as keyof CreateNewActivity
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select corresponding header" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvHeaders.map((key, index) => (
                          <SelectItem key={`${key}-${index}`} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={handleUpload}>Upload</Button>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
          {isPending && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
