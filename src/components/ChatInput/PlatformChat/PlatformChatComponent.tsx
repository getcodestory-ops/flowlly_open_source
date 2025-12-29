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

	// Calculate the actual offset based on context
	const actualOffset = heightOffset ?? 20;
	const meetingsExtraOffset = isInMeetingsContext ? 20 : 0;
	const totalOffset = actualOffset + meetingsExtraOffset;

	return (
		<div className="mx-auto h-full">
			<div
				className="bg-white rounded-xl shadow-sm overflow-hidden"
				style={{ height: `calc(100vh - ${totalOffset}px)` }}
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
