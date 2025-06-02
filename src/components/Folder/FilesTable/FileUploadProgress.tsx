import React from "react";
import {
	X,
	CheckCircle,
	AlertCircle,
	Loader2,
	Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadStatus } from "./types";

interface FileUploadProgressProps {
  files: FileUploadStatus[];
  onClose: () => void;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
	files,
	onClose,
}) => {
	const allCompleted = files.every(
		(file) => file.status === "success" || file.status === "error",
	);

	const successCount = files.filter((file) => file.status === "success").length;
	const errorCount = files.filter((file) => file.status === "error").length;
	const pendingCount = files.filter(
		(file) => file.status === "pending" || file.status === "uploading",
	).length;
	const processingCount = files.filter(
		(file) => file.status === "processing",
	).length;

	// Calculate overall progress
	const totalProgress =
    files.reduce((acc, file) => acc + file.progress, 0) / files.length;

	return (
		<div className="fixed bottom-4 left-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
			<div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
				<div className="flex items-center gap-2">
					<Upload className="text-blue-500" size={16} />
					<span className="font-medium">File Upload</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-500">
						{successCount}/{files.length} completed
					</span>
					<Button
						className="h-6 w-6 p-0"
						disabled={!allCompleted}
						onClick={onClose}
						size="sm"
						variant="ghost"
					>
						<X size={16} />
					</Button>
				</div>
			</div>
			{/* Overall progress bar */}
			<div className="w-full bg-gray-100 h-1">
				<div
					className="h-1 bg-blue-500 transition-all duration-300 ease-in-out"
					style={{ width: `${totalProgress}%` }}
				/>
			</div>
			<div className="max-h-60 overflow-y-auto p-2">
				{files.map((file, index) => (
					<div
						className="py-2 px-1 border-b border-gray-100 last:border-0"
						key={index}
					>
						<div className="flex justify-between items-center mb-1">
							<div className="flex items-center gap-2">
								<div className="w-5 h-5 flex-shrink-0">
									{file.status === "uploading" && (
										<Loader2 className="animate-spin text-blue-500" size={16} />
									)}
									{file.status === "processing" && (
										<Loader2
											className="animate-spin text-amber-500"
											size={16}
										/>
									)}
									{file.status === "success" && (
										<CheckCircle className="text-green-500" size={16} />
									)}
									{file.status === "error" && (
										<AlertCircle className="text-red-500" size={16} />
									)}
									{file.status === "pending" && (
										<div className="w-2 h-2 bg-gray-300 rounded-full" />
									)}
								</div>
								<span
									className="text-sm truncate max-w-[180px]"
									title={file.file.name}
								>
									{file.file.name}
								</span>
							</div>
							<span className="text-xs text-gray-500">
								{file.status === "success"
									? "100%"
									: file.status === "error"
										? "Failed"
										: file.status === "processing"
											? "Processing"
											: file.status === "uploading"
												? `${file.progress}%`
												: "Pending"}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1.5">
							<div
								className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
									file.status === "success"
										? "bg-green-500"
										: file.status === "error"
											? "bg-red-500"
											: file.status === "processing"
												? "bg-amber-500"
												: "bg-blue-500"
								}`}
								style={{ width: `${file.progress}%` }}
							/>
						</div>
						{/* Show processing message if file is being processed */}
						{file.status === "processing" && (
							<div className="mt-1 text-xs text-amber-600">
                Document processing in progress...
							</div>
						)}
						{/* Show error message if there is one */}
						{file.status === "error" && file.error && (
							<div className="mt-1 text-xs text-red-600">{file.error}</div>
						)}
					</div>
				))}
			</div>
			<div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
				<div className="flex items-center gap-2 text-sm">
					{successCount > 0 && (
						<span className="text-green-500">{successCount} successful</span>
					)}
					{errorCount > 0 && (
						<span className="text-red-500">{errorCount} failed</span>
					)}
					{pendingCount > 0 && (
						<span className="text-blue-500">{pendingCount} pending</span>
					)}
					{processingCount > 0 && (
						<span className="text-amber-500">{processingCount} processing</span>
					)}
				</div>
				<Button
					disabled={!allCompleted}
					onClick={onClose}
					size="sm"
					variant={allCompleted ? "outline" : "default"}
				>
					{allCompleted
						? "Close"
						: processingCount > 0
							? "Processing..."
							: "Uploading..."}
				</Button>
			</div>
		</div>
	);
}; 