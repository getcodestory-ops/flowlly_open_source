"use client";

import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import FloatingSaveIndicator from "./FloatingSaveIndicator";

interface CodeEditorProps {
	content: string;
	documentName?: string;
	isSaving?: boolean;
	onSave?: (updated: string) => void;
}

// Fixed gutter width for line numbers
const LINE_GUTTER_WIDTH = "4em";

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
	const lineNumberRef = useRef<HTMLDivElement>(null);

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

	// Sync vertical scroll between textarea, highlighter, and line numbers
	// (horizontal scroll is eliminated by word-wrapping)
	const handleScroll = useCallback(() => {
		if (textareaRef.current) {
			const { scrollTop } = textareaRef.current;
			if (highlighterRef.current) {
				highlighterRef.current.scrollTop = scrollTop;
			}
			if (lineNumberRef.current) {
				lineNumberRef.current.scrollTop = scrollTop;
			}
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

	// Compute line count for the gutter
	const lineCount = useMemo(() => {
		return (value || " ").split("\n").length;
	}, [value]);

	// Both layers share this left padding so code text starts at the same x-position
	const codePaddingLeft = `calc(${LINE_GUTTER_WIDTH} + 12px)`;

	// Custom style for the syntax highlighter (line numbers rendered separately)
	const highlighterStyle: React.CSSProperties = {
		...sharedFontStyle,
		margin: 0,
		padding: "12px",
		paddingLeft: codePaddingLeft,
		background: "transparent",
		borderRadius: 0,
		minHeight: "100%",
		whiteSpace: "pre-wrap",
		wordWrap: "break-word",
		overflowWrap: "break-word",
		overflowX: "hidden",
		overflowY: "hidden",
	};

	return (
		<div className="h-full w-full relative overflow-hidden bg-[#fafafa]">
			{/* Line numbers gutter — independent layer, syncs vertical scroll */}
			<div
				ref={lineNumberRef}
				className="absolute top-0 left-0 bottom-0 overflow-hidden pointer-events-none select-none z-10"
				style={{
					width: LINE_GUTTER_WIDTH,
					backgroundColor: "#fafafa",
				}}
			>
				<div
					style={{
						...sharedFontStyle,
						padding: "12px 0",
					}}
				>
					{Array.from({ length: lineCount }, (_, i) => (
						<div
							key={i}
							style={{
								textAlign: "right",
								paddingRight: "0.75em",
								color: "#9ca3af",
							}}
						>
							{i + 1}
						</div>
					))}
				</div>
			</div>

			{/* Syntax highlighted background layer */}
			<div
				ref={highlighterRef}
				className="absolute inset-0 overflow-hidden pointer-events-none"
			>
				<SyntaxHighlighter
					customStyle={highlighterStyle}
					codeTagProps={{
						style: {
							...sharedFontStyle,
							whiteSpace: "pre-wrap",
							wordWrap: "break-word",
							overflowWrap: "break-word",
							padding: 0,
							margin: 0,
							background: "transparent",
						},
					}}
					language={language}
					style={oneLight}
					wrapLines
					wrapLongLines
				>
					{value || " "}
				</SyntaxHighlighter>
			</div>

			{/* Transparent textarea for editing — identical padding as highlighter */}
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
					paddingLeft: codePaddingLeft,
					whiteSpace: "pre-wrap",
					wordWrap: "break-word",
					overflowWrap: "break-word",
					overflowX: "hidden",
					overflowY: "auto",
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
