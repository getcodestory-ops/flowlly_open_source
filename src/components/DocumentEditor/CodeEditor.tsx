import React from "react";

interface CodeEditorProps {
  content: string;
  documentName?: string;
  isSaving?: boolean;
  onSave?: (updated: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ content, documentName, isSaving = false, onSave }) => {
	const [value, setValue] = React.useState<string>(content || "");

	React.useEffect(() => {
		setValue(content || "");
	}, [content]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
			e.preventDefault();
			if (onSave) onSave(value);
		}
	};

	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
				<div className="text-sm text-gray-600 truncate">{documentName || "Code"}</div>
				<button
					className="text-xs px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
					disabled={isSaving}
					onClick={() => onSave && onSave(value)}
					type="button"
				>
					{isSaving ? "Saving..." : "Save"}
				</button>
			</div>
			<textarea
				className="flex-1 font-mono text-sm p-3 outline-none resize-none"
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				spellCheck={false}
				value={value}
				wrap="off"
			/>
		</div>
	);
};

export default CodeEditor;


