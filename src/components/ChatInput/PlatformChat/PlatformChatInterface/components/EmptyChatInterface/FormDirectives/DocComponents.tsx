import React, { useEffect } from "react";
import { FileText, X, Paperclip } from "lucide-react";
import clsx from "clsx";

// Color theme options
export type ColorTheme = "emerald" | "amber" | "rose" | "blue" | "slate" | "violet" | "indigo";

// Theme color mappings
const themeColors: Record<ColorTheme, { border: string; text: string; bg: string; hover: string }> = {
	emerald: {
		border: "border-emerald-400",
		text: "text-emerald-600",
		bg: "bg-emerald-50/50",
		hover: "hover:border-emerald-400 hover:text-emerald-600",
	},
	amber: {
		border: "border-amber-400",
		text: "text-amber-600",
		bg: "bg-amber-50/50",
		hover: "hover:border-amber-400 hover:text-amber-600",
	},
	rose: {
		border: "border-rose-400",
		text: "text-rose-600",
		bg: "bg-rose-50/50",
		hover: "hover:border-rose-400 hover:text-rose-600",
	},
	blue: {
		border: "border-blue-400",
		text: "text-blue-600",
		bg: "bg-blue-50/50",
		hover: "hover:border-blue-400 hover:text-blue-600",
	},
	slate: {
		border: "border-slate-400",
		text: "text-slate-600",
		bg: "bg-slate-50/50",
		hover: "hover:border-slate-400 hover:text-slate-600",
	},
	violet: {
		border: "border-violet-400",
		text: "text-violet-600",
		bg: "bg-violet-50/50",
		hover: "hover:border-violet-400 hover:text-violet-600",
	},
	indigo: {
		border: "border-indigo-400",
		text: "text-indigo-600",
		bg: "bg-indigo-50/50",
		hover: "hover:border-indigo-400 hover:text-indigo-600",
	},
};

// Document type
export interface DocItem {
	id: string;
	name: string;
	extension?: string;
}

// ============================================
// DocTextArea - Auto-expanding textarea
// ============================================
interface DocTextAreaProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	minHeight?: number;
	rows?: number;
}

export const DocTextArea = ({
	value,
	onChange,
	placeholder,
	disabled,
	className,
	minHeight = 28,
	rows = 1,
}: DocTextAreaProps): React.JSX.Element => {
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
		}
	}, [value, minHeight]);

	return (
		<textarea
			ref={textareaRef}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			disabled={disabled}
			className={clsx(
				"w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-500 focus:ring-0 outline-none resize-none overflow-hidden",
				"text-gray-800 placeholder:text-gray-400 py-1 px-0",
				"transition-colors duration-200",
				disabled && "opacity-50 cursor-not-allowed",
				className
			)}
			rows={rows}
		/>
	);
};

// ============================================
// DocInput - Single line input
// ============================================
interface DocInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	type?: string;
}

export const DocInput = ({
	value,
	onChange,
	placeholder,
	disabled,
	className,
	type = "text",
}: DocInputProps): React.JSX.Element => {
	return (
		<input
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			disabled={disabled}
			className={clsx(
				"w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-500 focus:ring-0 outline-none",
				"text-gray-800 placeholder:text-gray-400 py-1 px-0",
				"transition-colors duration-200",
				disabled && "opacity-50 cursor-not-allowed",
				className
			)}
		/>
	);
};

// ============================================
// DocRefButton - Document selection button
// ============================================
interface DocRefButtonProps {
	onClick: () => void;
	hasDocuments: boolean;
	disabled?: boolean;
	label?: string;
	colorTheme?: ColorTheme;
}

export const DocRefButton = ({
	onClick,
	hasDocuments,
	disabled,
	label = "Select document",
	colorTheme = "emerald",
}: DocRefButtonProps): React.JSX.Element => {
	const colors = themeColors[colorTheme];

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				"inline-flex items-center gap-1.5 px-2 py-0.5 text-sm border border-dashed rounded",
				"transition-colors duration-200",
				hasDocuments
					? `${colors.border} ${colors.text} ${colors.bg}`
					: `border-gray-400 text-gray-500 ${colors.hover}`,
				disabled && "opacity-50 cursor-not-allowed"
			)}
		>
			<Paperclip className="h-3.5 w-3.5" />
			<span>{label}</span>
		</button>
	);
};

// ============================================
// InlineDocRef - Display selected documents
// ============================================
interface InlineDocRefProps {
	documents: DocItem[];
	onRemove: (id: string) => void;
	disabled?: boolean;
	colorTheme?: ColorTheme;
	// Extended features for some forms
	showInstructions?: boolean;
	instructions?: Record<string, string>;
	onInstructionChange?: (id: string, value: string) => void;
	instructionPlaceholder?: string;
	// Layout variant
	layout?: "inline" | "stacked";
}

export const InlineDocRef = ({
	documents,
	onRemove,
	disabled,
	colorTheme = "emerald",
	showInstructions = false,
	instructions = {},
	onInstructionChange,
	instructionPlaceholder,
	layout = "inline",
}: InlineDocRefProps): React.JSX.Element | null => {
	if (documents.length === 0) return null;

	const colors = themeColors[colorTheme];

	// Stacked layout with optional instructions (like ReportWriting)
	if (layout === "stacked" || showInstructions) {
		return (
			<div className="space-y-3 mt-2">
				{documents.map((doc) => (
					<div key={doc.id} className="space-y-2">
						<span className={`inline-flex items-center gap-1 ${colors.text}`}>
							<FileText className="h-3.5 w-3.5 inline" />
							<span className="text-sm">{doc.name}</span>
							{!disabled && (
								<button
									onClick={() => onRemove(doc.id)}
									className="hover:text-red-500 transition-colors"
								>
									<X className="h-3 w-3" />
								</button>
							)}
						</span>
						{showInstructions && onInstructionChange && (
							<DocTextArea
								value={instructions[doc.id] || ""}
								onChange={(value) => onInstructionChange(doc.id, value)}
								placeholder={instructionPlaceholder || `Special instructions for ${doc.name}...`}
								disabled={disabled}
								className="text-sm"
							/>
						)}
					</div>
				))}
			</div>
		);
	}

	// Default inline layout
	return (
		<span className="inline-flex flex-wrap items-center gap-1 ml-2">
			{documents.map((doc, idx) => (
				<span key={doc.id} className={`inline-flex items-center gap-1 ${colors.text}`}>
					<FileText className="h-3.5 w-3.5 inline" />
					<span className="text-sm">{doc.name}</span>
					{!disabled && (
						<button
							onClick={() => onRemove(doc.id)}
							className="hover:text-red-500 transition-colors"
						>
							<X className="h-3 w-3" />
						</button>
					)}
					{idx < documents.length - 1 && <span className="text-gray-400">,</span>}
				</span>
			))}
		</span>
	);
};

