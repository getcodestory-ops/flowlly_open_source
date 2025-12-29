import React, { useState } from "react";
import { StorageResourceEntity } from "@/types/document";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "../DocumentEditor/useStorageTextSave";
import { useDocumentTracer } from "./useDocumentTracer";
import { useStore } from "@/utils/store";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowUpRight, ExternalLink } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const MediaViewer: React.FC<{ resource: StorageResourceEntity }> = ({
	resource,
}) => {
	const { file_name, metadata, url, created_at } = resource || {};
	const rawExt = metadata?.extension?.toLowerCase() || "";
	const fileExt = rawExt.replace(/^\./, ""); // Clean extension
	const config = getFileConfig(fileExt);
	const { onSubmit, isPending } = useStorageTextFileSave(resource?.id);
	const traces = useDocumentTracer(resource?.id);
	
	// Get active project for comment API calls
	const { activeProject } = useStore();

	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState(1);

	const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "tiff", "tif"].includes(fileExt);
	const isVideo = ["mp4", "webm", "mov", "avi"].includes(fileExt);
	const isAudio = ["mp3", "ogg", "wav", "flac", "aac", "oga"].includes(fileExt);
	const isPdf = fileExt === "pdf";
	const isText = fileExt === "txt";

	const renderPreview = () => {
		if (isImage) {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<div className="group relative max-h-96 overflow-hidden rounded-xl cursor-pointer">
							<img
								alt={file_name}
								className="object-cover w-full transition-transform duration-200 group-hover:scale-105"
								src={url}
							/>
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
								<ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
							</div>
						</div>
					</DialogTrigger>
					<DialogContent className="max-w-3xl" title={file_name || "Image preview"}>
						<img alt={file_name} className="w-full rounded-lg" src={url} />
					</DialogContent>
				</Dialog>
			);
		}
		
		if (isVideo) {
			return (
				<div className="overflow-hidden rounded-xl bg-black">
					<AspectRatio ratio={16 / 9}>
						<video className="w-full h-full" controls>
							<source src={url} type="video/mp4" />
							Your browser does not support the video tag
						</video>
					</AspectRatio>
				</div>
			);
		}
		
		if (isAudio) {
			return (
				<div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
					<div className={cn(
						"flex items-center justify-center w-20 h-20 rounded-2xl mb-6",
						config.bg, config.color
					)}>
						<FileIconSvg className="h-12 w-12" iconKey={config.iconKey} />
					</div>
					<p className="text-sm font-medium text-gray-700 mb-4">{file_name}</p>
					<audio
						className="w-full max-w-md"
						controls
						src={url}
					>
						Your browser does not support the audio element.
					</audio>
				</div>
			);
		}

		if (isText) {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<button className="group w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer">
							<div className={cn(
								"flex items-center justify-center w-12 h-12 rounded-lg transition-transform group-hover:scale-105",
								config.bg, config.color
							)}>
								<FileIconSvg className="h-7 w-7" iconKey={config.iconKey} />
							</div>
							<div className="flex-1 text-left">
								<p className="font-medium text-gray-800">{file_name}</p>
								<p className="text-sm text-gray-500">Click to view and edit</p>
							</div>
							<ArrowUpRight className={cn("h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity", config.color)} />
						</button>
					</DialogTrigger>
					<DialogContent className="max-w-6xl" title={file_name || "Edit Text Document"}>
						<ContentEditor
							content={metadata?.content}
							documentId={resource?.id}
							projectAccessId={activeProject?.project_id}
							saveFunction={onSubmit}
							showComments
						/>
					</DialogContent>
				</Dialog>
			);
		}
		
		if (isPdf) {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<button className="group w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer">
							<div className={cn(
								"flex items-center justify-center w-12 h-12 rounded-lg transition-transform group-hover:scale-105",
								config.bg, config.color
							)}>
								<FileIconSvg className="h-7 w-7" iconKey={config.iconKey} />
							</div>
							<div className="flex-1 text-left">
								<p className="font-medium text-gray-800">{file_name}</p>
								<p className="text-sm text-gray-500">Click to view PDF</p>
							</div>
							<ArrowUpRight className={cn("h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity", config.color)} />
						</button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" title={file_name || "PDF preview"}>
						<Document
							file={url}
							onLoadSuccess={({ numPages }) => setNumPages(numPages)}
						>
							<Page pageNumber={pageNumber} />
						</Document>
						<div className="flex justify-between items-center mt-4 px-4">
							<Button
								disabled={pageNumber <= 1}
								onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
								size="sm"
								variant="outline"
							>
								<ChevronLeft className="h-4 w-4 mr-1" />
								Previous
							</Button>
							<span className="text-sm text-gray-600">
								Page {pageNumber} of {numPages}
							</span>
							<Button
								disabled={pageNumber >= (numPages || 1)}
								onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))}
								size="sm"
								variant="outline"
							>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			);
		}
		
		// Default: show styled file card
		return (
			<div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
				<div className={cn(
					"flex items-center justify-center w-12 h-12 rounded-lg",
					config.bg, config.color
				)}>
					<FileIconSvg className="h-7 w-7" iconKey={config.iconKey} />
				</div>
				<div className="flex-1">
					<p className="font-medium text-gray-800">{file_name}</p>
					<p className="text-sm text-gray-500">
						<span className={cn("font-semibold uppercase", config.color)}>{fileExt}</span>
						{" · No preview available"}
					</p>
				</div>
			</div>
		);
	};

	return (
		<div>
			<div>{renderPreview()}</div>
			{metadata?.description && (
				<div className="rounded-lg p-2 bg-white max-h-96 overflow-auto">
					<div className="space-y-1 text-sm">
						<p className="text-xs ">{metadata?.description}</p>
					</div>
				</div>
			)}
		</div>
	);
};
