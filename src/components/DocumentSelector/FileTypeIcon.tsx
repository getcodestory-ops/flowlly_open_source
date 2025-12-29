import React from "react";
import { cn } from "@/lib/utils";
import { FileIconSvg, getFileConfig, iconSizeClasses, type IconSize } from "@/utils/fileIconConfig";

interface FileTypeIconProps {
	extension?: string;
	className?: string;
	showBackground?: boolean;
	size?: IconSize;
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ 
	extension, 
	className,
	showBackground = true,
	size = "sm",
}) => {
	const config = getFileConfig(extension || "");
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

// Re-export for backwards compatibility
export { getFileConfig } from "@/utils/fileIconConfig";
