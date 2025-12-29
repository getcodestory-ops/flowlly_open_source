import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";
import { cn } from "@/lib/utils";

interface FileMediaIconProps {
	fileExt: string;
	className?: string;
	showBackground?: boolean;
	size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
	xs: { container: "w-4 h-4", icon: "h-4 w-4" },
	sm: { container: "w-5 h-5", icon: "h-5 w-5" },
	md: { container: "w-6 h-6", icon: "h-6 w-6" },
	lg: { container: "w-8 h-8", icon: "h-8 w-8" },
};

export const FileMediaIcon: React.FC<FileMediaIconProps> = ({ 
	fileExt, 
	className,
	showBackground = false,
	size = "xs",
}) => {
	// Clean up extension (remove leading dot if present)
	const ext = fileExt.replace(/^\./, "");
	const config = getFileConfig(ext);
	const sizes = sizeClasses[size];

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
