import PlatformChatComponent from "@/components/ChatInput/PlatformChat/PlatformChatComponent";
import EditorProvider from "../EditorProvider";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { TextAlign } from "@tiptap/extension-text-align";
import { DiffStyleExtension } from "@/components/DocumentEditor/extensions/DiffStyleExtension";


interface AIEditorLayoutProps {
    chatTarget: "editor" | "workflow" | "schedule" | "project" | "agent" | "folder",
    folderId: string,
    folderName: string,
    onContentUpdate?: (content: string) => void,
    content?: string,
}

const AIEditorLayout = ({
	chatTarget,
	folderId,
	folderName,
	onContentUpdate,
	content = "",
}: AIEditorLayoutProps): React.ReactNode => {
	const editorInstance = useEditor({
		extensions: [
			StarterKit,
			Markdown.configure({
				html: true,
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			DiffStyleExtension.configure({
				showDiffButtons: true,
			}),
		],
		content: content,
		editable: false,
		onUpdate: ({ editor }) => {
			if (onContentUpdate) onContentUpdate(editor.getHTML());
		},
	});

	const handleContentUpdate = (content: string) => {
		if (editorInstance) {
			editorInstance.commands.setContent(content);
			if (onContentUpdate) onContentUpdate(content);
		}
	};
    
	return (
		<div className="grid grid-cols-12">
			<div className="col-span-6 prose-p:text-sm h-[99vh]">
				{editorInstance && <EditorProvider editor={editorInstance} />}
			</div>
			<div className="col-span-6">
				<PlatformChatComponent
					chatTarget={chatTarget}
					folderId={folderId}
					folderName={folderName}
					onContentUpdate={handleContentUpdate}
				/>
			</div>
		</div>
	);
};

export default AIEditorLayout;
