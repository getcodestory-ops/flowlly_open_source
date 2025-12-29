import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getcontainerEntities } from "@/api/documentRoutes";
import { StorageEntity, ContainerResources } from "@/types/document";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export const FilePreview: React.FC<{ resource: ContainerResources }> = ({
	resource,
}) => {
	const { file_name, metadata, url, created_at } =
    resource.storage_resources || {};
	const fileExt = metadata?.extension?.toLowerCase()?.replace(/^\./, "") || "";
	const config = getFileConfig(fileExt);
	const [hover, setHover] = useState(false);

	const formattedDate = created_at
		? new Date(created_at).toLocaleDateString()
		: "";

	const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(fileExt);
	const isVideo = ["mp4", "webm", "mov", "avi"].includes(fileExt);
	const isAudio = ["mp3", "ogg", "wav", "flac", "aac"].includes(fileExt);

	const renderPreview = () => {
		if (isImage) {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<div className="relative overflow-hidden rounded-lg h-48 cursor-pointer group">
							<img
								alt={file_name}
								className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
								src={url}
							/>
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
						</div>
					</DialogTrigger>
					<DialogContent
						aria-describedby="file viewer"
						className="sm:max-w-[600px]"
					>
						<img alt={file_name} className="w-full rounded-lg" src={url} />
					</DialogContent>
				</Dialog>
			);
		}
		
		if (isVideo) {
			return (
				<AspectRatio ratio={16 / 9}>
					<video className="rounded-lg" controls>
						<source src={url} type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				</AspectRatio>
			);
		}
		
		if (isAudio) {
			return (
				<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-48">
					<div className={cn(
						"flex items-center justify-center w-16 h-16 rounded-xl mb-4",
						config.bg, config.color
					)}>
						<FileIconSvg className="h-10 w-10" iconKey={config.iconKey} />
					</div>
					<audio
						className="w-full max-w-[280px]"
						controls
						src={url}
					>
						Your browser does not support the audio element.
					</audio>
				</div>
			);
		}
		
		// Default: show file icon
		return (
			<div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-48">
				<div className={cn(
					"flex items-center justify-center w-16 h-16 rounded-xl",
					config.bg, config.color
				)}>
					<FileIconSvg className="h-10 w-10" iconKey={config.iconKey} />
				</div>
			</div>
		);
	};

	return (
		<div
			className="group relative"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<div className="overflow-hidden rounded-t-xl">{renderPreview()}</div>
			<div className="p-3 bg-white border-t">
				<div className="flex items-center gap-2">
					<div className={cn(
						"flex-shrink-0 flex items-center justify-center w-6 h-6 rounded",
						config.bg, config.color
					)}>
						<FileIconSvg className="h-4 w-4" iconKey={config.iconKey} />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium truncate">{file_name}</p>
						<div className="flex items-center gap-2">
							<span className={cn("text-[10px] font-semibold uppercase", config.color)}>
								{fileExt}
							</span>
							{formattedDate && (
								<span className="text-xs text-gray-400">{formattedDate}</span>
							)}
						</div>
					</div>
					<ArrowUpRight className={cn(
						"h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
						config.color.replace("-600", "-400")
					)} />
				</div>
			</div>
		</div>
	);
};

const DocumentEntityViewer: React.FC = () => {
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	const { data, isLoading } = useQuery<StorageEntity[]>({
		queryKey: ["mediaDocumentList", session, activeProject],
		queryFn: () => {
			if (!session || !activeProject?.project_id)
				return Promise.reject("no session or project");
			return getcontainerEntities(session, activeProject.project_id, "media");
		},
		enabled: !!session?.access_token && !!activeProject?.project_id,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
			</div>
		);
	}
	
	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-gray-500">
				<div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
					<FileIconSvg className="h-8 w-8 text-gray-400" iconKey="image" />
				</div>
				<p className="text-lg font-medium">No media files found</p>
				<p className="text-sm text-gray-400">Upload some files to see them here</p>
			</div>
		);
	}

	return (
		<div className="h-full">
			<div className="flex flex-col">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h2 className="text-2xl font-semibold tracking-tight">
							Media Files
						</h2>
						<p className="text-sm text-muted-foreground">
							{data.reduce((acc, entity) => acc + entity.storage_relations.length, 0)} files in project
						</p>
					</div>
				</div>
				<Separator className="my-4" />
				<ScrollArea className="h-[calc(100vh-200px)]">
					<div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{data.flatMap((entity) =>
							entity.storage_relations.map((resource, index) => (
								<Card
									className="overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
									key={`${entity.id}-${index}`}
								>
									<CardContent className="p-0">
										<FilePreview resource={resource} />
									</CardContent>
								</Card>
							)),
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default DocumentEntityViewer;
