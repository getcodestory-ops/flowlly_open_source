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
								accept=".csv"
								className="absolute inset-0 opacity-0 cursor-pointer"
								onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
								ref={fileRef}
								type="file"
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>Upload CSV file</p>
					</TooltipContent>
				</Tooltip>
				{selectedFile !== null && (
					<Button
						className="bg-accent text-accent-foreground"
						onClick={handleCsvFileHeaderCheck}
						size="sm"
					>
            Process
					</Button>
				)}
			</div>
			<Dialog onOpenChange={setModalOpen} open={isModalOpen}>
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
										className="flex items-center space-x-2"
										key={`${header}-${index}`}
									>
										<span>{header}</span>
										<Select
											onValueChange={(value) =>
												handleHeaderMappingChange(
													header,
                          value as keyof CreateNewActivity,
												)
											}
											value={headerMappings[header] || ""}
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
								<Button onClick={() => setModalOpen(false)} variant="outline">
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
