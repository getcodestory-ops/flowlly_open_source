import type { ReactNodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface CompoundDiffAttributes {
	originalContent: string;
	revisedContent: string;
	diffGroup?: string;
}

export default function CompoundDiffComponent(props: ReactNodeViewProps) {
	const { originalContent, revisedContent, diffGroup } = props.node.attrs;

	const handleAccept = () => {
		// Replace the entire diff node with just the revised content
		props.deleteNode();
		props.editor.commands.insertContent(revisedContent);
	};

	const handleReject = () => {
		// Replace the entire diff node with just the original content
		props.deleteNode();
		props.editor.commands.insertContent(originalContent);
	};

	return (
		<NodeViewWrapper className="compound-diff-component inline-block">
			<div className="group relative inline-block">
				{/* Original content (top) */}
				<div className="text-sm text-gray-700 bg-red-50 px-2 py-1 rounded mb-1 border-l-4 border-red-200">
					{originalContent}
				</div>
				{/* Revised content (bottom) */}
				<div className="text-sm text-gray-700 bg-green-50 px-2 py-1 rounded border-l-4 border-green-200">
					{revisedContent}
				</div>
				{/* Action buttons - appear on hover */}
				<div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
					<Button
						className="h-7 w-7 p-0 hover:bg-green-200 bg-white border border-green-300 shadow-sm"
						onClick={handleAccept}
						size="sm"
						title="Accept revision"
						variant="ghost"
					>
						<Check className="h-3 w-3 text-green-600" />
					</Button>
					<Button
						className="h-7 w-7 p-0 hover:bg-red-200 bg-white border border-red-300 shadow-sm"
						onClick={handleReject}
						size="sm"
						title="Reject revision"
						variant="ghost"
					>
						<X className="h-3 w-3 text-red-600" />
					</Button>
				</div>
			</div>
		</NodeViewWrapper>
	);
} 