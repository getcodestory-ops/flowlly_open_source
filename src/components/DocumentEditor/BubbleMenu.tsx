import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";

interface BubbleMenuProps {
  editor: Editor;
  onCreateComment: (commentText: string) => void;
}

const EditorBubbleMenu: React.FC<BubbleMenuProps> = ({ editor, onCreateComment }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [showCommentInput, setShowCommentInput] = useState(false);
	const [commentText, setCommentText] = useState("");
	const bubbleRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (!editor) return;

		const updateBubbleMenu = () => {
			const { selection } = editor.state;
			const { from, to } = selection;

			// Show bubble menu only when text is selected
			if (from !== to) {
				const { view } = editor;
				const start = view.coordsAtPos(from);
				const end = view.coordsAtPos(to);

				const selectionBounds = {
					left: Math.min(start.left, end.left),
					right: Math.max(start.right, end.right),
					top: Math.min(start.top, end.top),
					bottom: Math.max(start.bottom, end.bottom),
				};

				setPosition({
					top: selectionBounds.top - 50, // Position above selection
					left: selectionBounds.left + (selectionBounds.right - selectionBounds.left) / 2 - 150, // Center horizontally
				});
				setIsVisible(true);
			} else {
				setIsVisible(false);
				setShowCommentInput(false);
				setCommentText("");
			}
		};

		editor.on("selectionUpdate", updateBubbleMenu);
		editor.on("transaction", updateBubbleMenu);

		return () => {
			editor.off("selectionUpdate", updateBubbleMenu);
			editor.off("transaction", updateBubbleMenu);
		};
	}, [editor]);

	// Focus textarea when comment input is shown
	useEffect(() => {
		if (showCommentInput && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [showCommentInput]);

	const handleCommentClick = () => {
		setShowCommentInput(true);
	};

	const handleSubmitComment = () => {
		if (commentText.trim()) {
			onCreateComment(commentText.trim());
			setCommentText("");
			setShowCommentInput(false);
		}
	};

	const handleCancelComment = () => {
		setCommentText("");
		setShowCommentInput(false);
	};

	if (!editor || !isVisible) {
		return null;
	}

	return (
		<div
			className="flex flex-col gap-2 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
			ref={bubbleRef}
			style={{
				position: "fixed",
				top: `${position.top}px`,
				left: `${position.left}px`,
				zIndex: 9999,
				minWidth: showCommentInput ? "300px" : "200px",
			}}
		>
			{!showCommentInput ? (
				<div className="flex items-center gap-2">
					{/* Format buttons */}
					<button
						className={`p-2 rounded hover:bg-gray-100 ${
							editor.isActive("bold") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleBold()
							.run()}
						type="button"
					>
						<strong>B</strong>
					</button>
					<button
						className={`p-2 rounded hover:bg-gray-100 ${
							editor.isActive("italic") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleItalic()
							.run()}
						type="button"
					>
						<em>I</em>
					</button>
					<button
						className={`p-2 rounded hover:bg-gray-100 ${
							editor.isActive("underline") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleUnderline()
							.run()}
						type="button"
					>
						<u>U</u>
					</button>
					<div className="w-px h-6 bg-gray-300 mx-1" />
					<button
						className="flex items-center gap-1 p-2 rounded hover:bg-blue-100 text-blue-600 font-medium"
						onClick={handleCommentClick}
						title="Add Comment"
						type="button"
					>
						<svg 
							fill="none" 
							height="16" 
							stroke="currentColor" 
							strokeWidth="2" 
							viewBox="0 0 24 24" 
							width="16"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
						</svg>
						Comment
					</button>
				</div>
			) : (
				<div className="space-y-2">
					<div className="text-sm font-medium text-gray-700">Add Comment</div>
					<Textarea
						className="min-h-[60px] text-sm"
						onChange={(e) => setCommentText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
								e.preventDefault();
								handleSubmitComment();
							}
							if (e.key === "Escape") {
								e.preventDefault();
								handleCancelComment();
							}
						}}
						placeholder="Write your comment..."
						ref={textareaRef}
						value={commentText}
					/>
					<div className="flex gap-2">
						<Button 
							disabled={!commentText.trim()} 
							onClick={handleSubmitComment}
							size="sm"
						>
							Add Comment
						</Button>
						<Button 
							onClick={handleCancelComment}
							size="sm"
							variant="outline"
						>
							Cancel
						</Button>
					</div>
					<div className="text-xs text-gray-500">
						Press Ctrl+Enter to submit, Esc to cancel
					</div>
				</div>
			)}
		</div>
	);
};

export default EditorBubbleMenu; 