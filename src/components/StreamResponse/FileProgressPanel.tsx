"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import MarkDownDisplay from "@/components/Markdown/MarkDownDisplay";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Throttle a rapidly changing value so the viewer only re-renders at most once per interval
function useThrottledValue<T>(value: T, intervalMs: number): T {
	const [throttled, setThrottled] = useState(value);
	const lastUpdateRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latestRef = useRef(value);
	latestRef.current = value;

	useEffect(() => {
		const now = Date.now();
		const elapsed = now - lastUpdateRef.current;

		if (elapsed >= intervalMs) {
			lastUpdateRef.current = now;
			setThrottled(value);
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		} else if (!timerRef.current) {
			timerRef.current = setTimeout(() => {
				lastUpdateRef.current = Date.now();
				setThrottled(latestRef.current);
				timerRef.current = null;
			}, intervalMs - elapsed);
		}
	}, [value, intervalMs]);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	return throttled;
}

const PANEL_THROTTLE_MS = 300;

// Map extension → Prism language identifier
const EXT_TO_LANGUAGE: Record<string, string> = {
	js: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx",
	html: "html", htm: "html", css: "css", scss: "scss", sass: "sass", less: "less",
	py: "python", rb: "ruby", java: "java", kt: "kotlin", kts: "kotlin",
	swift: "swift", go: "go", rs: "rust", c: "c", cpp: "cpp", cc: "cpp", cxx: "cpp",
	h: "c", hpp: "cpp", cs: "csharp", php: "php", pl: "perl", r: "r", scala: "scala",
	sh: "bash", bash: "bash", zsh: "bash", fish: "bash", ps1: "powershell",
	bat: "batch", cmd: "batch",
	json: "json", yaml: "yaml", yml: "yaml", toml: "toml", xml: "xml", ini: "ini",
	sql: "sql", graphql: "graphql", gql: "graphql",
	dockerfile: "docker", makefile: "makefile", lua: "lua", diff: "diff", patch: "diff",
};

const CODE_EXTENSIONS = new Set([
	"js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "h", "hpp", "cs", "go", "rs",
	"rb", "php", "swift", "kt", "kts", "html", "htm", "css", "scss", "sass", "less",
	"sql", "sh", "bash", "zsh", "lua", "scala", "r", "pl", "diff", "patch",
	"dockerfile", "makefile",
]);

const CONFIG_EXTENSIONS = new Set([
	"json", "jsonl", "toml", "ini", "env", "config", "yaml", "yml", "xml",
	"graphql", "gql",
]);

const MARKDOWN_EXTENSIONS = new Set(["md", "mdx", "markdown"]);

type FileViewerType = "code" | "markdown" | "text";

const getViewerType = (ext: string): FileViewerType => {
	const e = ext.toLowerCase();
	if (CODE_EXTENSIONS.has(e) || CONFIG_EXTENSIONS.has(e)) return "code";
	if (MARKDOWN_EXTENSIONS.has(e)) return "markdown";
	if (EXT_TO_LANGUAGE[e]) return "code";
	return "text";
};

const getExtension = (name: string): string => {
	const lastDot = name.lastIndexOf(".");
	if (lastDot > 0 && lastDot < name.length - 1) return name.slice(lastDot + 1).toLowerCase();
	return "";
};

const FileProgressPanel = ({ fileName, title }: { fileName: string; title?: string }): React.ReactNode => {
	const { fileProgress } = useChatStore();
	const contentRef = useRef<HTMLDivElement>(null);

	// Resolve the effective file entry and its real name
	const { effective, realFileName } = useMemo(() => {
		if (fileName === "file-progress") {
			const entries = Object.entries(fileProgress || {});
			if (entries.length === 0) return { effective: null, realFileName: title || "" };
			const [key, val] = entries.reduce(
				(a, b) => ((a[1] as any).lastUpdated > (b[1] as any).lastUpdated ? a : b)
			);
			return { effective: val, realFileName: title || key };
		}
		return { effective: fileProgress[fileName] || null, realFileName: title || fileName };
	}, [fileName, fileProgress, title]);

	if (!effective) {
		return (
			<div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
				Waiting for file content...
			</div>
		);
	}

	const rawContent = effective.content || "";
	const ext = getExtension(realFileName);
	const viewerType = getViewerType(ext);
	const language = EXT_TO_LANGUAGE[ext] || "text";

	// Throttle content updates during streaming to avoid expensive re-renders
	const content = useThrottledValue(rawContent, PANEL_THROTTLE_MS);

	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex-1 overflow-auto" ref={contentRef}>
				{viewerType === "code" && (
					<SyntaxHighlighter
						customStyle={{
							margin: 0,
							padding: "16px",
							fontSize: "13px",
							lineHeight: "1.6",
							background: "#fafafa",
							minHeight: "100%",
						}}
						language={language}
						showLineNumbers
						style={oneLight}
						wrapLines
						wrapLongLines
					>
						{content}
					</SyntaxHighlighter>
				)}
				{viewerType === "markdown" && (
					<div className="px-4">
						<MarkDownDisplay content={content} />
					</div>
				)}
				{viewerType === "text" && (
					<pre className="px-4 py-3 text-sm leading-relaxed text-gray-700 font-mono whitespace-pre-wrap break-words">
						{content}
					</pre>
				)}
			</div>
		</div>
	);
};

export default FileProgressPanel;
