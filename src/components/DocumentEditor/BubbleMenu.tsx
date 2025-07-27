import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BubbleMenuProps {
  editor: Editor;
  onCreateComment: (commentText: string) => void;
}

const EditorBubbleMenu: React.FC<BubbleMenuProps> = ({ editor, onCreateComment }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [showCommentInput, setShowCommentInput] = useState(false);
	const [commentText, setCommentText] = useState("");
	const [hasSelection, setHasSelection] = useState(false);
	const [isHoveringSelection, setIsHoveringSelection] = useState(false);
	const [isHoveringBubble, setIsHoveringBubble] = useState(false);
	const bubbleRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Update visibility based on hover states with delay
	useEffect(() => {
		const shouldShow = hasSelection && (isHoveringSelection || isHoveringBubble || showCommentInput);
		
		if (shouldShow) {
			// Clear any existing timeout and show immediately
			if (selectionTimeoutRef.current) {
				clearTimeout(selectionTimeoutRef.current);
				selectionTimeoutRef.current = null;
			}
			setIsVisible(true);
		} else {
			// Add a small delay before hiding to allow mouse movement to bubble
			if (selectionTimeoutRef.current) {
				clearTimeout(selectionTimeoutRef.current);
			}
			selectionTimeoutRef.current = setTimeout(() => {
				setIsVisible(false);
			}, 150); // 150ms delay
		}
	}, [hasSelection, isHoveringSelection, isHoveringBubble, showCommentInput]);

	useEffect(() => {
		if (!editor) return;

		const updateBubbleMenu = () => {
			const { selection } = editor.state;
			const { from, to } = selection;

			// Check if there's a text selection
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
					top: selectionBounds.top - 45, // Position close above selection
					left: selectionBounds.left + (selectionBounds.right - selectionBounds.left) / 2 - 100, // Center horizontally
				});
				setHasSelection(true);
			} else {
				setHasSelection(false);
				setIsHoveringSelection(false);
				setShowCommentInput(false);
				setCommentText("");
			}
		};

		// Add mouse event listeners to editor
		const handleMouseMove = (event: MouseEvent) => {
			if (!hasSelection) return;

			const { selection } = editor.state;
			const { from, to } = selection;

			if (from === to) return;

			// Check if mouse is over selected text
			const { view } = editor;
			const domRange = view.domAtPos(from);
			const range = document.createRange();
			
			try {
				range.setStart(domRange.node, domRange.offset);
				const endDom = view.domAtPos(to);
				range.setEnd(endDom.node, endDom.offset);
				
				const rects = range.getClientRects();
				let isOverSelection = false;
				
				for (let i = 0; i < rects.length; i++) {
					const rect = rects[i];
					if (
						event.clientX >= rect.left &&
						event.clientX <= rect.right &&
						event.clientY >= rect.top &&
						event.clientY <= rect.bottom
					) {
						isOverSelection = true;
						break;
					}
				}
				
				setIsHoveringSelection(isOverSelection);
			} catch (error) {
				// Fallback: assume not hovering if there's an error
				setIsHoveringSelection(false);
			}
		};

		const editorElement = editor.view.dom;
		editorElement.addEventListener("mousemove", handleMouseMove);
		
		editor.on("selectionUpdate", updateBubbleMenu);
		editor.on("transaction", updateBubbleMenu);

		return () => {
			editorElement.removeEventListener("mousemove", handleMouseMove);
			editor.off("selectionUpdate", updateBubbleMenu);
			editor.off("transaction", updateBubbleMenu);
			// Clean up timeout on unmount
			if (selectionTimeoutRef.current) {
				clearTimeout(selectionTimeoutRef.current);
			}
		};
	}, [editor, hasSelection]);

	// Focus textarea when comment input is shown
	useEffect(() => {
		if (showCommentInput && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [showCommentInput]);

	// Handle bubble menu hover
	const handleBubbleMouseEnter = () => {
		setIsHoveringBubble(true);
	};

	const handleBubbleMouseLeave = () => {
		setIsHoveringBubble(false);
	};

	const handleCommentClick = () => {
		setShowCommentInput(true);
	};

	const handleSubmitComment = () => {
		if (commentText.trim()) {
			onCreateComment(commentText.trim());
			setCommentText("");
			setShowCommentInput(false);
			// Clear the selection to hide the bubble menu after comment submission
			editor.commands.setTextSelection(editor.state.selection.to);
		}
	};

	const handleCancelComment = () => {
		setCommentText("");
		setShowCommentInput(false);
		// Clear the selection to hide the bubble menu after canceling
		editor.commands.setTextSelection(editor.state.selection.to);
	};

	if (!editor || !isVisible) {
		return null;
	}

	return (
		<div
			className="flex flex-col gap-1 p-1 bg-white border border-gray-300 rounded-md shadow-lg z-50"
			onMouseEnter={handleBubbleMouseEnter}
			onMouseLeave={handleBubbleMouseLeave}
			ref={bubbleRef}
			style={{
				position: "fixed",
				top: `${position.top}px`,
				left: `${position.left}px`,
				zIndex: 9999,
				minWidth: showCommentInput ? "280px" : "auto",
			}}
		>
			{!showCommentInput ? (
				<div className="flex items-center gap-1">
					{/* Format buttons */}
					<button
						className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
							editor.isActive("bold") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleBold()
							.run()}
						title="Bold"
						type="button"
					>
						<strong>B</strong>
					</button>
					<button
						className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
							editor.isActive("italic") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleItalic()
							.run()}
						title="Italic"
						type="button"
					>
						<em>I</em>
					</button>
					<button
						className={`p-1.5 rounded text-sm hover:bg-gray-100 ${
							editor.isActive("underline") ? "bg-gray-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleUnderline()
							.run()}
						title="Underline"
						type="button"
					>
						<u>U</u>
					</button>
					<button
						className={`p-1.5 rounded text-xs hover:bg-yellow-100 ${
							editor.isActive("highlight") ? "bg-yellow-200" : ""
						}`}
						onClick={() => editor.chain().focus()
							.toggleHighlight()
							.run()}
						title="Highlight"
						type="button"
					>
						<span className="bg-yellow-300 px-1 rounded">H</span>
					</button>
					<div className="w-px h-4 bg-gray-300 mx-0.5" />
					<button
						className="flex items-center gap-1 p-1.5 rounded hover:bg-blue-100 text-blue-600 text-xs font-medium"
						onClick={handleCommentClick}
						title="Add Comment"
						type="button"
					>
						<svg 
							fill="none" 
							height="12" 
							stroke="currentColor" 
							strokeWidth="2" 
							viewBox="0 0 24 24" 
							width="12"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
						</svg>
						Comment
					</button>
				</div>
			) : (
				<div className="space-y-2 p-2">
					<div className="text-sm font-medium text-gray-700">Add Comment</div>
					<Textarea
						className="min-h-[50px] text-sm"
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