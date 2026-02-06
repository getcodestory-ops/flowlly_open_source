import React from "react";
import fileIconPaths from "@/utils/fileIcons";
import { cn } from "@/lib/utils";

// Icon key type from fileIcons
export type IconKey = keyof typeof fileIconPaths;

// File config interface
export interface FileConfig {
	iconKey: IconKey;
	color: string;
	bg: string;
	border?: string;
	label?: string;
}

// Custom file icon SVG component
export const FileIconSvg: React.FC<{ iconKey: IconKey; className?: string }> = ({ iconKey, className }) => (
	<svg 
		className={className}
		fill="currentColor" 
		viewBox="4 0 36 36"
		xmlns="http://www.w3.org/2000/svg"
	>
		{fileIconPaths[iconKey]}
	</svg>
);

// File type configuration with colors and custom icons
export const getFileConfig = (extension: string): FileConfig => {
	const ext = extension?.toLowerCase().replace(".", "") || "";
	
	// Images
	if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico", "tiff", "tif", "heic"].includes(ext)) {
		return { iconKey: "image", color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200", label: "Image" };
	}
	// PDF
	if (["pdf"].includes(ext)) {
		return { iconKey: "acrobat", color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200", label: "PDF" };
	}
	// Microsoft Word
	if (["doc", "docx"].includes(ext)) {
		return { iconKey: "word", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", label: "Word" };
	}
	// Plain text
	if (["txt", "text", "log"].includes(ext)) {
		return { iconKey: "text", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", label: "Text" };
	}
	// Markdown
	if (["md", "mdx", "markdown"].includes(ext)) {
		return { iconKey: "markdown", color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-200", label: "Markdown" };
	}
	// Other documents
	if (["rtf", "odt", "pages"].includes(ext)) {
		return { iconKey: "document", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", label: "Document" };
	}
	// Microsoft PowerPoint
	if (["ppt", "pptx"].includes(ext)) {
		return { iconKey: "powerpoint", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200", label: "PowerPoint" };
	}
	// Other presentations
	if (["key", "odp"].includes(ext)) {
		return { iconKey: "presentation", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200", label: "Slides" };
	}
	// Microsoft Excel
	if (["xls", "xlsx"].includes(ext)) {
		return { iconKey: "excel", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", label: "Excel" };
	}
	// Other spreadsheets
	if (["csv", "numbers", "ods", "tsv"].includes(ext)) {
		return { iconKey: "spreadsheet", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", label: "Spreadsheet" };
	}
	// Microsoft OneNote
	if (["one", "onetoc2"].includes(ext)) {
		return { iconKey: "onenote", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200", label: "OneNote" };
	}
	// Outlook/Email
	if (["msg", "eml", "pst", "ost"].includes(ext)) {
		return { iconKey: "outlook", color: "text-sky-600", bg: "bg-sky-100", border: "border-sky-200", label: "Email" };
	}
	// Archives
	if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) {
		return { iconKey: "compressed", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200", label: "Archive" };
	}
	// Code files
	if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "h", "cs", "go", "rs", "rb", "php", "swift", "kt", "html", "htm", "css", "scss", "less", "sql", "sh", "bash"].includes(ext)) {
		return { iconKey: "code", color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-200", label: "Code" };
	}
	// JSON/Config files
	if (["json", "jsonl", "toml", "ini", "env", "config", "yaml", "yml", "xml", "template", "database"].includes(ext)) {
		return { iconKey: "settings", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200", label: "Config" };
	}
	// Video files
	if (["mp4", "mov", "avi", "mkv", "webm", "wmv", "flv", "m4v"].includes(ext)) {
		return { iconKey: "video", color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-200", label: "Video" };
	}
	// Audio files
	if (["mp3", "wav", "ogg", "oga", "flac", "aac", "m4a", "wma"].includes(ext)) {
		return { iconKey: "audio", color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200", label: "Audio" };
	}
	// Font files
	if (["ttf", "otf", "woff", "woff2", "eot"].includes(ext)) {
		return { iconKey: "font", color: "text-fuchsia-600", bg: "bg-fuchsia-100", border: "border-fuchsia-200", label: "Font" };
	}
	// 3D files
	if (["obj", "fbx", "gltf", "glb", "stl", "3ds", "blend"].includes(ext)) {
		return { iconKey: "3d", color: "text-teal-600", bg: "bg-teal-100", border: "border-teal-200", label: "3D" };
	}
	// Vector files
	if (["ai", "eps", "sketch", "fig"].includes(ext)) {
		return { iconKey: "vector", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200", label: "Vector" };
	}
	// Excalidraw files
	if (["excalidraw"].includes(ext)) {
		return { iconKey: "excalidraw", color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200", label: "Excalidraw" };
	}
	// Binary/Executable
	if (["exe", "dll", "bin", "dat", "dmg", "iso"].includes(ext)) {
		return { iconKey: "binary", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", label: "Binary" };
	}
	// Android
	if (["apk", "aab"].includes(ext)) {
		return { iconKey: "android", color: "text-green-600", bg: "bg-green-100", border: "border-green-200", label: "Android" };
	}
	// E-books
	if (["epub", "mobi"].includes(ext)) {
		return { iconKey: "document", color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200", label: "E-book" };
	}
	// Default
	return { iconKey: "document", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", label: "File" };
};

// Size classes for icons
export const iconSizeClasses = {
	xs: { container: "w-4 h-4", icon: "h-4 w-4" },
	sm: { container: "w-5 h-5", icon: "h-5 w-5" },
	md: { container: "w-6 h-6", icon: "h-6 w-6" },
	lg: { container: "w-8 h-8", icon: "h-8 w-8" },
	xl: { container: "w-10 h-10", icon: "h-10 w-10" },
};

export type IconSize = keyof typeof iconSizeClasses;

// Reusable FileIcon component with optional background
interface FileIconProps {
	extension?: string;
	className?: string;
	showBackground?: boolean;
	size?: IconSize;
}

export const FileIcon: React.FC<FileIconProps> = ({ 
	extension = "", 
	className,
	showBackground = true,
	size = "sm",
}) => {
	const config = getFileConfig(extension);
	const sizes = iconSizeClasses[size];

	if (showBackground) {
		return (
			<div className={cn(
				"flex items-center justify-center rounded",
				sizes.container,
				config.bg,
				config.color,
				className
			)}>
				<FileIconSvg className={sizes.icon} iconKey={config.iconKey} />
			</div>
		);
	}

	return <FileIconSvg className={cn(sizes.icon, config.color, className)} iconKey={config.iconKey} />;
};

// Folder icon component for consistency
interface FolderIconProps {
	isOpen?: boolean;
	className?: string;
	size?: IconSize;
}

export const FolderIcon: React.FC<FolderIconProps> = ({ 
	isOpen = false, 
	className,
	size = "sm",
}) => {
	const sizes = iconSizeClasses[size];
	
	return (
		<div className={cn(
			"flex items-center justify-center rounded",
			sizes.container,
			isOpen ? "bg-blue-200" : "bg-blue-100",
			"text-blue-600",
			className
		)}>
			{isOpen ? (
				<svg className={sizes.icon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
					<path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			) : (
				<svg className={sizes.icon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
					<path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			)}
		</div>
	);
};

