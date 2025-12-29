import { StorageResourceEntity } from "@/types/document";
import { Download } from "lucide-react";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "@/components/DocumentEditor/useStorageTextSave";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MediaDialogContentProps {
  resource: StorageResourceEntity;
}

export const MediaDialogContent = ({
	resource,
}: MediaDialogContentProps) : React.ReactNode => {
	const { file_name, metadata, url } = resource || {};
	const description = metadata?.description;
	const rawExt = metadata?.extension?.toLowerCase() || "";
	const fileExt = rawExt.replace(/^\./, "");
	const config = getFileConfig(fileExt);
	const { onSubmit } = useStorageTextFileSave(resource?.id);

	const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "tiff", "tif"].includes(fileExt);
	const isVideo = ["mp4", "webm", "mov", "avi"].includes(fileExt);
	const isAudio = ["mp3", "ogg", "wav", "flac", "aac", "oga"].includes(fileExt);
	const isText = fileExt === "txt";
	const isPdf = fileExt === "pdf";
	const isCsv = fileExt === "csv";

	if (isImage) {
		return (
			<>
				<img
					alt={file_name}
					className="rounded-lg object-cover max-h-[70vh] w-full"
					src={url}
				/>
				<DescriptionContent description={description} />
			</>
		);
	}
	
	if (isVideo) {
		return (
			<>
				<div className="max-h-[70vh] overflow-hidden rounded-lg bg-black">
					<video className="w-full h-full" controls>
						<source src={url} type="video/mp4" />
						Your browser does not support the video tag
					</video>
				</div>
				<DescriptionContent description={description} />
			</>
		);
	}
	
	if (isAudio) {
		return (
			<>
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
				<DescriptionContent description={description} />
			</>
		);
	}
	
	if (isText) {
		return (
			<ContentEditor content={metadata?.content} saveFunction={onSubmit} />
		);
	}
	
	if (isPdf || isCsv) {
		const label = isPdf ? "PDF" : "CSV";
		return (
			<>
				<div className="flex flex-col items-center p-6">
					<div className={cn(
						"flex items-center justify-center w-16 h-16 rounded-xl mb-4",
						config.bg, config.color
					)}>
						<FileIconSvg className="h-10 w-10" iconKey={config.iconKey} />
					</div>
					<p className="text-lg font-medium mb-2">{file_name}</p>
					<Button
						asChild
						className="mb-4"
						variant="outline"
					>
						<a download={file_name} href={url}>
							<Download className="mr-2 h-4 w-4" />
							Download {label}
						</a>
					</Button>
					<div className="w-full max-w-3xl h-96 border border-gray-200 rounded-lg overflow-hidden">
						<iframe
							className="w-full h-full"
							src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
							title={`${label} Viewer`}
						/>
					</div>
				</div>
				<DescriptionContent description={description} />
			</>
		);
	}
	
	// Default view for unsupported file types
	return (
		<>
			<div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
				<div className={cn(
					"flex items-center justify-center w-16 h-16 rounded-xl mb-4",
					config.bg, config.color
				)}>
					<FileIconSvg className="h-10 w-10" iconKey={config.iconKey} />
				</div>
				<p className="text-lg font-medium text-gray-700">{file_name}</p>
				<p className="text-sm text-gray-500 mb-4">
					<span className={cn("font-semibold uppercase", config.color)}>{fileExt}</span>
					{" · Preview not available"}
				</p>
				{url && (
					<Button asChild variant="outline">
						<a download={file_name} href={url}>
							<Download className="mr-2 h-4 w-4" />
							Download File
						</a>
					</Button>
				)}
			</div>
			<DescriptionContent description={description} />
		</>
	);
};

const DescriptionContent = ({ description }: { description: string }): React.ReactNode => {
	return (
		<div className="rounded-lg p-2 bg-white max-h-96 overflow-auto">
			<div className="space-y-1 text-sm">
				<p className="text-sm ">{description}</p>
			</div>
		</div>
	);
};
