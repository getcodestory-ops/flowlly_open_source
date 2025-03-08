import { Image, Video, Headphones, FileText, File } from "lucide-react";
export const FileMediaIcon: React.FC<{ fileExt: string }> = ({ fileExt }) => {
	switch (fileExt) {
		case ".jpg":
		case ".jpeg":
		case ".png":
		case ".gif":
			return <Image />;
		case ".mp4":
		case ".webm":
			return <Video />;
		case ".mp3":
		case ".ogg":
		case ".wav":
			return <Headphones />;
		case ".txt":
		case ".pdf":
			return <FileText />;
		default:
			return <File />;
	}
};
