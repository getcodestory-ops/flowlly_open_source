"use client";
import PlatformChatInterface from "./PlatformChatInterface";
import { useState } from "react";
import clsx from "clsx";

export default function PlatformChatComponent({
	chatTarget,
	folderId,
	onContentUpdate,
	heightOffset,
}: {
  folderId: string;
  chatTarget:
    | "workflow"
    | "editor"
    | "schedule"
    | "project"
    | "agent"
    | "folder";
  onContentUpdate?: (newContent: string) => void;
  heightOffset?: number;
}): React.ReactNode {
	const [selectedModel] = useState<string>("claude-sonnet-4");
	const [includeContext] = useState<boolean>(false);

	return (
		<div className="mx-auto h-full">
			<div
				className={clsx(
					"bg-white rounded-xl shadow-sm overflow-hidden",
					heightOffset==20 ? "h-[calc(100vh-20px)]" : "h-[calc(100vh-75px)]",
				)}
			>
				<PlatformChatInterface
					chatTarget={chatTarget}
					folderId={folderId}
					includeContext={includeContext}
					onContentUpdate={onContentUpdate}
				/>
			</div>
		</div>
	);
}
