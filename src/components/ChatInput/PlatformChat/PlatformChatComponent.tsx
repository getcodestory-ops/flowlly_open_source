"use client";
import PlatformChatInterface from "./PlatformChatInterface";
import clsx from "clsx";
import { usePathname } from "next/navigation";

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
	const includeContext = false;
	const pathname = usePathname();
	
	// Check if we're in the meetings context
	const isInMeetingsContext = pathname?.endsWith("/meetings") || false;

	return (
		<div className="mx-auto h-full">
			<div
				className={clsx(
					"bg-white rounded-xl shadow-sm overflow-hidden",
					isInMeetingsContext 
						? (heightOffset==20 ? "h-[calc(100vh-40px)]" : "h-[calc(100vh-95px)]")
						: (heightOffset==20 ? "h-[calc(100vh-20px)]" : "h-[calc(100vh-75px)]"),
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
