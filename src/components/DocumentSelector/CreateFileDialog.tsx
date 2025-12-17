import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FilePlus, Loader2 } from "lucide-react";

interface FileTypeOption {
	value: string;
	label: string;
	extension: string;
	description: string;
}

const FILE_TYPES: FileTypeOption[] = [
	{ value: "txt", label: "Text File", extension: ".txt", description: "Plain text file" },
	{ value: "md", label: "Markdown", extension: ".md", description: "Markdown document" },
	{ value: "csv", label: "CSV", extension: ".csv", description: "Comma-separated values" },
	{ value: "xlsx", label: "Excel", extension: ".xlsx", description: "Excel spreadsheet" },
	{ value: "docx", label: "Word", extension: ".docx", description: "Word document" },
	{ value: "pptx", label: "PowerPoint", extension: ".pptx", description: "PowerPoint presentation" },
];

interface CreateFileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (fileName: string) => void;
	isCreating?: boolean;
}

export const CreateFileDialog: React.FC<CreateFileDialogProps> = ({
	open,
	onOpenChange,
	onConfirm,
	isCreating = false,
}) => {
	const [fileName, setFileName] = useState("");
	const [fileType, setFileType] = useState("txt");

	useEffect(() => {
		if (open) {
			setFileName("");
			setFileType("txt");
		}
	}, [open]);

	const selectedType = FILE_TYPES.find(t => t.value === fileType) || FILE_TYPES[0];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = fileName.trim();
		if (trimmedName) {
			// Remove any existing extension and add the selected one
			const nameWithoutExt = trimmedName.replace(/\.[^/.]+$/, "");
			const finalName = `${nameWithoutExt}${selectedType.extension}`;
			onConfirm(finalName);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FilePlus className="h-5 w-5" />
						Create New File
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						{/* File Type Selection */}
						<div className="space-y-2">
							<Label htmlFor="fileType" className="text-sm font-medium">
								File type
							</Label>
							<Select
								value={fileType}
								onValueChange={setFileType}
								disabled={isCreating}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select file type" />
								</SelectTrigger>
								<SelectContent>
									{FILE_TYPES.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											<div className="flex items-center gap-2">
												<span className="font-medium">{type.label}</span>
												<span className="text-xs text-gray-400">({type.extension})</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-gray-500">
								{selectedType.description}
							</p>
						</div>

						{/* File Name Input */}
						<div className="space-y-2">
							<Label htmlFor="fileName" className="text-sm font-medium">
								File name
							</Label>
							<div className="flex items-center gap-2">
								<Input
									id="fileName"
									placeholder="Enter file name"
									value={fileName}
									onChange={(e) => setFileName(e.target.value)}
									autoFocus
									disabled={isCreating}
									className="flex-1"
								/>
								<span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1.5 rounded">
									{selectedType.extension}
								</span>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!fileName.trim() || isCreating}
						>
							{isCreating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<FilePlus className="mr-2 h-4 w-4" />
									Create {selectedType.label}
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
