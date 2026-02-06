"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import FloatingSaveIndicator from "./FloatingSaveIndicator";

interface CodeEditorProps {
	content: string;
	documentName?: string;
	isSaving?: boolean;
	onSave?: (updated: string) => void;
}

// Map file extensions to Prism language identifiers
const getLanguageFromFileName = (fileName: string | undefined): string => {
	if (!fileName) return "text";

	const ext = fileName.split(".").pop()?.toLowerCase();

	const languageMap: Record<string, string> = {
		// Web
		js: "javascript",
		jsx: "jsx",
		ts: "typescript",
		tsx: "tsx",
		html: "html",
		htm: "html",
		css: "css",
		scss: "scss",
		sass: "sass",
		less: "less",
		// Programming languages
		py: "python",
		rb: "ruby",
		java: "java",
		kt: "kotlin",
		kts: "kotlin",
		swift: "swift",
		go: "go",
		rs: "rust",
		c: "c",
		cpp: "cpp",
		cc: "cpp",
		cxx: "cpp",
		h: "c",
		hpp: "cpp",
		cs: "csharp",
		php: "php",
		pl: "perl",
		r: "r",
		scala: "scala",
		// Shell/Scripts
		sh: "bash",
		bash: "bash",
		zsh: "bash",
		fish: "bash",
		ps1: "powershell",
		bat: "batch",
		cmd: "batch",
		// Data/Config
		json: "json",
		yaml: "yaml",
		yml: "yaml",
		toml: "toml",
		xml: "xml",
		ini: "ini",
		env: "bash",
		// Markup
		md: "markdown",
		markdown: "markdown",
		tex: "latex",
		// Database
		sql: "sql",
		graphql: "graphql",
		gql: "graphql",
		// Other
		dockerfile: "docker",
		makefile: "makefile",
		lua: "lua",
		vim: "vim",
		diff: "diff",
		patch: "diff",
	};

	return languageMap[ext || ""] || "text";
};

const CodeEditor: React.FC<CodeEditorProps> = ({
	content,
	documentName,
	isSaving = false,
	onSave,
}) => {
	const [value, setValue] = useState<string>(content || "");
	const [hasChanges, setHasChanges] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const highlighterRef = useRef<HTMLDivElement>(null);

	const language = getLanguageFromFileName(documentName);

	useEffect(() => {
		setValue(content || "");
		setHasChanges(false);
	}, [content]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setValue(e.target.value);
			setHasChanges(true);
		},
		[]
	);

	const handleSave = useCallback(() => {
		if (onSave) {
			onSave(value);
			setHasChanges(false);
		}
	}, [onSave, value]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				handleSave();
			}
			// Handle Tab for indentation
			if (e.key === "Tab") {
				e.preventDefault();
				const textarea = e.currentTarget;
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;
				const newValue =
					value.substring(0, start) + "\t" + value.substring(end);
				setValue(newValue);
				setHasChanges(true);
				// Set cursor position after the tab
				setTimeout(() => {
					textarea.selectionStart = textarea.selectionEnd = start + 1;
				}, 0);
			}
		},
		[handleSave, value]
	);

	// Sync scroll between textarea and highlighter
	const handleScroll = useCallback(() => {
		if (textareaRef.current && highlighterRef.current) {
			highlighterRef.current.scrollTop = textareaRef.current.scrollTop;
			highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft;
		}
	}, []);

	// Shared font styles for perfect alignment
	const sharedFontStyle: React.CSSProperties = {
		fontFamily:
			'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
		fontSize: "13px",
		lineHeight: "1.5",
		tabSize: 4,
	};

	// Custom style for the syntax highlighter
	const highlighterStyle: React.CSSProperties = {
		...sharedFontStyle,
		margin: 0,
		padding: "12px",
		paddingLeft: "calc(3.5em + 12px)", // Account for line numbers
		background: "#fafafa",
		borderRadius: 0,
		minHeight: "100%",
		whiteSpace: "pre",
		wordWrap: "normal",
		overflow: "hidden",
	};

	return (
		<div className="h-full w-full relative overflow-hidden bg-[#fafafa]">
			{/* Syntax highlighted background layer */}
			<div
				ref={highlighterRef}
				className="absolute inset-0 overflow-hidden pointer-events-none"
			>
				<SyntaxHighlighter
					customStyle={highlighterStyle}
					language={language}
					showLineNumbers
					lineNumberStyle={{
						minWidth: "3em",
						paddingRight: "1em",
						color: "#9ca3af",
						userSelect: "none",
						textAlign: "right",
					}}
					style={oneLight}
					wrapLines={false}
					wrapLongLines={false}
				>
					{value || " "}
				</SyntaxHighlighter>
			</div>

			{/* Transparent textarea for editing */}
			<textarea
				ref={textareaRef}
				className="absolute inset-0 w-full h-full resize-none outline-none bg-transparent text-transparent caret-gray-800 selection:bg-blue-200/70"
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onScroll={handleScroll}
				spellCheck={false}
				style={{
					...sharedFontStyle,
					padding: "12px",
					paddingLeft: "calc(3.5em + 12px)", // Match highlighter padding
					whiteSpace: "pre",
					wordWrap: "normal",
					overflow: "auto",
				}}
				value={value}
			/>

			<FloatingSaveIndicator
				hasChanges={hasChanges}
				isSaving={isSaving}
				onSave={handleSave}
			/>
		</div>
	);
};

export default CodeEditor;
