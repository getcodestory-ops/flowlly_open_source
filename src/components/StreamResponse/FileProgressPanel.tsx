"use client";

import React, { useEffect, useRef } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";

const FileProgressPanel = ({ fileName }: { fileName: string }): React.ReactNode => {
	const { fileProgress } = useChatStore();
	const progress = fileProgress[fileName];
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!contentRef.current) return;
		contentRef.current.scrollTop = contentRef.current.scrollHeight;
	}, [progress?.content]);

	if (!progress) {
		return (
			<div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
				Waiting for file content...
			</div>
		);
	}

	return (
		<div className="h-full w-full flex flex-col">
			<div className="px-4 py-3 border-b bg-white">
				<div className="text-sm font-semibold truncate">{progress.fileName}</div>
				<div className="text-xs text-gray-500">{progress.action} • {progress.status}</div>
			</div>
			<div className="flex-1 overflow-auto p-4">
				{progress.action === "create" ? (
					<div ref={contentRef as any}>
						<MarkDownDisplay content={progress.content || ""} />
					</div>
				) : (
					<div className="prose max-w-none whitespace-pre-wrap" ref={contentRef as any}>
						{progress.content || ""}
					</div>
				)}
			</div>
		</div>
	);
};

export default FileProgressPanel;
