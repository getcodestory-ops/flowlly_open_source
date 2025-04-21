import { getEventResourceDashboard } from "@/api/eventResourceRoutes";
import { useStore } from "@/utils/store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { DiffStyleExtension } from "@/components/DocumentEditor/extensions/DiffStyleExtension";
import EditorProvider from "../DocumentEditor/EditorProvider";
import { Markdown } from "tiptap-markdown";
import Image from "@tiptap/extension-image";
import PropTypes from "prop-types";
import  ContentEditor  from "../DocumentEditor/ContentEditor";

const SimpleDocumentEditor: React.FC<{ content: string }> = ({ content }) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Markdown.configure({
				html: true,
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Image.configure({
				allowBase64: true,
				inline: true,
			}),
		],
		content: content || "",
		editable: false,
		immediatelyRender: false,
	});

	return (<>
		{editor && <EditorProvider editor={editor} />}
	</>
	);
};

SimpleDocumentEditor.propTypes = {
	content: PropTypes.string.isRequired,
};

export const DashboardViewer = ({ resourceId }: {resourceId: string}) => {
	const { session, activeProject } = useStore();
	const [dashboard, setDashboard] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const generateDashboard = async() => {
		if (resourceId && session && activeProject) {
			setIsLoading(true);
			try {
				const dashboardContent = await getEventResourceDashboard(session, activeProject?.project_id, resourceId);
				setDashboard(dashboardContent);
			} catch (error) {
				console.error("Error generating dashboard:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<div className="space-y-4">
			<Button 
				disabled={isLoading || !resourceId || !session || !activeProject} 
				onClick={generateDashboard}
			>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Generating Dashboard...
					</>
				) : (
					"Generate Dashboard"
				)}
			</Button>	
			{dashboard && <SimpleDocumentEditor content={dashboard} />}
		</div>
	);
};

export default DashboardViewer;