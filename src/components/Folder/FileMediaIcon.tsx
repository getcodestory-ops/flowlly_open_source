import { Image, Video, Headphones, FileText, File } from "lucide-react";
export const FileMediaIcon: React.FC<{ fileExt: string }> = ({ fileExt }) => {
	switch (fileExt) {
		case ".jpg":
		case ".jpeg":
		case ".png":
		case ".gif":
			return <Image className="w-4 h-4" />;
		case ".mp4":
		case ".webm":
			return <Video className="w-4 h-4" />;
		case ".mp3":
		case ".ogg":
		case ".wav":
			return <Headphones className="w-4 h-4" />;
		case ".txt":
		case ".pdf":
			return <FileText className="w-4 h-4" />;
		default:
			return <File className="w-4 h-4" />;
	}
};
