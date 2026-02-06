"use client";

import React, { useMemo, useRef } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";

const FileProgressPanel = ({ fileName }: { fileName: string }): React.ReactNode => {
	const { fileProgress } = useChatStore();
	const contentRef = useRef<HTMLDivElement>(null);

	// If we are using a consolidated tab id, pick the most recently updated file
	const effective = useMemo(() => {
		if (fileName === "file-progress") {
			const entries = Object.values(fileProgress || {});
			if (entries.length === 0) return null;
			return entries.reduce((a: any, b: any) => (a.lastUpdated > b.lastUpdated ? a : b));
		}
		return fileProgress[fileName] || null;
	}, [fileName, fileProgress]);

	// Auto-scroll disabled - let user control scroll position while content streams

	if (!effective) {
		return (
			<div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
				Waiting for file content...
			</div>
		);
	}

	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex-1 overflow-auto px-4" ref={contentRef}>
				<MarkDownDisplay content={effective.content || ""} />
			</div>
		</div>
	);
};

export default FileProgressPanel;
