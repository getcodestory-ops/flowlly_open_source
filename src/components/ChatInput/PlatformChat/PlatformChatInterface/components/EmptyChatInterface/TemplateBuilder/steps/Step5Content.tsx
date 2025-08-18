import React from "react";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";

interface Props {
	initialContent: string;
	editorHtml: string;
	onChange: (html: string) => void;
}

export default function Step5Content({ initialContent, editorHtml, onChange }: Props): React.JSX.Element {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-900 ">Report content</h2>
				<p className="text-gray-600">Write each section and explain in detail, how AI should write the section.</p>
				<div className=" rounded-lg overflow-hidden mt-4">
					<ContentEditor
						content={initialContent}
						setContent={(html: string) => onChange(html)}
					/>
				</div>
			</div>
		</div>
	);
}


