import React from "react";
import {
	FileText,
	Sheet,
	Image,
	Video,
	Music,
	Code,
	Archive,
	File,
	Braces,
	MonitorPlay,
} from "lucide-react";
import clsx from "clsx";

interface FileTypeIconProps {
	extension?: string;
	className?: string;
}

// Map of file extensions to icon components and colors
const getFileIconConfig = (ext: string): { icon: React.ElementType; color: string } => {
	const extension = ext?.toLowerCase().replace(".", "") || "";

	// PDF
	if (extension === "pdf") {
		return { icon: FileText, color: "text-red-500" };
	}

	// Word documents
	if (["doc", "docx", "odt", "rtf"].includes(extension)) {
		return { icon: FileText, color: "text-blue-600" };
	}

	// Excel/Spreadsheets
	if (["xls", "xlsx", "csv", "ods", "tsv"].includes(extension)) {
		return { icon: Sheet, color: "text-green-600" };
	}

	// PowerPoint/Presentations
	if (["ppt", "pptx", "odp"].includes(extension)) {
		return { icon: MonitorPlay, color: "text-orange-500" };
	}

	// Images
	if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico", "tiff", "tif", "heic"].includes(extension)) {
		return { icon: Image, color: "text-purple-500" };
	}

	// Videos
	if (["mp4", "webm", "avi", "mov", "mkv", "flv", "wmv", "m4v"].includes(extension)) {
		return { icon: Video, color: "text-pink-500" };
	}

	// Audio
	if (["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "oga"].includes(extension)) {
		return { icon: Music, color: "text-cyan-500" };
	}

	// Code files
	if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "h", "css", "scss", "html", "php", "rb", "go", "rs", "swift", "kt"].includes(extension)) {
		return { icon: Code, color: "text-yellow-600" };
	}

	// JSON/Config files
	if (["json", "jsonl", "yaml", "yml", "xml", "toml", "ini", "env"].includes(extension)) {
		return { icon: Braces, color: "text-amber-500" };
	}

	// Markdown/Text
	if (["md", "mdx", "txt", "text", "log"].includes(extension)) {
		return { icon: FileText, color: "text-gray-600" };
	}

	// Archives
	if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
		return { icon: Archive, color: "text-amber-600" };
	}

	// Email
	if (["eml", "msg"].includes(extension)) {
		return { icon: FileText, color: "text-blue-400" };
	}

	// E-books
	if (["epub", "mobi"].includes(extension)) {
		return { icon: FileText, color: "text-indigo-500" };
	}

	// Default
	return { icon: File, color: "text-gray-500" };
};

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ extension, className }) => {
	const { icon: Icon, color } = getFileIconConfig(extension || "");

	return <Icon className={clsx("h-5 w-5", color, className)} />;
};
